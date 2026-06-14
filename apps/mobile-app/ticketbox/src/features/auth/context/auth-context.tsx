import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authApi } from '@/features/auth/api/auth-api';
import type {
  ApiMessageResponse,
  AuthResponse,
  RegisterFormValues,
  RegisterResponse,
  User,
  VerifyEmailResponse,
} from '@/features/auth/types/auth.types';
import { resolveAuthRoute } from '@/features/auth/utils/resolve-auth-route';
import { setApiAccessToken } from '@/lib/api';
import { routes } from '@/lib/routes';
import { registerSessionUserHandler, registerUnauthorizedHandler, setSessionTokens } from '@/lib/session';
import { tokenStorage } from '@/lib/storage';

export type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  initialRoute: typeof routes.login | typeof routes.pendingApproval | typeof routes.staffHome;
  login: (email: string, password: string) => Promise<typeof routes.pendingApproval | typeof routes.staffHome>;
  register: (values: RegisterFormValues) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ApiMessageResponse>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  resetPassword: (token: string, newPassword: string) => Promise<ApiMessageResponse>;
  resendVerification: (email: string) => Promise<ApiMessageResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ApiMessageResponse>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applySession = async (payload: AuthResponse) => {
    setSessionTokens(payload.accessToken, payload.refreshToken);
    setApiAccessToken(payload.accessToken);
    await tokenStorage.setTokens(payload.accessToken, payload.refreshToken);
    setUser(payload.user);
  };

  const clearSession = async () => {
    setSessionTokens(null, null);
    setApiAccessToken(null);
    await tokenStorage.clearTokens();
    setUser(null);
  };

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await clearSession();
    });
    registerSessionUserHandler((nextUser) => {
      setUser(nextUser as User);
    });

    return () => {
      registerUnauthorizedHandler(null);
      registerSessionUserHandler(null);
    };
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const stored = await tokenStorage.getTokens();

        if (!stored.accessToken || !stored.refreshToken) {
          await clearSession();
          return;
        }

        setSessionTokens(stored.accessToken, stored.refreshToken);
        setApiAccessToken(stored.accessToken);

        const profile = await authApi.me();
        setUser(profile);
      } catch {
        await clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    }

    bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      isSubmitting,
      initialRoute: resolveAuthRoute(user),
      async login(email, password) {
        setIsSubmitting(true);
        try {
          const response = await authApi.login(email, password);
          await applySession(response);
          return resolveAuthRoute(response.user) as typeof routes.pendingApproval | typeof routes.staffHome;
        } finally {
          setIsSubmitting(false);
        }
      },
      async register(values) {
        setIsSubmitting(true);
        try {
          return await authApi.register(values.fullName, values.email, values.password);
        } finally {
          setIsSubmitting(false);
        }
      },
      async logout() {
        setIsSubmitting(true);
        try {
          await authApi.logout();
        } catch {
          // Ignore logout API failures and clear the local session anyway.
        } finally {
          await clearSession();
          setIsSubmitting(false);
        }
      },
      async forgotPassword(email) {
        setIsSubmitting(true);
        try {
          return await authApi.forgotPassword(email);
        } finally {
          setIsSubmitting(false);
        }
      },
      async verifyEmail(token) {
        setIsSubmitting(true);
        try {
          return await authApi.verifyEmail(token);
        } finally {
          setIsSubmitting(false);
        }
      },
      async resetPassword(token, newPassword) {
        setIsSubmitting(true);
        try {
          return await authApi.resetPassword(token, newPassword);
        } finally {
          setIsSubmitting(false);
        }
      },
      async resendVerification(email) {
        setIsSubmitting(true);
        try {
          return await authApi.resendVerification(email);
        } finally {
          setIsSubmitting(false);
        }
      },
      async changePassword(oldPassword, newPassword) {
        setIsSubmitting(true);
        try {
          return await authApi.changePassword(oldPassword, newPassword);
        } finally {
          setIsSubmitting(false);
        }
      },
    }),
    [isBootstrapping, isSubmitting, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
