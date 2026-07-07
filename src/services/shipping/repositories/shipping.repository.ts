import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class ShippingRepository {
  static async getOrderByNumber(orderNumber: string) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, profiles(email)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw new Error(`[ShippingRepository] getOrderByNumber: ${error.message}`);
    return data;
  }

  static async getOrderOwnerEmail(orderId: string) {
    const { data } = await supabaseAdmin
      .from("orders")
      .select("profiles(email)")
      .eq("id", orderId)
      .single();
    return (data as any)?.profiles?.email || null;
  }

  static async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw new Error(`[ShippingRepository] updateOrderStatus: ${error.message}`);
  }
}