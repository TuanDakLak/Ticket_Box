"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { ConcertHeroIllustration } from "@/components/ticketbox-illustrations";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.register(email, password, fullName);
      alert('Account created. Please check your email to verify.');
      router.push('/login');
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketBoxAuthShell
      title="Join TicketBox"
      description="Create an account to reserve seats, manage future ticket journeys, and keep a secure session lifecycle."
      sidebar={<ConcertHeroIllustration />}
      footerLinks={[
        { label: "Already have an account? Sign in", href: "/login" },
      ]}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="ticketbox-label" htmlFor="fullName">Full name</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" className="ticketbox-input" placeholder="Nguyen Van A" />
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="ticketbox-input" placeholder="name@company.com" />
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="ticketbox-input" placeholder="Min. 8 characters" />
          <div className="mt-3 h-2 rounded-full bg-slate-100">
            <div className="h-2 w-2/3 rounded-full bg-amber-500" />
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Security strength: Medium</p>
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="ticketbox-input" placeholder="Repeat your password" />
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600">
          <input type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0f62fe] focus:ring-[#0f62fe]" />
          <span>
            I agree to the <Link href="#" className="font-medium text-[#0f62fe]">Terms of Service</Link> and <Link href="#" className="font-medium text-[#0f62fe]">Privacy Policy</Link>.
          </span>
        </label>
        <button className="ticketbox-button-primary w-full" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        <div className="rounded-[28px] border border-dashed border-[#0f62fe]/25 bg-[#eff6ff] p-4 text-sm text-slate-600">
          Success state: show a verification modal with resend countdown, then route users back to sign in.
        </div>
      </form>
    </TicketBoxAuthShell>
  );
}
