// User related types
export type UserRole = 'admin' | 'user';

export type AuthStep = 1 | 2;

export type OTPType = 'signup' | 'reset';

// API Response types
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// Token types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
