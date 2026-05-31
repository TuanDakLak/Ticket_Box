import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ResendVerificationPage() {
  return (
    <TicketBoxAuthShell
      title="Didn't receive the email?"
      description="Send another verification link and keep the resend state ready for a future automated countdown interaction."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <button className="ticketbox-button-primary w-full">Resend verification</button>
        <p className="ticketbox-muted text-center">Success toast: “Verification email sent. Check your inbox and spam folder.”</p>
      </form>
    </TicketBoxAuthShell>
  );
}import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ResendVerificationPage() {
  return (
    <TicketBoxAuthShell
      title="Didn't receive the email?"
      description="Send another verification link and keep the resend state ready for a future automated countdown interaction."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <button className="ticketbox-button-primary w-full">Resend verification</button>
        <p className="ticketbox-muted text-center">Success toast: “Verification email sent. Check your inbox and spam folder.”</p>
      </form>
    </TicketBoxAuthShell>
  );
}