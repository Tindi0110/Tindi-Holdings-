import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { OrderFilter, OrderStatus } from "../interfaces/types";

export class OrderRepository {
  static async findByUserId(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, status, total, created_at, payment_method, payment_status")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`[OrderRepository] findByUserId: ${error.message}`);
    return data ?? [];
  }

  static async findById(id: string, userId?: string) {
    let query = supabaseAdmin.from("orders").select("*, order_items(*)").eq("id", id);
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`[OrderRepository] findById: ${error.message}`);
    return data;
  }

  static async findByOrderNumber(orderNumber: string) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (error) throw new Error(`[OrderRepository] findByOrderNumber: ${error.message}`);
    return data;
  }

  static async findAll(filter: OrderFilter = {}) {
    let query = supabaseAdmin
      .from("orders")
      .select("*, profiles(full_name, email), branches(name)");
    if (filter.status) query = query.eq("status", filter.status);
    if (filter.branchId) query = query.eq("branch_id", filter.branchId);
    if (filter.userId) query = query.eq("user_id", filter.userId);
    query = query.order("created_at", { ascending: false });
    const { data, error } = await query;
    if (error) throw new Error(`[OrderRepository] findAll: ${error.message}`);
    return data ?? [];
  }

  static async insert(payload: any) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(payload)
      .select("id, order_number")
      .single();
    if (error) throw new Error(`[OrderRepository] insert: ${error.message}`);
    return data;
  }

  static async insertItems(items: any[]) {
    const { error } = await supabaseAdmin.from("order_items").insert(items);
    if (error) throw new Error(`[OrderRepository] insertItems: ${error.message}`);
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
    if (error) throw new Error(`[OrderRepository] updateStatus: ${error.message}`);
  }
}
