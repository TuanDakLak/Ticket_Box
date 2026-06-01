import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    ServiceUnavailableException,
    UnauthorizedException,
} from '@nestjs/common';
import { createHmac, randomUUID, createHash } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/prisma.service';
import { RedisService } from '../../../shared/redis';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentMethod } from '../dtos/payment-method.enum';
import { PaymentProcessResponseDto } from '../dtos/payment-process-response.dto';
import { PaymentWebhookRequestDto, PaymentWebhookOutcome } from '../dtos/payment-webhook-request.dto';
import { PaymentWebhookResponseDto } from '../dtos/payment-webhook-response.dto';
import { PaymentTicketBreakdownDto } from '../dtos/payment-ticket-breakdown.dto';

type CircuitState = {
    status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    openedAt: number | null;
    recentOutcomes: Array<{ at: number; ok: boolean }>;
    halfOpenProbes: number;
};

type GatewayResult = {
    profile: 'SUCCESS' | 'ERROR' | 'TIMEOUT';
    provider_transaction_id: string;
    redirect_url: string | null;
    raw: Record<string, unknown>;
};

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly idempotencyTtlSeconds = 60 * 60 * 24;
    private readonly circuitOpenDurationMs = 60 * 1000;
    private readonly circuitWindowMs = 10 * 1000;
    private readonly circuitMinimumSamples = 4;
    private readonly circuitFailureThreshold = 0.5;
    private readonly circuitHalfOpenProbeLimit = 5;
    private readonly circuitStates = new Map<PaymentMethod, CircuitState>();

    constructor(
        private readonly prisma: PrismaService,
        private readonly redisService: RedisService,
    ) { }

    async processPayment(
        userId: string,
        dto: CreatePaymentDto,
        idempotencyKey: string | undefined,
    ): Promise<PaymentProcessResponseDto> {
        const normalizedKey = idempotencyKey?.trim();
        if (!normalizedKey) {
            throw new BadRequestException('Idempotency-Key header is required');
        }

        const cacheKey = this.getIdempotencyCacheKey(normalizedKey);
        const cached = await this.redisService.getJson<PaymentProcessResponseDto>(cacheKey);
        if (cached?.payment_transaction_id) {
            return new PaymentProcessResponseDto(cached);
        }

        const reserved = await this.redisService.setIfAbsentJson(
            cacheKey,
            {
                status: 'IN_PROGRESS',
                order_id: dto.order_id,
                payment_method: dto.payment_method,
                created_at: new Date().toISOString(),
            },
            this.idempotencyTtlSeconds,
        );

        if (!reserved) {
            const existing = await this.findCachedOrPersistedProcessResult(normalizedKey, cacheKey);
            if (existing) {
                return existing;
            }
        }

        const order = await this.prisma.order.findFirst({
            where: { id: dto.order_id, user_id: userId },
            include: {
                concert: {
                    include: { ticket_categories: true },
                },
                tickets: true,
                payment_transactions: {
                    orderBy: { created_at: 'desc' },
                },
            },
        });

        if (!order) {
            await this.persistIdempotencyFailure(cacheKey, normalizedKey, {
                message: 'Order not found',
            });
            throw new NotFoundException('Order not found');
        }

        if (order.status !== 'PENDING') {
            await this.persistIdempotencyFailure(cacheKey, normalizedKey, {
                message: `Order is already ${order.status.toLowerCase()}`,
            });
            throw new BadRequestException(`Order is already ${order.status.toLowerCase()}`);
        }

        const existingTransaction = await this.prisma.paymentTransaction.findUnique({
            where: { idempotency_key: normalizedKey },
        });
        if (existingTransaction) {
            const mapped = this.mapProcessTransaction(existingTransaction, normalizedKey, 'CLOSED', null, 'SUCCESS');
            await this.redisService.setJson(cacheKey, mapped, this.idempotencyTtlSeconds);
            return mapped;
        }

        try {
            this.assertCircuitAvailable(dto.payment_method);
        } catch (error) {
            await this.persistIdempotencyFailure(cacheKey, normalizedKey, {
                message: error instanceof Error ? error.message : 'Payment gateway unavailable',
            });
            throw error;
        }

        const paymentTransaction = await this.prisma.paymentTransaction.create({
            data: {
                order_id: dto.order_id,
                payment_method: dto.payment_method,
                amount: order.total_amount,
                status: 'INIT',
                idempotency_key: normalizedKey,
                raw_response: {
                    phase: 'PROCESS_REQUESTED',
                    order_id: dto.order_id,
                    payment_method: dto.payment_method,
                    requested_by_user_id: userId,
                } as Prisma.JsonObject,
            },
        });

        try {
            const gatewayResult = await this.executeMockGateway(order.id, dto.payment_method, Number(order.total_amount));
            this.recordCircuitOutcome(dto.payment_method, true);

            const payload = this.mapProcessTransaction(
                paymentTransaction,
                normalizedKey,
                this.getCircuitState(dto.payment_method).status,
                gatewayResult.redirect_url,
                gatewayResult.profile,
            );

            await this.prisma.paymentTransaction.update({
                where: { id: paymentTransaction.id },
                data: {
                    transaction_id_3rd_party: gatewayResult.provider_transaction_id,
                    raw_response: {
                        process: gatewayResult.raw,
                        order_snapshot: {
                            order_id: order.id,
                            status: order.status,
                            current_ticket_count: order.tickets.length,
                        },
                    } as Prisma.JsonObject,
                },
            });

            await this.redisService.setJson(cacheKey, payload, this.idempotencyTtlSeconds);
            return payload;
        } catch (error) {
            this.recordCircuitOutcome(dto.payment_method, false);

            const failed = await this.prisma.paymentTransaction.update({
                where: { id: paymentTransaction.id },
                data: {
                    status: 'FAILED',
                    raw_response: {
                        phase: 'PROCESS_FAILED',
                        message: error instanceof Error ? error.message : 'Unknown payment gateway error',
                    } as Prisma.JsonObject,
                },
            });
            const response = this.mapProcessTransaction(
                failed,
                normalizedKey,
                this.getCircuitState(dto.payment_method).status,
                null,
                'ERROR',
            );
            await this.redisService.setJson(cacheKey, response, this.idempotencyTtlSeconds);
            throw new ServiceUnavailableException(response);
        }
    }

    async handleWebhook(
        dto: PaymentWebhookRequestDto,
        signature: string | undefined,
    ): Promise<PaymentWebhookResponseDto> {
        this.verifyWebhookSignature(dto, signature);

        const transaction = await this.prisma.paymentTransaction.findFirst({
            where: {
                idempotency_key: dto.idempotency_key,
                order_id: dto.order_id,
                payment_method: dto.payment_method,
            },
            include: {
                order: {
                    include: {
                        concert: {
                            include: { ticket_categories: true },
                        },
                        tickets: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new NotFoundException('Payment transaction not found');
        }

        if (dto.outcome === PaymentWebhookOutcome.FAILED) {
            await this.prisma.$transaction(async (tx) => {
                await tx.paymentTransaction.update({
                    where: { id: transaction.id },
                    data: {
                        status: 'FAILED',
                        transaction_id_3rd_party: dto.transaction_id_3rd_party,
                        raw_response: this.mergeTelemetry(transaction.raw_response, {
                            webhook: this.buildWebhookTelemetry(dto, signature),
                        }) as Prisma.JsonObject,
                    },
                });

                await tx.order.update({
                    where: { id: transaction.order_id },
                    data: { status: 'CANCELLED' },
                });
            });

            return new PaymentWebhookResponseDto({
                order_status: 'CANCELLED',
                payment_status: 'FAILED',
                ticket_count: transaction.order.tickets.length,
                message: 'payment webhook processed',
                ticket_ids: transaction.order.tickets.map((ticket) => ticket.id),
            });
        }

        if (transaction.order.status === 'PAID' && transaction.order.tickets.length > 0) {
            await this.prisma.paymentTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'SUCCESS',
                    transaction_id_3rd_party: dto.transaction_id_3rd_party,
                    raw_response: this.mergeTelemetry(transaction.raw_response, {
                        webhook: this.buildWebhookTelemetry(dto, signature),
                    }) as Prisma.JsonObject,
                },
            });

            return new PaymentWebhookResponseDto({
                order_status: 'PAID',
                payment_status: 'SUCCESS',
                ticket_count: transaction.order.tickets.length,
                message: 'payment webhook processed',
                ticket_ids: transaction.order.tickets.map((ticket) => ticket.id),
            });
        }

        const breakdown = this.resolveTicketBreakdown(dto, transaction.order);
        const ticketIds: string[] = [];

        await this.prisma.$transaction(async (tx) => {
            await tx.paymentTransaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'SUCCESS',
                    transaction_id_3rd_party: dto.transaction_id_3rd_party,
                    raw_response: this.mergeTelemetry(transaction.raw_response, {
                        webhook: this.buildWebhookTelemetry(dto, signature),
                    }) as Prisma.JsonObject,
                },
            });

            await tx.order.update({
                where: { id: transaction.order_id },
                // cast to any because Prisma client types may be out-of-sync with schema migrations
                data: ({
                    status: 'PAID',
                    ticket_metadata: this.mergeTicketMetadata((transaction.order as any).ticket_metadata, breakdown),
                } as any),
            });

            for (const item of breakdown) {
                for (let index = 0; index < item.quantity; index += 1) {
                    const qrCodeHash = this.generateQrCodeHash(transaction.order_id, transaction.id, item.category_id, index);
                    const ticket = await tx.ticket.create({
                        data: {
                            order_id: transaction.order_id,
                            category_id: item.category_id,
                            qr_code_hash: qrCodeHash,
                        },
                    });
                    ticketIds.push(ticket.id);
                }
            }
        });

        return new PaymentWebhookResponseDto({
            order_status: 'PAID',
            payment_status: 'SUCCESS',
            ticket_count: ticketIds.length,
            message: 'payment webhook processed',
            ticket_ids: ticketIds,
        });
    }

    private async findCachedOrPersistedProcessResult(
        idempotencyKey: string,
        cacheKey: string,
    ): Promise<PaymentProcessResponseDto | null> {
        const cached = await this.redisService.getJson<PaymentProcessResponseDto>(cacheKey);
        if (cached?.payment_transaction_id) {
            return new PaymentProcessResponseDto(cached);
        }

        const existingTransaction = await this.prisma.paymentTransaction.findUnique({
            where: { idempotency_key: idempotencyKey },
        });
        if (!existingTransaction) {
            return null;
        }

        const result = this.mapProcessTransaction(existingTransaction, idempotencyKey, this.getCircuitState(existingTransaction.payment_method as PaymentMethod).status, null, 'SUCCESS');
        await this.redisService.setJson(cacheKey, result, this.idempotencyTtlSeconds);
        return result;
    }

    private mapProcessTransaction(
        transaction: { id: string; order_id: string; payment_method: string; status: string; idempotency_key: string },
        idempotencyKey: string,
        circuitBreakerState: CircuitState['status'],
        checkoutUrl: string | null,
        gatewayStatus: string,
    ): PaymentProcessResponseDto {
        return new PaymentProcessResponseDto({
            payment_transaction_id: transaction.id,
            order_id: transaction.order_id,
            payment_method: transaction.payment_method,
            status: transaction.status,
            gateway_status: gatewayStatus,
            checkout_url: checkoutUrl,
            idempotency_key: idempotencyKey,
            circuit_breaker_state: circuitBreakerState,
        });
    }

    private resolveTicketBreakdown(
        dto: PaymentWebhookRequestDto,
        order: {
            ticket_metadata?: Prisma.JsonValue | null;
            concert: { ticket_categories: Array<{ id: string; name: string }> };
        },
    ): PaymentTicketBreakdownDto[] {
        const fromWebhook = dto.ticket_breakdown ?? [];
        if (fromWebhook.length > 0) {
            return fromWebhook;
        }

        const storedBreakdown = this.extractTicketBreakdown(order.ticket_metadata ?? null);
        if (storedBreakdown.length > 0) {
            return storedBreakdown;
        }

        const defaultCategory = order.concert.ticket_categories[0];
        if (!defaultCategory) {
            throw new BadRequestException('Unable to determine ticket category for paid order');
        }

        return [{ category_id: defaultCategory.id, quantity: 1 }];
    }

    private extractTicketBreakdown(value: Prisma.JsonValue | null): PaymentTicketBreakdownDto[] {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return [];
        }

        const candidate = (value as Record<string, unknown>).ticket_breakdown;
        if (!Array.isArray(candidate)) {
            return [];
        }

        return candidate
            .map((item) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) {
                    return null;
                }

                const categoryId = (item as Record<string, unknown>).category_id;
                const quantity = (item as Record<string, unknown>).quantity;
                if (typeof categoryId !== 'string' || typeof quantity !== 'number' || quantity < 1) {
                    return null;
                }

                return { category_id: categoryId, quantity };
            })
            .filter((item): item is PaymentTicketBreakdownDto => item !== null);
    }

    private mergeTicketMetadata(
        ticketMetadata: Prisma.JsonValue | null,
        breakdown: PaymentTicketBreakdownDto[],
    ): Prisma.JsonObject {
        const base = ticketMetadata && typeof ticketMetadata === 'object' && !Array.isArray(ticketMetadata)
            ? { ...(ticketMetadata as Prisma.JsonObject) }
            : {};

        return {
            ...base,
            ticket_breakdown: breakdown as unknown as Prisma.JsonArray,
            updated_at: new Date().toISOString(),
        };
    }

    private mergeTelemetry(existing: Prisma.JsonValue | null, payload: Record<string, unknown>): Prisma.JsonObject {
        const base = existing && typeof existing === 'object' && !Array.isArray(existing)
            ? { ...(existing as Prisma.JsonObject) }
            : {};

        return ({
            ...base,
            ...payload,
        } as Prisma.JsonObject);
    }

    private buildWebhookTelemetry(dto: PaymentWebhookRequestDto, signature: string | undefined): Record<string, unknown> {
        return {
            ...dto,
            signature_verified: true,
            signature: signature ?? null,
            received_at: new Date().toISOString(),
        };
    }

    private verifyWebhookSignature(dto: PaymentWebhookRequestDto, signature: string | undefined): void {
        const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? 'ticketbox-mock-webhook-secret';
        if (!signature) {
            throw new UnauthorizedException('Missing webhook signature');
        }

        const expected = createHmac('sha256', secret)
            .update(this.stableStringify(dto))
            .digest('hex');

        if (expected !== signature) {
            throw new UnauthorizedException('Invalid webhook signature');
        }
    }

    private stableStringify(value: unknown): string {
        if (value === null || typeof value !== 'object') {
            return JSON.stringify(value);
        }

        if (Array.isArray(value)) {
            return `[${value.map((item) => this.stableStringify(item)).join(',')}]`;
        }

        const entries = Object.entries(value as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, entry]) => `${JSON.stringify(key)}:${this.stableStringify(entry)}`);

        return `{${entries.join(',')}}`;
    }

    private generateQrCodeHash(orderId: string, transactionId: string, categoryId: string, index: number): string {
        return createHash('sha256')
            .update(`${orderId}:${transactionId}:${categoryId}:${index}:${randomUUID()}`)
            .digest('hex');
    }

    private getIdempotencyCacheKey(idempotencyKey: string): string {
        return `payments:idempotency:${idempotencyKey}`;
    }

    private getCircuitState(paymentMethod: PaymentMethod): CircuitState {
        const current = this.circuitStates.get(paymentMethod);
        if (current) {
            return current;
        }

        const initial: CircuitState = {
            status: 'CLOSED',
            openedAt: null,
            recentOutcomes: [],
            halfOpenProbes: 0,
        };
        this.circuitStates.set(paymentMethod, initial);
        return initial;
    }

    private assertCircuitAvailable(paymentMethod: PaymentMethod): void {
        const state = this.getCircuitState(paymentMethod);
        if (state.status === 'OPEN') {
            if (state.openedAt !== null && Date.now() - state.openedAt >= this.circuitOpenDurationMs) {
                state.status = 'HALF_OPEN';
                state.halfOpenProbes = 0;
                return;
            }

            throw new ServiceUnavailableException(`${paymentMethod} circuit breaker is open`);
        }

        if (state.status === 'HALF_OPEN' && state.halfOpenProbes >= this.circuitHalfOpenProbeLimit) {
            throw new ServiceUnavailableException(`${paymentMethod} circuit breaker is half-open and probing`);
        }
    }

    private recordCircuitOutcome(paymentMethod: PaymentMethod, ok: boolean): void {
        const state = this.getCircuitState(paymentMethod);
        const now = Date.now();
        state.recentOutcomes = state.recentOutcomes.filter((entry) => now - entry.at <= this.circuitWindowMs);
        state.recentOutcomes.push({ at: now, ok });

        if (state.status === 'HALF_OPEN') {
            state.halfOpenProbes += 1;
            if (ok && state.halfOpenProbes >= this.circuitHalfOpenProbeLimit) {
                state.status = 'CLOSED';
                state.openedAt = null;
                state.halfOpenProbes = 0;
                state.recentOutcomes = [];
            }
            if (!ok) {
                state.status = 'OPEN';
                state.openedAt = now;
                state.halfOpenProbes = 0;
            }
            return;
        }

        if (state.recentOutcomes.length < this.circuitMinimumSamples) {
            return;
        }

        const failures = state.recentOutcomes.filter((entry) => !entry.ok).length;
        const failureRate = failures / state.recentOutcomes.length;
        if (failureRate >= this.circuitFailureThreshold) {
            state.status = 'OPEN';
            state.openedAt = now;
            state.halfOpenProbes = 0;
        }
    }

    private async executeMockGateway(orderId: string, paymentMethod: PaymentMethod, amount: number): Promise<GatewayResult> {
        const state = this.getCircuitState(paymentMethod);
        if (state.status === 'HALF_OPEN') {
            state.halfOpenProbes += 1;
        }

        const roll = Math.random();
        const profile = roll < 0.7 ? 'SUCCESS' : roll < 0.9 ? 'ERROR' : 'TIMEOUT';
        const latencyMs = profile === 'TIMEOUT' ? 2500 : 150 + Math.floor(Math.random() * 450);
        const provider_transaction_id = randomUUID();
        const redirect_url = `https://mock-gateway.ticketbox.local/pay/${provider_transaction_id}`;
        const telemetry = {
            order_id: orderId,
            payment_method: paymentMethod,
            amount,
            profile,
            latency_ms: latencyMs,
            provider_transaction_id,
            redirect_url,
        };

        await new Promise<void>((resolve) => {
            setTimeout(() => resolve(), latencyMs);
        });

        if (profile === 'ERROR') {
            throw new ServiceUnavailableException({
                message: 'Mock gateway error',
                telemetry,
            });
        }

        if (profile === 'TIMEOUT') {
            throw new ServiceUnavailableException({
                message: 'Mock gateway timeout',
                telemetry,
            });
        }

        return {
            profile,
            provider_transaction_id,
            redirect_url,
            raw: telemetry,
        };
    }

    private async persistIdempotencyFailure(
        cacheKey: string,
        idempotencyKey: string,
        payload: Record<string, unknown>,
    ): Promise<void> {
        const response = new PaymentProcessResponseDto({
            payment_transaction_id: idempotencyKey,
            order_id: payload.order_id as string ?? '',
            payment_method: payload.payment_method as string ?? '',
            status: 'FAILED',
            gateway_status: 'FAILED',
            checkout_url: null,
            idempotency_key: idempotencyKey,
            circuit_breaker_state: 'OPEN',
        });
        await this.redisService.setJson(cacheKey, { ...response, error: payload.message ?? 'failed' }, this.idempotencyTtlSeconds);
    }
}