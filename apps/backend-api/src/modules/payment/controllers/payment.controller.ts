import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UsePipes,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiCreatedResponse,
    ApiHeader,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentService } from '../services/payment.service';
import { PaymentProcessResponseDto } from '../dtos/payment-process-response.dto';
import { PaymentWebhookRequestDto } from '../dtos/payment-webhook-request.dto';
import { PaymentWebhookResponseDto } from '../dtos/payment-webhook-response.dto';
import { PaymentIdempotencyInterceptor } from '../interceptors/payment-idempotency.interceptor';

@Controller('payments')
@ApiTags('Payments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(PaymentIdempotencyInterceptor)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Process a payment request' })
    @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'UUID v4 idempotency key for duplicate prevention' })
    @ApiCreatedResponse({ type: PaymentProcessResponseDto })
    @ApiBadRequestResponse({ description: 'Validation failed or missing idempotency key' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
    async processPayment(
        @Req() req: any,
        @Body() dto: CreatePaymentDto,
    ) {
        return this.paymentService.processPayment(req.user.sub, dto, req.paymentTracking?.idempotencyKey);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle payment provider webhook callback' })
    @ApiBody({ type: PaymentWebhookRequestDto })
    @ApiCreatedResponse({ type: PaymentWebhookResponseDto })
    @ApiBadRequestResponse({ description: 'Validation failed or signature mismatch' })
    async handleWebhook(
        @Body() dto: any,
    ) {
        return this.paymentService.handleWebhook(dto);
    }
}