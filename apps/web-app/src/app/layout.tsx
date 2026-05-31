import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "TicketBox - Premium Ticket Management",
  description: "Buy and manage concert tickets with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
