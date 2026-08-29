export type NotificationType = "info" | "success" | "warning" | "error";
export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
export interface SendNotificationPayload {
  userId?: string | null;
  title: string;
  message: string;
  type: NotificationType;
}
