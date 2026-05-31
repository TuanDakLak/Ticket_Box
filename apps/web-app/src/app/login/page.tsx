import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { ConcertHeroIllustration } from "@/components/ticketbox-illustrations";

export default function LoginPage() {
  return (
    <TicketBoxAuthShell
      title="Welcome back"
      description="Sign in to manage tickets, profile security, and future checkout flows built on the same auth foundation."
      sidebar={<ConcertHeroIllustration />}
      footerLinks={[
        { label: "Forgot your password?", href: "/forgot-password" },
        { label: "Create account", href: "/register" },
      ]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="ticketbox-label mb-0" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-sm font-medium text-[#0f62fe] hover:text-[#0353e9]">Forgot password?</Link>
          </div>
          <input id="password" type="password" className="ticketbox-input" placeholder="••••••••" />
        </div>
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#0f62fe] focus:ring-[#0f62fe]" />
          Remember me for 30 days
        </label>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Account not verified. <Link href="/resend-verification" className="font-semibold underline">Resend verification email</Link>
        </div>
        <button className="ticketbox-button-primary w-full">Sign in</button>
      </form>
    </TicketBoxAuthShell>
  );
}
