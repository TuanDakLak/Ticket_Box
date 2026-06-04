"use client";

import { useState } from "react";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";
import { authService } from "@/services/auth.service";

export default function ResendVerificationPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.resendVerification(email);
      alert(res.message || "Verification email sent. Please check your inbox.");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketBoxAuthShell
      title="Didn't receive the email?"
      description="Send another verification link to activate your account."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="ticketbox-input"
            placeholder="name@company.com"
          />
        </div>
        <button className="ticketbox-button-primary w-full" disabled={loading}>
          {loading ? "Sending..." : "Resend verification"}
        </button>
      </form>
    </TicketBoxAuthShell>
  );
}