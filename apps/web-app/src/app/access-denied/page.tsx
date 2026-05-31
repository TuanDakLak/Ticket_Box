"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function AccessDeniedPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center px-6">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">403</h1>
        <h2 className="text-3xl font-semibold mb-6">Access Denied</h2>
        <p className="text-xl mb-8 text-red-100">
          You don&apos;t have permission to access this resource.
        </p>

        {isAuthenticated ? (
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        ) : (
          <>
            <p className="mb-4">Please log in to continue.</p>
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
