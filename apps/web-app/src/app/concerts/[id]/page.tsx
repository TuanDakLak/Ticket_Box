import { Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { ConcertDetailHero, TicketTierCard } from "@/components/screens";
import { concerts, ticketTiers } from "@/lib/mock-data";

export default function ConcertDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const concert = concerts.find((item) => item.id === params.id) ?? concerts[0];

  return (
    <SiteShell active="/">
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:px-8">
        <ConcertDetailHero />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <Card className="p-6">
              <SectionHeading
                eyebrow="About the show"
                title={concert.title}
                description={concert.description}
                action={
                  <Button href={`/concerts/${concert.id}/seats`} variant="soft">
                    Select seats
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
            <div className="space-y-4">
              <SectionHeading
                eyebrow="Ticket tiers"
                title="Choose the experience"
                description="Compare standing, priority, and lounge tiers before moving into seat selection."
              />
              <div className="grid gap-4">
                {ticketTiers.map((tier) => (
                  <TicketTierCard key={tier.name} {...tier} />
                ))}
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
            <Button href={`/concerts/${concert.id}/seats`} className="w-full">
              Continue to seats
            </Button>
          </Card>
        </div>
      </section>
    </SiteShell>
  );
}
