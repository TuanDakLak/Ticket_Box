import { BadRequestException, Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../../../shared/redis';
import { PrismaService } from '../../../shared/prisma.service';
import { RabbitMqService } from '../../../shared/rabbitmq';
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

const ROLLBACK_TICKET_LUA = `
local category_key = KEYS[1]
local user_key = KEYS[2]
local quantity = tonumber(ARGV[1])
local category_id = ARGV[2]

-- 1. Restore available tickets
redis.call('HINCRBY', category_key, 'available', quantity)

-- 2. Decrement user reservations
local new_val = redis.call('HINCRBY', user_key, category_id, -quantity)
if new_val <= 0 then
    redis.call('HDEL', user_key, category_id)
end

return {"ROLLED_BACK"}
`;

@Injectable()
export class TicketingService implements OnModuleInit {
    private readonly logger = new Logger(TicketingService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly prisma: PrismaService,
        private readonly rabbitMqService: RabbitMqService,
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
                // Count sold tickets
                const soldCount = await this.prisma.ticket.count({
                    where: { category_id: cat.id },
                });

                // Count pending unexpired tickets
                const pendingOrders = await this.prisma.order.findMany({
                    where: {
                        status: 'PENDING',
                        expires_at: {
                            gt: new Date(),
                        },
                    },
                });

                let pendingCount = 0;
                for (const order of pendingOrders) {
                    const metadata = order.ticket_metadata as any;
                    if (metadata && metadata.category_id === cat.id) {
                        pendingCount += metadata.quantity || 0;
                    }
                }

                const available = Math.max(0, cat.total_quantity - (soldCount + pendingCount));

                await client.hSet(key, {
                    available: available.toString(),
                    max_per_user: cat.max_per_user.toString(),
                });
                this.logger.log(`[Redis Warmup] Initialized category ${cat.id} (${cat.name}) with available: ${available}, max_per_user: ${cat.max_per_user}`);
            } else {
                this.logger.log(`[Redis Warmup] Category ${cat.id} is already initialized on Redis`);
            }
        }
    }

    async reserveTicket(userId: string, dto: ReserveTicketDto) {
        const { concert_id, category_id, quantity } = dto;
        const categoryKey = `category:${category_id}`;
        const userKey = `user:${userId}:reservations`;

        // Step 1: Atomically deduct tickets on Redis
        let result;
        let status;
        try {
            result = await this.redisService.runLuaScript(
                RESERVE_TICKET_LUA,
                [categoryKey, userKey],
                [quantity.toString(), category_id, '100']
            );

            if (!Array.isArray(result) || result.length === 0) {
                throw new BadRequestException('Unexpected response from reservation engine');
            }

            status = result[0];

            // Lazy Seeding: If Redis is not initialized, calculate and seed from DB, then retry
            if (status === 'ERR_NOT_INITIALIZED') {
                this.logger.log(`[Lazy Seeding] Category ${category_id} not found in Redis. Seeding from DB...`);
                const category = await this.prisma.ticketCategory.findUnique({
                    where: { id: category_id },
                });
                if (!category) {
                    throw new BadRequestException('ERR_NOT_INITIALIZED');
                }

                // Count sold tickets (where ticket entries exist)
                const soldCount = await this.prisma.ticket.count({
                    where: { category_id },
                });

                // Count pending unexpired tickets
                const pendingOrders = await this.prisma.order.findMany({
                    where: {
                        status: 'PENDING',
                        expires_at: {
                            gt: new Date(),
                        },
                    },
                });

                let pendingCount = 0;
                for (const order of pendingOrders) {
                    const metadata = order.ticket_metadata as any;
                    if (metadata && metadata.category_id === category_id) {
                        pendingCount += metadata.quantity || 0;
                    }
                }

                const available = Math.max(0, category.total_quantity - (soldCount + pendingCount));
                this.logger.log(`[Lazy Seeding] Category ${category_id}: total=${category.total_quantity}, sold=${soldCount}, pending=${pendingCount}. Seeding available=${available}`);

                await this.seedCategoryInventory(category_id, available, category.max_per_user);

                // Retry reservation on Redis
                result = await this.redisService.runLuaScript(
                    RESERVE_TICKET_LUA,
                    [categoryKey, userKey],
                    [quantity.toString(), category_id, '100']
                );

                if (!Array.isArray(result) || result.length === 0) {
                    throw new BadRequestException('Unexpected response from reservation engine');
                }
                status = result[0];
            }

            if (status === 'ERR_NOT_INITIALIZED') {
                throw new BadRequestException('ERR_NOT_INITIALIZED');
            }
            if (status === 'ERR_NO_TICKET') {
                throw new BadRequestException('ERR_NO_TICKET');
            }
            if (status === 'ERR_LIMIT_EXCEEDED') {
                throw new BadRequestException('ERR_LIMIT_EXCEEDED');
            }

            if (status !== 'OK') {
                throw new BadRequestException('Unknown reservation error');
            }
        } catch (err) {
            if (err instanceof BadRequestException) {
                throw err;
            }
            this.logger.error('[Redis Error] Failed to complete atomic reservation or lazy seeding on Redis', err);
            throw new ServiceUnavailableException('Booking service temporarily unavailable. Please try again.');
        }

        const remaining = parseInt(result[1], 10);
        const orderId = randomUUID();

        // Step 2: Publish event to RabbitMQ (with Redis rollback on failure)
        try {
            await this.rabbitMqService.publish('order.exchange', '', {
                orderId,
                userId,
                concertId: concert_id,
                categoryId: category_id,
                quantity,
            });
        } catch (err) {
            // Rollback Redis if RabbitMQ publish fails
            this.logger.error(`[Reservation Rollback] RabbitMQ publish failed for order ${orderId}, rolling back Redis`, err);
            await this.rollbackCategoryInventory(userId, category_id, quantity);
            throw new ServiceUnavailableException('Booking service temporarily unavailable. Please try again.');
        }

        return {
            status: 'SUCCESS',
            order_id: orderId,
            category_id,
            quantity,
            remaining,
        };
    }

    async rollbackCategoryInventory(userId: string, categoryId: string, quantity: number): Promise<void> {
        const categoryKey = `category:${categoryId}`;
        const userKey = `user:${userId}:reservations`;

        try {
            await this.redisService.runLuaScript(
                ROLLBACK_TICKET_LUA,
                [categoryKey, userKey],
                [quantity.toString(), categoryId]
            );
            this.logger.log(`[Rollback] Restored ${quantity} ticket(s) for category ${categoryId}, user ${userId}`);
        } catch (err) {
            this.logger.error(`[Rollback Failed] Could not restore tickets for category ${categoryId}, user ${userId}`, err);
        }
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