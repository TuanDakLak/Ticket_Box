import Link from "next/link";

type AuthTopBarProps = {
  helpHref?: string;
  rightSlot?: React.ReactNode;
};

export function AuthTopBar({ helpHref = "/login", rightSlot }: AuthTopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-container-auth items-center justify-between px-4 sm:px-gutter">
        <Link href="/" className="text-xl font-black tracking-tight text-primary">
          TicketBox
        </Link>
        <div className="flex items-center gap-4">
          {rightSlot}
          <Link
            href={helpHref}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Help
          </Link>
        </div>
      </div>
    </header>
  );
}
