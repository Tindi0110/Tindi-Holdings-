export type AuditAction = 'created' | 'updated' | 'deleted' | 'viewed' | 'printed' | 'downloaded' | 'emailed' | 'refunded' | 'login' | 'logout';
export interface AuditEvent {
  id: string;
  receipt_id: string;
  action: string;
  user_id: string | null;
  ip_address: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  details: Record<string, any>;
  created_at: string;
}
export interface LogActionPayload {
  receiptId: string;
  action: string;
  userId?: string | null;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  details?: Record<string, any>;
}
export interface AuditFilter {
  receiptId?: string;
  userId?: string;
}