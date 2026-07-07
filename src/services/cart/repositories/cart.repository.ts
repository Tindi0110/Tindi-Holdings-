import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class CartRepository {
  static async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("cart_items")
      .select("*, products(id, name, price, image_url, stock, slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`[CartRepository] findByUserId: ${error.message}`);
    return data ?? [];
  }

  static async findItem(userId: string, productId: string) {
    const { data } = await supabaseAdmin
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();
    return data;
  }

  static async insertItem(userId: string, productId: string, quantity: number) {
    const { error } = await supabaseAdmin
      .from("cart_items")
      .insert({ user_id: userId, product_id: productId, quantity });
    if (error) throw new Error(`[CartRepository] insertItem: ${error.message}`);
  }

  static async updateItem(id: string, quantity: number) {
    const { error } = await supabaseAdmin
      .from("cart_items").update({ quantity }).eq("id", id);
    if (error) throw new Error(`[CartRepository] updateItem: ${error.message}`);
  }

  static async deleteItem(id: string) {
    const { error } = await supabaseAdmin.from("cart_items").delete().eq("id", id);
    if (error) throw new Error(`[CartRepository] deleteItem: ${error.message}`);
  }

  static async clearByUserId(userId: string) {
    const { error } = await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);
    if (error) throw new Error(`[CartRepository] clearByUserId: ${error.message}`);
  }
}