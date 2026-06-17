import { Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { SeatLegendCard, VenueMap } from "@/components/screens";

export default function SeatsPage() {
  return (
    <SiteShell active="/">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Seat picker"
          title="Select your seats"
          description="Choose from available floor and lounge seats, then continue to a short checkout flow before the hold expires."
          action={<Button href="/checkout/order-2048">Continue</Button>}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <VenueMap />
            <SeatLegendCard />
          </div>
          <Card className="space-y-5 p-6 lg:sticky lg:top-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                Reservation
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold text-on-surface">
                2 seats selected
              </h2>
            </div>
            <div className="rounded-2xl bg-surface-low p-4 text-sm text-on-surface-variant">
              <p className="font-semibold text-on-surface">VIP Lounge</p>
              <p className="mt-1">Row B · Seats 4 and 5</p>
            </div>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <div className="flex items-center justify-between">
                <span>Seat price</span>
                <span>$298.00</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fees</span>
                <span>$18.00</span>
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant pt-3 text-base font-semibold text-on-surface">
                <span>Total</span>
                <span>$316.00</span>
              </div>
            </div>
            <Button href="/checkout/order-2048" className="w-full">
              Proceed to checkout
            </Button>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
