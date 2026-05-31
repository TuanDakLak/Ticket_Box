import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ResetPasswordPage() {
  return (
    <TicketBoxAuthShell
      title="Create new password"
      description="Use the recovery token from your email, clear it from the URL, and set a new password before returning to sign in."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="password">New password</label>
          <input id="password" type="password" className="ticketbox-input" placeholder="Min. 8 characters" />
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-3/4 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" className="ticketbox-input" placeholder="Repeat your password" />
        </div>
        <button className="ticketbox-button-primary w-full">Reset password</button>
        <p className="ticketbox-muted text-center">Prototype note: read the token from the query string, then remove it with history.replaceState.</p>
      </form>
    </TicketBoxAuthShell>
  );
}import Link from "next/link";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";

export default function ResetPasswordPage() {
  return (
    <TicketBoxAuthShell
      title="Create new password"
      description="Use the recovery token from your email, clear it from the URL, and set a new password before returning to sign in."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5">
        <div>
          <label className="ticketbox-label" htmlFor="password">New password</label>
          <input id="password" type="password" className="ticketbox-input" placeholder="Min. 8 characters" />
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-3/4 rounded-full bg-emerald-500" />
          </div>
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" type="password" className="ticketbox-input" placeholder="Repeat your password" />
        </div>
        <button className="ticketbox-button-primary w-full">Reset password</button>
        <p className="ticketbox-muted text-center">Prototype note: read the token from the query string, then remove it with history.replaceState.</p>
      </form>
    </TicketBoxAuthShell>
  );
}