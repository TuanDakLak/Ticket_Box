import { apiClient } from '@/lib/api';
import type { ApiMessageResponse, AuthResponse, RegisterResponse, User } from '@/features/auth/types/auth.types';

export const authApi = {
  async login(email: string, password: string) {
    const response = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },

  async register(fullName: string, email: string, password: string) {
    const response = await apiClient.post<RegisterResponse>('/auth/register', { fullName, email, password });
    return response.data;
  },

  async me() {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async verifyEmail(token: string) {
    const response = await apiClient.get<{ message?: string; url?: string }>('/auth/verify', {
      params: { token },
    });
    return response.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post<ApiMessageResponse>(
      '/auth/forgot-password',
      { email },
    );
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await apiClient.post<ApiMessageResponse>(
      '/auth/reset-password',
      { token, newPassword },
    );
    return response.data;
  },

  async resendVerification(email: string) {
    const response = await apiClient.post<ApiMessageResponse>(
      '/auth/resend-verification',
      { email },
    );
    return response.data;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await apiClient.post<ApiMessageResponse>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post<ApiMessageResponse>('/auth/logout');
    return response.data;
  },
};
