import { Button, SectionHeading, SiteShell } from "@/components/common";
import { MyTicketsHero, TicketListItem } from "@/components/screens";
import { tickets } from "@/lib/mock-data";

export default function MyTicketsPage() {
  return (
    <SiteShell active="/my-tickets">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <MyTicketsHero />
        <div className="mt-8 flex items-center justify-between gap-4">
          <SectionHeading
            title="Saved and upcoming tickets"
            description="Use the tabs to view current passes, archived events, and saved ticket drafts."
          />
          <Button href="/support" variant="soft">
            Support
          </Button>
        </div>
        <div className="mt-6 space-y-4">
          {tickets.map((ticket) => (
            <TicketListItem key={ticket.title} ticket={ticket} />
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
