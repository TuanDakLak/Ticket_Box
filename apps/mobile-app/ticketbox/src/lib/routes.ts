import type { Href } from 'expo-router';

export const routes = {
  login: '/login' as Href,
  register: '/register' as Href,
  verify: '/verify' as Href,
  forgotPassword: '/forgot-password' as Href,
  resetPassword: '/reset-password' as Href,
  resendVerification: '/resend-verification' as Href,
  pendingApproval: '/pending-approval' as Href,
  staffHome: '/staff' as Href,
  staffProfile: '/staff/profile' as Href,
  staffScanner: '/staff/scanner' as Href,
} as const;
