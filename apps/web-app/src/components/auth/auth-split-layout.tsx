import { AuthHero } from "./auth-hero";
import { AuthTopBar } from "./auth-top-bar";

type AuthSplitLayoutProps = {
  children: React.ReactNode;
  heroTitle: string;
  heroDescription: string;
  heroImage?: string;
  heroTag?: string;
  heroVariant?: "bottom" | "glass";
  showFooter?: boolean;
  topBarRight?: React.ReactNode;
};

export function AuthSplitLayout({
  children,
  heroTitle,
  heroDescription,
  heroImage,
  heroTag,
  heroVariant = "bottom",
  showFooter = true,
  topBarRight,
}: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface-bg">
      <AuthTopBar rightSlot={topBarRight} />
      <main className="flex flex-1 flex-col lg:flex-row">
        <AuthHero
          imageSrc={heroImage}
          title={heroTitle}
          description={heroDescription}
          tag={heroTag}
          variant={heroVariant}
        />
        <section className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-margin-desktop lg:py-16">
          <div className="mx-auto w-full max-w-auth-form">{children}</div>
          {showFooter && (
            <p className="mx-auto mt-8 hidden max-w-auth-form text-center text-xs text-muted-foreground lg:block">
              © {new Date().getFullYear()} TicketBox. Proudly serving the Vietnamese music scene.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
