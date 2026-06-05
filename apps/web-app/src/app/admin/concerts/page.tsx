"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function AdminConcertsContent() {
  const { user, hasPermission } = useAuth();
  const canCreate = hasPermission("CREATE_CONCERT");
  const canDelete = hasPermission("DELETE_CONCERT");

  return (
    <main className="auth-page">
      <div className="ticketbox-shell py-6 sm:py-8">
        <div className="ticketbox-nav rounded-[28px] border border-slate-200/80 px-5 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="text-2xl font-black tracking-tight text-[#4f22d8]">
              TicketBox
            </Link>
            <Link href="/dashboard" className="ticketbox-button-secondary px-5 py-2.5">
              Back to dashboard
            </Link>
          </div>
        </div>

        <section className="mt-6 ticketbox-card p-6 sm:p-8 lg:p-10">
          <p className="ticketbox-badge">Admin / Organizer</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900">
            Concert management
          </h1>
          <p className="ticketbox-muted mt-3 max-w-2xl">
            This route is protected by role guard (ADMIN or ORGANIZER). Action buttons below
            follow permission-based visibility from RBAC.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Signed in as <strong>{user?.fullName}</strong> ({user?.roles?.join(", ")})
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {canCreate ? (
              <button className="ticketbox-button-primary px-5 py-3">
                Create new concert
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                You do not have CREATE_CONCERT permission.
              </p>
            )}

            {canDelete && (
              <button className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700">
                Delete concert
              </button>
            )}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              "Glow Festival Night",
              "City Lights Live",
              "Echo Pulse",
            ].map((title) => (
              <article
                key={title}
                className="rounded-[24px] border border-slate-200 bg-white p-5"
              >
                <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                <p className="mt-2 text-sm text-slate-500">Sample concert entry</p>
                <div className="mt-4 flex gap-2">
                  <button className="ticketbox-button-secondary flex-1">Edit</button>
                  {canDelete && (
                    <button className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminConcertsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "ORGANIZER"]}>
      <AdminConcertsContent />
    </ProtectedRoute>
  );
}
