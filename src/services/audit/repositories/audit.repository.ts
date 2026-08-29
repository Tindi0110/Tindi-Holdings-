import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { LogActionPayload, AuditFilter } from "../interfaces/types";

export class AuditRepository {
  static async insert(payload: LogActionPayload) {
    const { error } = await supabaseAdmin.from("receipt_actions").insert({
      receipt_id: payload.receiptId,
      action: payload.action,
      user_id: payload.userId || null,
      ip_address: payload.ipAddress || "127.0.0.1",
      device: payload.device || "Desktop",
      browser: payload.browser || "Unknown",
      os: payload.os || "Unknown",
      details: payload.details || {},
    });
    if (error) throw new Error(`[AuditRepository] insert: ${error.message}`);
  }

  static async findByFilter(filter: AuditFilter = {}) {
    let query = supabaseAdmin.from("receipt_actions").select("*");
    if (filter.receiptId) query = query.eq("receipt_id", filter.receiptId);
    if (filter.userId) query = query.eq("user_id", filter.userId);
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`[AuditRepository] findByFilter: ${error.message}`);
    return data ?? [];
  }
}
