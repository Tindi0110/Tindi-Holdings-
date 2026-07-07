export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  branch_id: string | null;
  created_at: string;
}
export interface UserRole {
  user_id: string;
  role: 'admin' | 'manager' | 'customer';
}
export interface UpdateProfilePayload {
  full_name?: string;
  avatar_url?: string;
}
export interface UserFilter {
  role?: string;
  branchId?: string;
  search?: string;
}