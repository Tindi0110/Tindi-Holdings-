import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class PaymentRepository {
  static async getOrder(orderId: string, userId?: string) {
    let query = supabaseAdmin.from("orders").select("*").eq("id", orderId);
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`[PaymentRepository] getOrder: ${error.message}`);
    return data;
  }

  static async updatePaymentStatus(orderId: string, status: string, reference?: string) {
    const updatePayload: any = { payment_status: status };
    if (reference) updatePayload.payment_reference = reference;
    const { error } = await supabaseAdmin.from("orders").update(updatePayload).eq("id", orderId);
    if (error) throw new Error(`[PaymentRepository] updatePaymentStatus: ${error.message}`);
  }
}
