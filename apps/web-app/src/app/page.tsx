import { Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { ConcertCard, HeroCarousel } from "@/components/screens";
import { concerts } from "@/lib/mock-data";

export default function Home() {
  return (
    <SiteShell active="/">
      <HeroCarousel />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Discover"
          title="Upcoming concerts"
          description="Hot tickets, premium upgrades, and fast-moving events tailored for the next release window."
          action={
            <Button href="/concerts/sonic-pulse" variant="soft">
              View all events
            </Button>
          }
        />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ConcertCard concert={concerts[0]} featured />
          </div>
          <div className="grid gap-5 lg:col-span-5">
            {concerts.slice(1, 3).map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          ["Live drops", "New seats open every Friday at 9 AM."],
          [
            "Best sellers",
            "Premium floor and lounge access are the first to disappear.",
          ],
          [
            "Instant checkout",
            "Reserve seats with a short timer and a streamlined payment flow.",
          ],
        ].map(([title, description]) => (
          <Card key={title} className="card-lift p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Highlights
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold text-on-surface">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {description}
            </p>
          </Card>
        ))}
      </section>
    </SiteShell>
  );
}
