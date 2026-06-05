"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function DashboardContent() {
  const router = useRouter();
  const { user, logout, hasPermission, hasRole } = useAuth();

  const canCreateConcert = hasPermission("CREATE_CONCERT");
  const canDeleteConcert = hasPermission("DELETE_CONCERT");
  const canManageConcerts = hasRole("ADMIN") || hasRole("ORGANIZER");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main className="auth-page">
      <div className="ticketbox-shell py-6 sm:py-8">
        <div className="ticketbox-nav rounded-[28px] border border-slate-200/80 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-black tracking-tight text-[#4f22d8]">
              TicketBox
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/catalog" className="ticketbox-button-secondary px-5 py-2.5">
                Events
              </Link>
              <button onClick={handleLogout} className="ticketbox-button-primary px-5 py-2.5">
                Logout
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="ticketbox-card p-6 sm:p-8 lg:p-10">
            <p className="ticketbox-badge">Dashboard</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
              Xin chào, {user?.fullName}
            </h1>
            <p className="ticketbox-muted mt-3 max-w-2xl">
              Quản lý tài khoản, vé và sự kiện của bạn tại TicketBox.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">My tickets</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  View and manage your concert tickets.
                </p>
                <button className="ticketbox-button-primary mt-4 w-full" disabled>
                  Coming soon
                </button>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">My orders</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Track purchase history and order states.
                </p>
                <button className="ticketbox-button-primary mt-4 w-full" disabled>
                  Coming soon
                </button>
              </div>

              <div className="rounded-[24px] bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">Account security</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Change password and manage your session.
                </p>
                <Link href="/account/security" className="ticketbox-button-primary mt-4 block w-full text-center">
                  Open
                </Link>
              </div>
            </div>

            {canManageConcerts && (
              <div className="mt-8 rounded-[24px] border border-[#0f62fe]/20 bg-[#eff6ff] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0f62fe]">
                  Organizer / Admin
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Concert management</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Manage concerts based on your roles and permissions.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href="/admin/concerts" className="ticketbox-button-primary px-5 py-2.5">
                    Manage concerts
                  </Link>
                  {canCreateConcert && (
                    <button className="ticketbox-button-secondary px-5 py-2.5">
                      Create new concert
                    </button>
                  )}
                  {canDeleteConcert && (
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700">
                      Delete concert
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="ticketbox-panel p-6 sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">User information</h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <strong>Email:</strong> {user?.email}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <strong>Status:</strong> {user?.status || "ACTIVE"}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <strong>Roles:</strong> {user?.roles?.join(", ") || "—"}
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <strong>Permissions:</strong>{" "}
                {user?.permissions?.length ? user.permissions.join(", ") : "None"}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
