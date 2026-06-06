import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma.service';
import { RabbitMqService } from '../../../shared/rabbitmq';
import { TicketingService } from '../services/ticketing.service';

interface OrderReservedPayload {
    orderId: string;
    userId: string;
    concertId: string;
    categoryId: string;
    quantity: number;
}

@Injectable()
export class OrderCreateConsumer implements OnModuleInit {
    private readonly logger = new Logger(OrderCreateConsumer.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly rabbitMqService: RabbitMqService,
    ) { }

    async onModuleInit() {
        try {
            await this.rabbitMqService.consume('order.create.queue', async (msg) => {
                const payload: OrderReservedPayload = JSON.parse(msg.content.toString());
                await this.handleOrderCreate(payload);
            });
        } catch (err) {
            this.logger.error('Failed to start OrderCreateConsumer', err);
        }
    }

    private async handleOrderCreate(payload: OrderReservedPayload): Promise<void> {
        const { orderId, userId, concertId, categoryId, quantity } = payload;

        // Idempotency: skip if order already exists
        const existing = await this.prisma.order.findUnique({ where: { id: orderId } });
        if (existing) {
            this.logger.warn(`[OrderCreate] Order ${orderId} already exists, skipping (idempotency)`);
            return;
        }

        // Look up ticket category price
        const category = await this.prisma.ticketCategory.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            this.logger.error(`[OrderCreate] Category ${categoryId} not found in DB, cannot create order ${orderId}`);
            return;
        }

        const totalAmount = category.price.toNumber() * quantity;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

        // Create order in PENDING state (no Ticket rows yet)
        await this.prisma.order.create({
            data: {
                id: orderId,
                user_id: userId,
                concert_id: concertId,
                total_amount: totalAmount,
                status: 'PENDING',
                created_at: now,
                expires_at: expiresAt,
                ticket_metadata: {
                    category_id: categoryId,
                    category_name: category.name,
                    quantity,
                    unit_price: category.price.toNumber(),
                },
            },
        });

        this.logger.log(`[OrderCreate] Created PENDING order ${orderId} for user ${userId}: ${quantity}x ${category.name} = ${totalAmount}`);
    }
}

@Injectable()
export class OrderExpiredConsumer implements OnModuleInit {
    private readonly logger = new Logger(OrderExpiredConsumer.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly rabbitMqService: RabbitMqService,
        private readonly ticketingService: TicketingService,
    ) { }

    async onModuleInit() {
        try {
            await this.rabbitMqService.consume('order.expired.queue', async (msg) => {
                const payload: OrderReservedPayload = JSON.parse(msg.content.toString());
                await this.handleOrderExpired(payload);
            });
        } catch (err) {
            this.logger.error('Failed to start OrderExpiredConsumer', err);
        }
    }

    private async handleOrderExpired(payload: OrderReservedPayload): Promise<void> {
        const { orderId, userId, categoryId, quantity } = payload;

        const order = await this.prisma.order.findUnique({ where: { id: orderId } });

        if (!order) {
            this.logger.warn(`[OrderExpired] Order ${orderId} not found, skipping`);
            return;
        }

        // Idempotency: only cancel if still PENDING
        if (order.status !== 'PENDING') {
            this.logger.log(`[OrderExpired] Order ${orderId} is already ${order.status}, skipping`);
            return;
        }

        // Cancel order in DB
        await this.prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });

        // Rollback Redis inventory
        await this.ticketingService.rollbackCategoryInventory(userId, categoryId, quantity);

        this.logger.log(`[OrderExpired] Cancelled order ${orderId} and restored ${quantity} ticket(s) for category ${categoryId}`);
    }
}