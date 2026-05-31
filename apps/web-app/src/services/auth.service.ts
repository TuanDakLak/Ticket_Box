import apiClient from "./api";
import type { AuthResponse } from "@/types/auth.types";
import { tokenStorage } from "@/utils/token.utils";

/**
 * Authentication service
 * Handles login, registration, and token refresh
 */

export const authService = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      if (response.data) {
        // Backend returns camelCase: accessToken, refreshToken
        tokenStorage.setTokens(
          response.data.accessToken,
          response.data.refreshToken
        );
      }

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  /**
   * Register new user
   */
  register: async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", {
        email,
        password,
        fullName,
      });

      if (response.data) {
        // Register response may not include tokens; guard accordingly
        if ((response.data as any).accessToken && (response.data as any).refreshToken) {
          tokenStorage.setTokens(
            (response.data as any).accessToken,
            (response.data as any).refreshToken
          );
        }
      }

      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  },

  /**
   * Logout - clear tokens
   */
  logout: (): void => {
    tokenStorage.clearTokens();
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.post<AuthResponse>(
        "/auth/refresh",
        {
          refreshToken,
        }
      );

      if (response.data) {
        tokenStorage.setTokens(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      }

      throw new Error("Failed to refresh token");
    } catch (error) {
      console.error("Token refresh failed:", error);
      tokenStorage.clearTokens();
      throw error;
    }
  },

  /**
   * Verify token is valid
   */
  verifyToken: (): boolean => {
    return tokenStorage.hasToken();
  },
};
