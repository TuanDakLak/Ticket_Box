"use client";

import { useEffect, useState, useCallback } from "react";
import { decodeToken, tokenStorage, isTokenExpired } from "@/utils/token.utils";
import type { TokenPayload } from "@/types/auth.types";

/**
 * Custom hook for authentication
 * Provides auth state and user information
 */

interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: TokenPayload | null;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<TokenPayload | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const token = tokenStorage.getAccessToken();

    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      setUser(decoded);
      setIsAuthenticated(true);
    } else {
      tokenStorage.clearTokens();
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback((): void => {
    tokenStorage.clearTokens();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user || !user.permissions) {
        return false;
      }
      return user.permissions.includes(permission);
    },
    [user]
  );

  return {
    isAuthenticated,
    isLoading,
    user,
    logout,
    hasPermission,
  };
};
