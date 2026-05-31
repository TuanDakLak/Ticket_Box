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
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}
