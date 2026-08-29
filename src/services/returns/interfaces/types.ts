export type ReturnStatus = "requested" | "approved" | "rejected" | "completed" | "cancelled";
export type ReturnReason =
  | "defective"
  | "wrong_item"
  | "not_as_described"
  | "changed_mind"
  | "damaged_in_transit"
  | "other";
export interface ReturnRequest {
  id: string;
  refund_number: string;
  original_receipt_id: string;
  refund_amount: number;
  refund_reason: string;
  staff_id: string | null;
  status: ReturnStatus;
  created_at: string;
}
export interface CreateReturnPayload {
  receiptId: string;
  reason: ReturnReason;
  amount: number;
  description: string;
}
export interface ProcessReturnPayload {
  returnId: string;
  status: ReturnStatus;
}
