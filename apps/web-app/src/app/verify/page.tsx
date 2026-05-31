import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function VerifyPage() {
  return (
    <TicketBoxAuthShell
      title="Verify your account"
      description="This screen mirrors the email verification callback and lets users continue or request a new link if the token is expired."
      sidebar={<SecurityIllustration />}
      footerLinks={[
        { label: "Back to sign in", href: "/login" },
        { label: "Resend verification", href: "/resend-verification" },
      ]}
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0f62fe]/10 text-[#0f62fe]">
          <span className="text-3xl">✓</span>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-left">
          <p className="text-sm font-semibold text-slate-500">Verification flow</p>
          <p className="mt-2 text-slate-700">1. Read token from query string</p>
          <p className="text-slate-700">2. Clear token from URL immediately</p>
          <p className="text-slate-700">3. Call GET /auth/verify?token=...</p>
          <p className="text-slate-700">4. Redirect to login on success</p>
        </div>
        <Link href="/login" className="ticketbox-button-primary w-full">Continue to sign in</Link>
      </div>
    </TicketBoxAuthShell>
  );
}import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function VerifyPage() {
  return (
    <TicketBoxAuthShell
      title="Verify your account"
      description="This screen mirrors the email verification callback and lets users continue or request a new link if the token is expired."
      sidebar={<SecurityIllustration />}
      footerLinks={[
        { label: "Back to sign in", href: "/login" },
        { label: "Resend verification", href: "/resend-verification" },
      ]}
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#0f62fe]/10 text-[#0f62fe]">
          <span className="text-3xl">✓</span>
        </div>
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-left">
          <p className="text-sm font-semibold text-slate-500">Verification flow</p>
          <p className="mt-2 text-slate-700">1. Read token from query string</p>
          <p className="text-slate-700">2. Clear token from URL immediately</p>
          <p className="text-slate-700">3. Call GET /auth/verify?token=...</p>
          <p className="text-slate-700">4. Redirect to login on success</p>
        </div>
        <Link href="/login" className="ticketbox-button-primary w-full">Continue to sign in</Link>
      </div>
    </TicketBoxAuthShell>
  );
}