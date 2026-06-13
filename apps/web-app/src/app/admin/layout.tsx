import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminShell } from "@/components/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
