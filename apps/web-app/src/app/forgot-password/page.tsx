import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ForgotPasswordPage() {
  return (
    <TicketBoxAuthShell
      title="Forgot your password?"
      description="Enter your email and TicketBox will send a recovery link for the same auth flow used across future account screens."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <button className="ticketbox-button-primary w-full">Send recovery link</button>
        <p className="ticketbox-muted text-center">Success toast: “If the account exists, you’ll receive a recovery email shortly.”</p>
      </form>
    </TicketBoxAuthShell>
  );
}import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ForgotPasswordPage() {
  return (
    <TicketBoxAuthShell
      title="Forgot your password?"
      description="Enter your email and TicketBox will send a recovery link for the same auth flow used across future account screens."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <button className="ticketbox-button-primary w-full">Send recovery link</button>
        <p className="ticketbox-muted text-center">Success toast: “If the account exists, you’ll receive a recovery email shortly.”</p>
      </form>
    </TicketBoxAuthShell>
  );
}