import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../../../shared/redis';
import { PrismaService } from '../../../shared/prisma.service';
import { ReserveTicketDto } from '../dtos/reserve-ticket.dto';

const RESERVE_TICKET_LUA = `
local category_key = KEYS[1]
local user_key = KEYS[2]
local quantity = tonumber(ARGV[1])
local category_id = ARGV[2]
local fallback_max_per_user = tonumber(ARGV[3])

-- 1. Check if category exists
local exists = redis.call('EXISTS', category_key)
if exists == 0 then
    return {"ERR_NOT_INITIALIZED"}
end

-- 2. Get available tickets
local available = tonumber(redis.call('HGET', category_key, 'available') or "0")
if available < quantity then
    return {"ERR_NO_TICKET", tostring(available)}
end

-- 3. Check user limit
local current_reserved = tonumber(redis.call('HGET', user_key, category_id) or "0")
local limit = tonumber(redis.call('HGET', category_key, 'max_per_user') or tostring(fallback_max_per_user))

if current_reserved + quantity > limit then
    return {"ERR_LIMIT_EXCEEDED", tostring(current_reserved)}
end

-- 4. Deduct and increment
redis.call('HINCRBY', category_key, 'available', -quantity)
redis.call('HINCRBY', user_key, category_id, quantity)

return {"OK", tostring(available - quantity), tostring(current_reserved + quantity)}
`;

@Injectable()
export class TicketingService implements OnModuleInit {
    private readonly logger = new Logger(TicketingService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly prisma: PrismaService,
    ) { }

    async onModuleInit() {
        try {
            await this.warmUpActiveConcertCaches();
        } catch (error) {
            this.logger.error('Failed to warm up active concert caches on startup', error);
        }
    }

    async warmUpActiveConcertCaches() {
        const client = this.redisService.getClient();
        if (!client || !client.isOpen) {
            this.logger.warn('Redis is not available, skipping startup cache warm-up');
            return;
        }

        const categories = await this.prisma.ticketCategory.findMany({
            where: {
                concert: {
                    status: 'PUBLISHED',
                },
            },
        });

        this.logger.log(`[Redis Warmup] Found ${categories.length} active ticket categories to warm up`);

        for (const cat of categories) {
            const key = `category:${cat.id}`;
            const exists = await client.exists(key);
            if (!exists) {
                await client.hSet(key, {
                    available: cat.total_quantity.toString(),
                    max_per_user: cat.max_per_user.toString(),
                });
                this.logger.log(`[Redis Warmup] Initialized category ${cat.id} (${cat.name}) with available: ${cat.total_quantity}, max_per_user: ${cat.max_per_user}`);
            } else {
                this.logger.log(`[Redis Warmup] Category ${cat.id} is already initialized on Redis`);
            }
        }
    }

    async reserveTicket(userId: string, dto: ReserveTicketDto) {
        const { category_id, quantity } = dto;
        const categoryKey = `category:${category_id}`;
        const userKey = `user:${userId}:reservations`;

        const result = await this.redisService.runLuaScript(
            RESERVE_TICKET_LUA,
            [categoryKey, userKey],
            [quantity.toString(), category_id, '100']
        );

        if (!Array.isArray(result) || result.length === 0) {
            throw new BadRequestException('Unexpected response from reservation engine');
        }

        const status = result[0];
        if (status === 'ERR_NOT_INITIALIZED') {
            throw new BadRequestException('ERR_NOT_INITIALIZED');
        }
        if (status === 'ERR_NO_TICKET') {
            throw new BadRequestException('ERR_NO_TICKET');
        }
        if (status === 'ERR_LIMIT_EXCEEDED') {
            throw new BadRequestException('ERR_LIMIT_EXCEEDED');
        }

        if (status === 'OK') {
            return {
                status: 'SUCCESS',
                category_id,
                quantity,
                remaining: parseInt(result[1], 10),
                user_reserved: parseInt(result[2], 10),
            };
        }

        throw new BadRequestException('Unknown reservation error');
    }

    async seedCategoryInventory(categoryId: string, available: number, maxPerUser: number): Promise<void> {
        const client = this.redisService.getClient();
        if (!client || !client.isOpen) {
            throw new Error('Redis is not available');
        }
        const key = `category:${categoryId}`;
        await client.hSet(key, {
            available: available.toString(),
            max_per_user: maxPerUser.toString(),
        });
        this.logger.log(`Seeded category ${categoryId} with available: ${available}, max_per_user: ${maxPerUser}`);
    }

    async getCategoryInventory(categoryId: string) {
        const client = this.redisService.getClient();
        if (!client || !client.isOpen) {
            return null;
        }
        const data = await client.hGetAll(`category:${categoryId}`);
        if (!data || Object.keys(data).length === 0) {
            return null;
        }
        return {
            available: parseInt(data.available, 10),
            max_per_user: parseInt(data.max_per_user, 10),
        };
    }

    async getUserReservations(userId: string) {
        const client = this.redisService.getClient();
        if (!client || !client.isOpen) {
            return {};
        }
        const data = await client.hGetAll(`user:${userId}:reservations`);
        const result: Record<string, number> = {};
        for (const [key, val] of Object.entries(data)) {
            result[key] = parseInt(val, 10);
        }
        return result;
    }
}