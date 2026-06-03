import { CheckoutShell } from "@/components/common";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutShell>{children}</CheckoutShell>;
}
