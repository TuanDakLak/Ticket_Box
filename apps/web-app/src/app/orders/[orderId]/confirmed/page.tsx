import { Button, SectionHeading } from "@/components/common";
import { ETicketCard } from "@/components/screens";

export default function ConfirmedPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Order confirmed
          </p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-on-surface">
            Your tickets are ready
          </h1>
        </div>
        <Button href="/my-tickets" variant="soft">
          Open ticket library
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <ETicketCard />
        <div className="space-y-6">
          <SectionHeading
            title="Next steps"
            description="Add the pass to your wallet, keep the QR code ready, and arrive before the doors open."
          />
          <div className="grid gap-4">
            {[
              ["Arrival", "Doors open 90 minutes before showtime."],
              [
                "Wallet",
                "Use the download button or add the pass to your mobile wallet.",
              ],
              [
                "Support",
                "Contact us immediately if your QR code does not scan at entry.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-outline-variant bg-surface p-5 shadow-sm"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                  {title}
                </p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
