import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "TicketBox - Auth Prototype",
  description: "TicketBox authentication prototype for login, register, verification, and recovery flows",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#faf9ff] font-sans text-slate-900">{children}</body>
    </html>
  );
}
