import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SendNotificationPayload } from "../interfaces/types";

export class NotificationRepository {
  static async insert(payload: SendNotificationPayload) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: payload.userId || null,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        is_read: false
      })
      .select("*")
      .single();
    if (error) throw new Error(`[NotificationRepository] insert: ${error.message}`);
    return data;
  }

  static async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`[NotificationRepository] findByUserId: ${error.message}`);
    return data ?? [];
  }

  static async markRead(id: string, userId: string) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .or(`user_id.eq.${userId},user_id.is.null`);
    if (error) throw new Error(`[NotificationRepository] markRead: ${error.message}`);
  }

  static async markAllRead(userId: string) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);
    if (error) throw new Error(`[NotificationRepository] markAllRead: ${error.message}`);
  }

  static async countUnread(userId: string) {
    const { count, error } = await supabaseAdmin
      .from("notifications")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw new Error(`[NotificationRepository] countUnread: ${error.message}`);
    return count ?? 0;
  }

  static async deleteById(id: string, userId: string) {
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(`[NotificationRepository] deleteById: ${error.message}`);
  }
}