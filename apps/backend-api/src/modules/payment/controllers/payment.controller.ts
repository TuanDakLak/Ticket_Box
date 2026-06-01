import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UsePipes,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentService } from '../services/payment.service';
import { PaymentProcessResponseDto } from '../dtos/payment-process-response.dto';
import { PaymentWebhookRequestDto } from '../dtos/payment-webhook-request.dto';
import { PaymentWebhookResponseDto } from '../dtos/payment-webhook-response.dto';

@Controller('payments')
@ApiTags('Payments')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Process a mock payment request' })
    @ApiHeader({ name: 'Idempotency-Key', required: true, description: 'Idempotency key for duplicate prevention' })
    @ApiCreatedResponse({ type: PaymentProcessResponseDto })
    @ApiBadRequestResponse({ description: 'Validation failed or missing idempotency key' })
    @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
    async processPayment(
        @Req() req: any,
        @Headers('idempotency-key') idempotencyKey: string | undefined,
        @Body() dto: CreatePaymentDto,
    ) {
        return this.paymentService.processPayment(req.user.sub, dto, idempotencyKey);
    }

    @Post('webhook')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle mock VNPAY/MoMo webhook callback' })
    @ApiHeader({ name: 'X-Mock-Signature', required: true, description: 'HMAC signature for mock webhook verification' })
    @ApiBody({ type: PaymentWebhookRequestDto })
    @ApiCreatedResponse({ type: PaymentWebhookResponseDto })
    @ApiBadRequestResponse({ description: 'Validation failed or signature mismatch' })
    async handleWebhook(
        @Headers('x-mock-signature') signature: string | undefined,
        @Body() dto: PaymentWebhookRequestDto,
    ) {
        return this.paymentService.handleWebhook(dto, signature);
    }
}