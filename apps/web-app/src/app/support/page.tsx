//test push CI
import { Button, SiteShell } from "@/components/common";
import {
  SupportContacts,
  SupportGrid,
  SupportHero,
} from "@/components/screens";

export default function SupportPage() {
  return (
    <SiteShell active="/support">
      <SupportHero />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Popular answers
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold text-on-surface">
              Help categories
            </h2>
          </div>
          <Button href="/orders/order-2048/confirmed" variant="soft">
            Order help
          </Button>
        </div>
      </section>
      <SupportGrid />
      <SupportContacts />
    </SiteShell>
  );
}
