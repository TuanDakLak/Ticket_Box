"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div className="text-2xl font-bold text-indigo-600">TicketBox</div>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-gray-600">{user?.email}</span>
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-indigo-600 hover:bg-gray-100 rounded"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to TicketBox</h1>
          <p className="text-xl mb-8 text-indigo-100">
            Your premium ticket management platform
          </p>

          {!isAuthenticated && (
            <div className="space-y-4">
              <Link
                href="/catalog"
                className="inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100"
              >
                Browse Concerts
              </Link>
              <p className="text-indigo-100">or</p>
              <Link
                href="/login"
                className="inline-block px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
