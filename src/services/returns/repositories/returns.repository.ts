import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class ReturnsRepository {
  static async insertReturn(payload: any) {
    const { data, error } = await supabaseAdmin
      .from("refund_receipts")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new Error(`[ReturnsRepository] insertReturn: ${error.message}`);
    return data;
  }

  static async findByUserId(userId: string) {
    // Query refunds where original receipt belongs to the user
    const { data, error } = await supabaseAdmin
      .from("refund_receipts")
      .select("*, receipts(*)")
      .eq("receipts.user_id", userId);
    if (error) throw new Error(`[ReturnsRepository] findByUserId: ${error.message}`);
    return (data ?? []).filter((r) => r.receipts !== null);
  }

  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from("refund_receipts")
      .select("*, receipts(*), profiles:staff_id(full_name)");
    if (error) throw new Error(`[ReturnsRepository] findAll: ${error.message}`);
    return data ?? [];
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("refund_receipts")
      .select("*, receipts(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`[ReturnsRepository] findById: ${error.message}`);
    return data;
  }

  static async updateStatus(id: string, details: any) {
    // Note: Since status doesn't exist natively on refund_receipts in migration, we use the original receipt status or log it in details
    // We update the original receipt's status to 'refunded' if approved
    const { error } = await supabaseAdmin.from("refund_receipts").update(details).eq("id", id);
    if (error) throw new Error(`[ReturnsRepository] updateStatus: ${error.message}`);
  }
}
