import Link from "next/link";

type ShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  footerLinks?: Array<{
    label: string;
    href: string;
  }>;
  sidebar?: React.ReactNode;
  compact?: boolean;
};

export function TicketBoxAuthShell({
  eyebrow = "TicketBox",
  title,
  description,
  children,
  footerLinks,
  sidebar,
  compact = false,
}: ShellProps) {
  return (
    <div className="auth-page">
      <div className="ticketbox-nav">
        <div className="ticketbox-shell flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight text-[#4f22d8] sm:text-2xl">
            TicketBox
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
            <Link href="/catalog" className="hidden hover:text-[#0f62fe] sm:block">Events</Link>
            <Link href="/account/security" className="hidden hover:text-[#0f62fe] sm:block">Security</Link>
            <Link href="/login" className="rounded-full bg-[#0f62fe] px-4 py-2 text-white shadow-[0_10px_24px_rgba(15,98,254,0.25)] transition hover:bg-[#0353e9]">
              Login
            </Link>
          </div>
        </div>
      </div>

      <main className={`ticketbox-shell ${compact ? "py-10 sm:py-14" : "py-12 sm:py-16 lg:py-20"}`}>
        <div className={`grid items-stretch gap-6 ${sidebar ? "lg:grid-cols-[1.1fr_0.9fr]" : "lg:grid-cols-1"}`}>
          {sidebar ? (
            <section className="ticketbox-card hidden min-h-[720px] overflow-hidden lg:block">
              {sidebar}
            </section>
          ) : null}

          <section className="ticketbox-panel mx-auto w-full max-w-2xl px-5 py-6 sm:px-8 sm:py-8">
            <div className="mb-8">
              <span className="ticketbox-badge mb-4">{eyebrow}</span>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {title}
              </h1>
              <p className="ticketbox-muted mt-3 max-w-xl">{description}</p>
            </div>
            {children}
            {footerLinks?.length ? (
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500">
                {footerLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="font-medium text-[#0f62fe] hover:text-[#0353e9]">
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}