import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../dtos/payment-method.enum';
import { AbstractPaymentStrategy } from './abstract-payment.strategy';
import { PaymentGatewaySessionInput, PaymentGatewaySessionResult } from './payment-gateway.types';

@Injectable()
export class MomoStrategy extends AbstractPaymentStrategy {
    readonly paymentMethod = PaymentMethod.MOMO;

    async createPaymentSession(input: PaymentGatewaySessionInput): Promise<PaymentGatewaySessionResult> {
        const providerTransactionId = this.createProviderTransactionId();
        const apiUrl = this.ensureEnvironment('PAYMENT_MOMO_API_URL', 'https://test-payment.momo.vn/v2/gateway/api/create');
        const partnerCode = this.ensureEnvironment('PAYMENT_MOMO_PARTNER_CODE', 'TICKETBOX');
        const accessKey = this.ensureEnvironment('PAYMENT_MOMO_ACCESS_KEY', 'TICKETBOX_ACCESS');
        const secretKey = this.ensureEnvironment('PAYMENT_MOMO_SECRET_KEY', 'ticketbox-momo-secret');
        const returnUrl = input.returnUrl ?? this.ensureEnvironment('PAYMENT_MOMO_RETURN_URL', 'https://ticketbox.local/payments/return/momo');
        const notifyUrl = input.webhookUrl ?? this.ensureEnvironment('PAYMENT_MOMO_NOTIFY_URL', 'https://ticketbox.local/payments/webhook');

        const requestBody = {
            accessKey,
            amount: Math.round(input.amount),
            extraData: Buffer.from(JSON.stringify({
                orderId: input.orderId,
                idempotencyKey: input.idempotencyKey,
                userId: input.userId,
            })).toString('base64'),
            ipnUrl: notifyUrl,
            orderId: providerTransactionId,
            orderInfo: `TicketBox payment for order ${input.orderId}`,
            partnerCode,
            redirectUrl: returnUrl,
            requestId: providerTransactionId,
            requestType: process.env.PAYMENT_MOMO_REQUEST_TYPE ?? 'captureWallet',
        };

        const signature = this.signPayload(requestBody, secretKey);
        const payload = {
            ...requestBody,
            signature,
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`MoMo API responded with HTTP ${response.status}`);
        }

        const data = await response.json() as Record<string, unknown>;
        const checkoutUrl = typeof data.payUrl === 'string'
            ? data.payUrl
            : typeof data.deeplink === 'string'
                ? data.deeplink
                : `${apiUrl}?requestId=${providerTransactionId}`;

        return {
            paymentMethod: this.paymentMethod,
            providerTransactionId,
            checkoutUrl,
            outcome: 'SUCCESS',
            raw: {
                provider: 'MOMO',
                request: payload,
                response: data,
            },
        };
    }

    verifyWebhookSignature(payload: unknown, signature: string | undefined): void {
        const secretKey = this.ensureEnvironment('PAYMENT_MOMO_WEBHOOK_SECRET', process.env.PAYMENT_MOMO_SECRET_KEY ?? 'ticketbox-momo-secret');
        this.assertSignature(payload, signature, secretKey);
    }
}