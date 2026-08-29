export interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}
export interface CreateBranchPayload {
  name: string;
  address?: string;
  phone?: string;
}
export type UpdateBranchPayload = Partial<CreateBranchPayload> & { is_active?: boolean };
