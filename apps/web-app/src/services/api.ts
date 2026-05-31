import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { tokenStorage } from "@/utils/token.utils";
import type { ApiErrorResponse } from "@/types/auth.types";

/**
 * Centralized Axios instance for API communication
 * Configured with base URL, timeout, and automatic interceptor setup
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor: Inject JWT token into Authorization header
 * - Extract token from localStorage
 * - Attach as Bearer token to every request
 * - Handle errors gracefully
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor: Handle authentication errors globally
 * - Intercept 401 Unauthorized: Token expired or invalid
 * - Intercept 403 Forbidden: User lacks permissions
 * - Clear credentials and redirect to login
 * - Prevent infinite redirect loops
 */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: unknown,
  token: string | null = null
): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const refreshToken = tokenStorage.getRefreshToken();

          if (!refreshToken) {
            // No refresh token available, redirect to login
            throw new Error("No refresh token available");
          }

          // You can implement token refresh logic here
          // For now, we'll just clear tokens and redirect
          tokenStorage.clearTokens();
          processQueue(null, null);

          // Redirect to login page
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(error);
        } catch (err) {
          // Refresh failed, clear tokens and redirect
          tokenStorage.clearTokens();
          processQueue(err, null);

          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }

          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }

      // Wait for token refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve,
          reject,
        });
      }).then(() => {
        // Retry original request with new token
        const token = tokenStorage.getAccessToken();
        if (token && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
        return Promise.reject(error);
      });
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);

      if (typeof window !== "undefined") {
        window.location.href = "/access-denied";
      }

      return Promise.reject(error);
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;
