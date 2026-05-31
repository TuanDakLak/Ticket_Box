"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function CatalogPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          TicketBox
        </Link>
        <div className="flex gap-4">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Browse Concerts
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample concert card placeholder */}
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-t-lg"></div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cool Band Live
              </h3>
              <p className="text-gray-600 mb-4">June 15, 2026 • Concert Hall</p>
              <p className="text-gray-700 mb-4">
                Experience an unforgettable night with our favorite band
              </p>
              <button className="w-full py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700">
                View Details
              </button>
            </div>
          </div>

          {/* Additional cards can be added here */}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">
            More concerts coming soon!
          </h2>
          <p className="text-blue-700">
            Subscribe to updates to be notified when new events are added.
          </p>
        </div>
      </div>
    </div>
  );
}
