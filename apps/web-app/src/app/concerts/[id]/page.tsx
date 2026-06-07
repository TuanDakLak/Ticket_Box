import { Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { ConcertDetailHero, TicketTierCard } from "@/components/screens";
import { getConcertById, formatConcertCurrency } from "@/services/concert.service";

export default async function ConcertDetailPage({
  params,
}: {
   params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let concert;
  try {
    concert = await getConcertById(id);
  } catch (error) {
    return (
      <SiteShell active="/">
        <section className="mx-auto w-full max-w-7xl px-4 py-12 text-center">
          <Card className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-rose-600">Error Loading Concert</h1>
            <p className="text-slate-600">
              {error instanceof Error ? error.message : "Failed to load concert details."}
            </p>
            <Button href="/" variant="primary">
              Back to Home
            </Button>
          </Card>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell active="/">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <ConcertDetailHero concert={concert} />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <Card className="p-6">
              <SectionHeading
                eyebrow="About the show"
                title={concert.title}
                description={concert.description}
                action={
                  <Button href="#ticket-tiers" variant="soft">
                    Select experience
                  </Button>
                }
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Doors open", "6:30 PM"],
                  ["Show length", "2h 10m"],
                  ["Age policy", "13+ with guardian"],
                  ["Entry", "Digital QR ticket"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-surface-low p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-on-surface">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
            <div id="ticket-tiers" className="space-y-4 scroll-mt-24">
              <SectionHeading
                eyebrow="Ticket tiers"
                title="Choose the experience"
                description="Compare standing, priority, and lounge tiers before moving into seat selection."
              />
              <div className="grid gap-4">
                {concert.ticketTiers && concert.ticketTiers.length > 0 ? (
                  concert.ticketTiers.map((tier, index) => (
                    <TicketTierCard
                      key={tier.id || tier.name}
                      name={tier.name}
                      price={formatConcertCurrency(tier.price)}
                      note={`Max: ${tier.max_per_user} tickets per user • Total capacity: ${tier.total_quantity} seats`}
                      highlight={index === 0}
                      href="/checkout/order-2048"
                    />
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No ticket tiers available for this concert.</p>
                )}
              </div>
            </div>
          </div>
          <Card className="space-y-5 p-6 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-primary/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                Event snapshot
              </p>
              <h3 className="mt-3 font-display text-3xl font-bold text-on-surface">
                {concert.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                {concert.venue} · {concert.city}
              </p>
            </div>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <p>
                High-demand release with a premium lounge, balcony, and floor
                plan.
              </p>
              <p>
                Seat selections are held for a short reservation window after
                checkout starts.
              </p>
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
