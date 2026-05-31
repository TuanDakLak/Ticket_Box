"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Protected route component
 * Automatically redirects to login if user is not authenticated
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check permission if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push("/access-denied");
    }
  }, [isAuthenticated, isLoading, requiredPermission, hasPermission, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  // Show access denied if not authenticated or missing permission
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">
          Access Denied
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
