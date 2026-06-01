import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from './payment-method.enum';
import { PaymentTicketBreakdownDto } from './payment-ticket-breakdown.dto';

export enum PaymentWebhookOutcome {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export class PaymentWebhookRequestDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    order_id!: string;

    @ApiProperty({ example: '4f7d0d0d-4ae2-4e32-a8d4-29b2f0c8d2d4' })
    @IsUUID()
    idempotency_key!: string;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.VNPAY })
    @IsEnum(PaymentMethod)
    payment_method!: PaymentMethod;

    @ApiProperty({ example: '3f47c07b-0a7e-4b6b-b449-5ed7edb1d4f1' })
    @IsUUID()
    transaction_id_3rd_party!: string;

    @ApiProperty({ enum: PaymentWebhookOutcome, example: PaymentWebhookOutcome.SUCCESS })
    @IsEnum(PaymentWebhookOutcome)
    outcome!: PaymentWebhookOutcome;

    @ApiPropertyOptional({ type: [PaymentTicketBreakdownDto] })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => PaymentTicketBreakdownDto)
    ticket_breakdown?: PaymentTicketBreakdownDto[];
}