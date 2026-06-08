import { Button } from "@/components/common";
import {
  CustomerInfoForm,
  OrderSummaryCard,
  PaymentMethodPicker,
  CountdownTimer,
} from "@/components/screens";

export default function CheckoutPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
            Secure checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-on-surface">
            Complete your order
          </h1>
        </div>
        <CountdownTimer />
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <CustomerInfoForm />
          <PaymentMethodPicker />
          <div className="flex flex-wrap gap-3">
            <Button href="/checkout/order-2048/processing">Pay now</Button>
            <Button
              href="/concerts/sonic-pulse/seats"
              variant="ghost"
              className="border border-outline-variant"
            >
              Back to seats
            </Button>
          </div>
        </div>
        <OrderSummaryCard />
      </div>
    </section>
  );
}
