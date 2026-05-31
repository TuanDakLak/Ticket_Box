import Link from "next/link";

export default function HomePage() {
  return (
    <main className="auth-page">
      <div className="ticketbox-shell py-6 sm:py-8">
        <div className="ticketbox-nav rounded-[28px] border border-slate-200/80 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight text-[#4f22d8]">TicketBox</p>
              <p className="ticketbox-muted hidden sm:block">Authentication prototype foundation</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="ticketbox-button-primary px-5 py-2.5">Login</Link>
              <Link href="/register" className="ticketbox-button-secondary px-5 py-2.5">Register</Link>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="ticketbox-card overflow-hidden">
            <div className="h-72 bg-[linear-gradient(135deg,_#30135f_0%,_#0f62fe_55%,_#ff7a59_100%)] p-8 text-white sm:h-[420px] sm:p-12">
              <span className="ticketbox-badge border border-white/20 bg-white/10 text-white">Prototype shell</span>
              <h1 className="mt-6 max-w-lg text-4xl font-black leading-tight sm:text-5xl">TicketBox auth screens designed for fast handoff.</h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                Use this prototype as the visual base for login, registration, email verification, password recovery, and security settings.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#0f62fe] shadow-lg">Open Sign In</Link>
                <Link href="/account/security" className="rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white">Open Security Center</Link>
              </div>
            </div>
            <div className="grid gap-4 bg-white p-6 sm:grid-cols-3">
              {[
                ["Auth lifecycle", "Login, register, verify, resend, reset, change password"],
                ["Backend aligned", "Matches /auth/* endpoints and future token refresh patterns"],
                ["Future ready", "Easy to extend into ticket, concept, and checkout flows"],
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
              <h2 className="mt-4 text-2xl font-black text-slate-900">Prototype all auth screens first</h2>
              <p className="ticketbox-muted mt-3">
                This gives you stable screens to export as ZIP and hand off for implementation without touching ticket/concept logic yet.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/login" className="ticketbox-button-primary px-5 py-3">Start prototype</Link>
                <Link href="/catalog" className="ticketbox-button-secondary px-5 py-3">Open public catalog</Link>
              </div>
            </div>
            <div className="ticketbox-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900">What the design system should preserve</h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>• Purple/blue primary brand language with clean white cards</li>
                <li>• Large hero panels and soft shadows for a premium event feel</li>
                <li>• Simple, readable forms with strong loading/error states</li>
                <li>• Shared shell usable later for tickets, concepts, and profile security</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
