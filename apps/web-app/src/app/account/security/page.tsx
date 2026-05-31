import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function AccountSecurityPage() {
  return (
    <TicketBoxAuthShell
      eyebrow="Account"
      title="Security Center"
      description="Manage passwords, sessions, and the auth lifecycle from a layout that can later support profile and checkout protections."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to dashboard", href: "/dashboard" }]}
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-900">Change password</h2>
          <p className="ticketbox-muted mt-2">Use current password, new password, and confirmation with loading/disabled states.</p>
          <div className="mt-5 space-y-4">
            <input className="ticketbox-input" type="password" placeholder="Current password" />
            <input className="ticketbox-input" type="password" placeholder="New password" />
            <input className="ticketbox-input" type="password" placeholder="Confirm new password" />
            <button className="ticketbox-button-primary w-full">Update password</button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6">
          <h2 className="text-xl font-black text-slate-900">Active sessions</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">MacBook Pro 16 • Chrome • Current</div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">iPhone 15 Pro • iOS • 2 hours ago</div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">Windows Workstation • Firefox • Yesterday</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="ticketbox-button-secondary">Logout this session</button>
            <button className="ticketbox-button-secondary border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/5">Logout all devices</button>
          </div>
        </section>
      </div>
    </TicketBoxAuthShell>
  );
}import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function AccountSecurityPage() {
  return (
    <TicketBoxAuthShell
      eyebrow="Account"
      title="Security Center"
      description="Manage passwords, sessions, and the auth lifecycle from a layout that can later support profile and checkout protections."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to dashboard", href: "/dashboard" }]}
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black text-slate-900">Change password</h2>
          <p className="ticketbox-muted mt-2">Use current password, new password, and confirmation with loading/disabled states.</p>
          <div className="mt-5 space-y-4">
            <input className="ticketbox-input" type="password" placeholder="Current password" />
            <input className="ticketbox-input" type="password" placeholder="New password" />
            <input className="ticketbox-input" type="password" placeholder="Confirm new password" />
            <button className="ticketbox-button-primary w-full">Update password</button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6">
          <h2 className="text-xl font-black text-slate-900">Active sessions</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">MacBook Pro 16 • Chrome • Current</div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">iPhone 15 Pro • iOS • 2 hours ago</div>
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">Windows Workstation • Firefox • Yesterday</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="ticketbox-button-secondary">Logout this session</button>
            <button className="ticketbox-button-secondary border-[#ef4444] text-[#ef4444] hover:bg-[#ef4444]/5">Logout all devices</button>
          </div>
        </section>
      </div>
    </TicketBoxAuthShell>
  );
}