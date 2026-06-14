export type UserRole = 'Audience' | 'Staff' | 'Admin' | string;

export type User = {
  id: string;
  email: string;
  fullName: string;
  status?: 'PENDING' | 'ACTIVE' | string;
  roles: UserRole[];
  permissions: string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type RegisterResponse = {
  id: string;
  email: string;
  fullName: string;
  status: 'PENDING' | 'ACTIVE' | string;
  roles: UserRole[];
};

export type ApiMessageResponse = {
  message: string;
};

export type VerifyEmailResponse = {
  message?: string;
  url?: string;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
};
