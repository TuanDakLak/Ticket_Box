"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TicketBoxAuthShell } from "@/components/ticketbox-auth-shell";
import { ConcertHeroIllustration } from "@/components/ticketbox-illustrations";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get("returnUrl") || "/dashboard";
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      // Fetch user profile to update context
      const profile = await authService.me();
      login(profile);
      router.push(returnUrl);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TicketBoxAuthShell
      title="Welcome back"
      description="Sign in to your account to manage tickets, events, and your profile."
      sidebar={<ConcertHeroIllustration />}
      footerLinks={[
        { label: "Don't have an account? Sign up", href: "/register" },
      ]}
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/50 dark:text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <div className="space-y-1">
          <label className="ticketbox-label" htmlFor="email">Email address</label>
          <input 
            id="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            type="email" 
            className="ticketbox-input" 
            placeholder="name@example.com" 
            required
            disabled={loading}
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="ticketbox-label mb-0" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline hover:underline-offset-4">Forgot password?</Link>
          </div>
          <input 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            type="password" 
            className="ticketbox-input" 
            placeholder="••••••••" 
            required
            disabled={loading}
          />
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <input 
            type="checkbox" 
            id="remember" 
            className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-2"
          />
          <label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Remember me for 30 days
          </label>
        </div>
        
        <button className="ticketbox-button-primary w-full mt-2" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </TicketBoxAuthShell>
  );
}
