/**
 * Token types
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expires_in?: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
    permissions?: string[];
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
