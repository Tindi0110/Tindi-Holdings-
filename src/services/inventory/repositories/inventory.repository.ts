import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class InventoryRepository {
  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock")
      .eq("is_active", true)
      .order("name");
    if (error) throw new Error(`[InventoryRepository] findAll: ${error.message}`);
    return (data ?? []).map((p) => ({
      product_id: p.id,
      product_name: p.name,
      current_stock: p.stock,
      low_stock_threshold: 10,
      is_low_stock: p.stock < 10,
    }));
  }

  static async findLowStock(threshold = 10) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, stock")
      .lt("stock", threshold)
      .eq("is_active", true)
      .order("stock", { ascending: true });
    if (error) throw new Error(`[InventoryRepository] findLowStock: ${error.message}`);
    return (data ?? []).map((p) => ({
      product_id: p.id,
      product_name: p.name,
      current_stock: p.stock,
      threshold,
    }));
  }

  static async updateStock(productId: string, delta: number) {
    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();
    const newStock = Math.max(0, (prod?.stock ?? 0) + delta);
    const { error } = await supabaseAdmin
      .from("products")
      .update({ stock: newStock })
      .eq("id", productId);
    if (error) throw new Error(`[InventoryRepository] updateStock: ${error.message}`);
    return newStock;
  }
}
