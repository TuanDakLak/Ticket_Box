import { AuthTopBar } from "./auth-top-bar";

type AuthCardLayoutProps = {
  children: React.ReactNode;
  mesh?: boolean;
};

export function AuthCardLayout({ children, mesh = true }: AuthCardLayoutProps) {
  return (
    <div className={`flex min-h-screen flex-col ${mesh ? "tb-auth-mesh" : "bg-surface-bg"}`}>
      <AuthTopBar />
      <main className="relative flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-[#30135f]/5 blur-[120px]" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
