"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BrandMark, Button, Card, SectionHeading, SiteShell } from "@/components/common";
import { ConcertCard, HeroCarousel } from "@/components/screens";
import { concerts } from "@/lib/mock-data";

function LoadingState() {
  return (
    <main className="auth-page flex items-center justify-center px-4">
      <div className="ticketbox-panel flex items-center gap-4 px-6 py-5">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="ticketbox-muted">Restoring your session...</p>
      </div>
    </main>
  );
}

function GuestLanding() {
  return (
    <main className="auth-page">
      <div className="ticketbox-shell py-6 sm:py-8">
        <div className="ticketbox-nav px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <BrandMark compact />
            <div className="flex items-center gap-3">
              <Link href="/login" className="ticketbox-button-primary px-5 py-2.5">
                Login
              </Link>
              <Link
                href="/register"
                className="ticketbox-button-secondary px-5 py-2.5"
              >
                Register
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="ticketbox-card overflow-hidden">
            <div className="h-72 bg-[linear-gradient(135deg,_#30135f_0%,_#0f62fe_55%,_#ff7a59_100%)] p-8 text-white sm:h-[420px] sm:p-12">
              <span className="ticketbox-badge border border-white/20 bg-white/10 text-white">
                Authentication first
              </span>
              <h1 className="mt-6 max-w-lg text-4xl font-black leading-tight sm:text-5xl">
                Sign in to unlock TicketBox tickets, orders, and account tools.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Use the auth flow to enter the ticketing experience, manage your
                seat selection, finish checkout, and view your ticket library.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f62fe] shadow-lg"
                >
                  Open Sign In
                </Link>
                <Link
                  href="/catalog"
                  className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white"
                >
                  Browse public preview
                </Link>
              </div>
            </div>
            <div className="grid gap-4 bg-white p-6 sm:grid-cols-3">
              {[
                ["Auth lifecycle", "Login, register, verify, reset, and security settings"],
                ["Backend aligned", "Matches /auth/* endpoints and token lifecycle flows"],
                ["Post-login ready", "Routes into ticketing, checkout, and ticket library views"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="ticketbox-panel p-6 sm:p-8">
              <p className="ticketbox-badge">Recommended next step</p>
              <h2 className="mt-4 text-2xl font-black text-slate-900">
                Start with login, then continue into ticketing
              </h2>
              <p className="ticketbox-muted mt-3">
                After sign-in, the app switches to the current ticketing interface
                without forcing a separate redesign for checkout or account pages.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="ticketbox-button-primary px-5 py-3">
                  Start login
                </Link>
                <Link
                  href="/register"
                  className="ticketbox-button-secondary px-5 py-3"
                >
                  Create account
                </Link>
              </div>
            </div>
            <div className="ticketbox-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900">
                What becomes available after login
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Ticket discovery, seat selection, and checkout flows.</li>
                <li>My Tickets, Profile, and Support navigation.</li>
                <li>Order confirmation, ticket download, and account security pages.</li>
                <li>Session restore and token refresh handling.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthenticatedHome() {
  return (
    <SiteShell active="/" action={{ label: "My Tickets", href: "/my-tickets" }}>
      <HeroCarousel />
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Discover"
          title="Upcoming concerts"
          description="Hot tickets, premium upgrades, and fast-moving events tailored for the next release window."
          action={
            <Button href="/concerts/sonic-pulse" variant="soft">
              View all events
            </Button>
          }
        />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ConcertCard concert={concerts[0]} featured />
          </div>
          <div className="grid gap-5 lg:col-span-5">
            {concerts.slice(1, 3).map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          ["Live drops", "New seats open every Friday at 9 AM."],
          [
            "Best sellers",
            "Premium floor and lounge access are the first to disappear.",
          ],
          [
            "Instant checkout",
            "Reserve seats with a short timer and a streamlined payment flow.",
          ],
        ].map(([title, description]) => (
          <Card key={title} className="card-lift p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Highlights
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold text-on-surface">
              {title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {description}
            </p>
          </Card>
        ))}
      </section>
    </SiteShell>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState />;
  }

  return isAuthenticated ? <AuthenticatedHome /> : <GuestLanding />;
}
