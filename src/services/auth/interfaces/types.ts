export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}
export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}
export interface AuthSession {
  user: AuthUser | null;
  accessToken: string | null;
}
export interface PasswordResetPayload {
  email: string;
}
export interface UpdatePasswordPayload {
  password: string;
}
