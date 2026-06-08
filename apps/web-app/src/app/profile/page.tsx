import { Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { ActivityTimeline, ProfileHeader } from "@/components/screens";

export default function ProfilePage() {
  return (
    <SiteShell active="/profile">
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <ProfileHeader />
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <Card className="space-y-5 p-6">
            <SectionHeading
              title="Account menu"
              description="Quick access to your personal settings and support tools."
            />
            <div className="space-y-3 text-sm text-on-surface-variant">
              {[
                "Personal information",
                "Security settings",
                "Payment methods",
                "Notification preferences",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-surface-low px-4 py-3 font-semibold text-on-surface"
                >
                  {item}
                </div>
              ))}
            </div>
            <Button href="/support" variant="soft" className="w-full">
              Contact support
            </Button>
          </Card>
          <ActivityTimeline />
        </div>
      </section>
    </SiteShell>
  );
}
