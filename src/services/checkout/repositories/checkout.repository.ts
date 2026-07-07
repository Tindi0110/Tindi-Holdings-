import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class CartCheckoutRepository {
  static async getCartForCheckout(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select("*, products(id, name, price, stock)")
      .eq("user_id", userId);
    if (error) throw new Error(`[CartCheckoutRepository] getCartForCheckout: ${error.message}`);
    return data ?? [];
  }

  static async insertOrder(payload: any) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(payload)
      .select("id, order_number")
      .single();
    if (error) throw new Error(`[CartCheckoutRepository] insertOrder: ${error.message}`);
    return data;
  }

  static async insertOrderItems(items: any[]) {
    const { error } = await supabaseAdmin
      .from("order_items")
      .insert(items);
    if (error) throw new Error(`[CartCheckoutRepository] insertOrderItems: ${error.message}`);
  }

  static async clearCart(userId: string) {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("user_id", userId);
    if (error) throw new Error(`[CartCheckoutRepository] clearCart: ${error.message}`);
  }
}