"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
  allowedPermissions,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    if (allowedRoles?.length) {
      const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
      if (!hasRequiredRole) {
        router.push("/access-denied");
        return;
      }
    }

    if (allowedPermissions?.length) {
      const hasRequiredPermission = allowedPermissions.some((perm) =>
        hasPermission(perm)
      );
      if (!hasRequiredPermission) {
        router.push("/access-denied");
        return;
      }
    }

    setIsAuthorized(true);
  }, [
    isLoading,
    isAuthenticated,
    user,
    router,
    pathname,
    allowedRoles,
    allowedPermissions,
    hasRole,
    hasPermission,
  ]);

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
