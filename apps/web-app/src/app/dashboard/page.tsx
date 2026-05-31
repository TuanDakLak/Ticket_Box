"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { authService } from "@/services/auth.service";

function DashboardContent() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    authService.logout();
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          TicketBox
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">
            Welcome, <strong>{user?.email}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Tickets Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              My Tickets
            </h3>
            <p className="text-gray-600 mb-4">View and manage your concert tickets</p>
            <Link
              href="/dashboard/tickets"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              View Tickets
            </Link>
          </div>

          {/* My Orders Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              My Orders
            </h3>
            <p className="text-gray-600 mb-4">Track your orders and history</p>
            <Link
              href="/dashboard/orders"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              View Orders
            </Link>
          </div>

          {/* Account Settings Card */}
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Account Settings
            </h3>
            <p className="text-gray-600 mb-4">Manage your profile and preferences</p>
            <Link
              href="/dashboard/profile"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded">
                {user?.role || "User"}
              </span>
            </p>
            {user?.permissions && (
              <p>
                <strong>Permissions:</strong>{" "}
                {user.permissions.join(", ") || "None"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
