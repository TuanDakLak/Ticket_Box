import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/auth.types";

/**
 * API error handling utilities
 */

/**
 * Extract error message from API response
 */
export const getErrorMessage = (
  error: unknown
): string => {
  if (error instanceof Error) {
    // Standard Error
    if (error.message === "Network Error") {
      return "Network error. Please check your connection.";
    }
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  // Check if it's an Axios error
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.message) {
    return axiosError.message;
  }

  return "An unexpected error occurred. Please try again.";
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return !axiosError.response || axiosError.code === "ERR_NETWORK";
};

/**
 * Check if error is authentication related
 */
export const isAuthError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return axiosError.response?.status === 401 || axiosError.response?.status === 403;
};

/**
 * Check if error is server error (5xx)
 */
export const isServerError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  return (axiosError.response?.status ?? 0) >= 500;
};

/**
 * Check if error is client error (4xx, not auth)
 */
export const isClientError = (error: unknown): boolean => {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status ?? 0;
  return status >= 400 && status < 500 && status !== 401 && status !== 403;
};
