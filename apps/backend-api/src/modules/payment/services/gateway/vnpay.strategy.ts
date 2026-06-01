import { Injectable } from '@nestjs/common';
import { PaymentMethod } from '../../dtos/payment-method.enum';
import { AbstractPaymentStrategy } from './abstract-payment.strategy';
import { PaymentGatewaySessionInput, PaymentGatewaySessionResult } from './payment-gateway.types';

@Injectable()
export class VnpayStrategy extends AbstractPaymentStrategy {
    readonly paymentMethod = PaymentMethod.VNPAY;

    async createPaymentSession(input: PaymentGatewaySessionInput): Promise<PaymentGatewaySessionResult> {
        const providerTransactionId = this.createProviderTransactionId();
        const baseUrl = this.ensureEnvironment('PAYMENT_VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
        const tmnCode = this.ensureEnvironment('PAYMENT_VNPAY_TMN_CODE', 'TICKETBOX');
        const secretKey = this.ensureEnvironment('PAYMENT_VNPAY_HASH_SECRET', 'ticketbox-vnpay-secret');
        const returnUrl = input.returnUrl ?? this.ensureEnvironment('PAYMENT_VNPAY_RETURN_URL', 'https://ticketbox.local/payments/return/vnpay');
        const webhookUrl = input.webhookUrl ?? this.ensureEnvironment('PAYMENT_VNPAY_WEBHOOK_URL', 'https://ticketbox.local/payments/webhook');

        const payload = {
            vnp_Amount: Math.round(input.amount * 100),
            vnp_Command: 'pay',
            vnp_CreateDate: new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14),
            vnp_CurrCode: 'VND',
            vnp_IpAddr: '127.0.0.1',
            vnp_Locale: 'vn',
            vnp_OrderInfo: `TicketBox payment for order ${input.orderId}`,
            vnp_OrderType: 'other',
            vnp_ReturnUrl: returnUrl,
            vnp_TmnCode: tmnCode,
            vnp_TxnRef: providerTransactionId,
            vnp_TransactionNo: providerTransactionId,
            vnp_Version: '2.1.0',
            vnp_ExpireDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            vnp_TicketBoxOrderId: input.orderId,
            vnp_TicketBoxIdempotencyKey: input.idempotencyKey,
            vnp_TicketBoxWebhookUrl: webhookUrl,
            vnp_TicketBoxUserId: input.userId,
        };

        const query = new URLSearchParams(Object.entries(payload).reduce<Record<string, string>>((params, [key, value]) => {
            params[key] = String(value);
            return params;
        }, {}));

        const signature = this.signPayload(payload, secretKey, 'sha512');
        const checkoutUrl = `${baseUrl}?${query.toString()}&vnp_SecureHash=${signature}`;

        return {
            paymentMethod: this.paymentMethod,
            providerTransactionId,
            checkoutUrl,
            outcome: 'SUCCESS',
            raw: {
                provider: 'VNPAY',
                request: payload,
                signature,
                checkoutUrl,
            },
        };
    }

    verifyWebhookSignature(payload: unknown, signature: string | undefined): void {
        const secretKey = this.ensureEnvironment('PAYMENT_VNPAY_WEBHOOK_SECRET', process.env.PAYMENT_VNPAY_HASH_SECRET ?? 'ticketbox-vnpay-secret');
        this.assertSignature(payload, signature, secretKey);
    }
}