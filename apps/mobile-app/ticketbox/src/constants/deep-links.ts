import { APP_CONFIG } from '@/constants/app-config';

export const DEEP_LINKS = {
  verifyEmail: `${APP_CONFIG.scheme}://verify?token={token}`,
  resetPassword: `${APP_CONFIG.scheme}://reset-password?token={token}`,
} as const;
