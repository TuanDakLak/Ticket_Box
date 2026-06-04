"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { SecurityIllustration } from "@/components/ticketbox-illustrations";
import { authService } from "@/services/auth.service";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = useMemo(() => searchParams?.get("token") ?? null, [searchParams]);

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!urlToken) return;
    setToken(urlToken);
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [urlToken]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      alert("Missing recovery token");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, newPassword);
      alert(res.message || "Password reset successful. Please sign in.");
      router.push("/login");
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketBoxAuthShell
      title="Create new password"
      description="Set a new password and return to sign in."
      sidebar={<SecurityIllustration />}
      footerLinks={[{ label: "Back to sign in", href: "/login" }]}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="ticketbox-label" htmlFor="password">New password</label>
          <input
            id="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            type="password"
            className="ticketbox-input"
            placeholder="Min. 8 characters"
          />
        </div>
        <div>
          <label className="ticketbox-label" htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            className="ticketbox-input"
            placeholder="Repeat your password"
          />
        </div>
        <button className="ticketbox-button-primary w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </TicketBoxAuthShell>
  );
}
