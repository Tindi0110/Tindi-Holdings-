export type SupplierStatus = "active" | "inactive" | "blacklisted";
export type POStatus = "draft" | "sent" | "confirmed" | "received" | "cancelled";
export interface Supplier {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: SupplierStatus;
  created_at: string;
}
export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: POStatus;
  total_amount: number;
  expected_delivery: string | null;
  notes: string | null;
  created_at: string;
}
export interface POLineItem {
  id: string;
  po_id: string;
  product_name: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}
export interface CreateSupplierPayload {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}
export interface CreatePOPayload {
  supplierId: string;
  items: Array<{ productName: string; quantity: number; unitCost: number }>;
  notes?: string;
}
