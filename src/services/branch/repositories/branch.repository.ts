import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CreateBranchPayload, UpdateBranchPayload } from "../interfaces/types";

export class BranchRepository {
  static async findAll(activeOnly = false) {
    let query = supabaseAdmin.from("branches").select("*").order("name");
    if (activeOnly) query = query.eq("is_active", true);
    const { data, error } = await query;
    if (error) throw new Error(`[BranchRepository] findAll: ${error.message}`);
    return data ?? [];
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin.from("branches").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`[BranchRepository] findById: ${error.message}`);
    return data;
  }

  static async create(payload: CreateBranchPayload) {
    const { data, error } = await supabaseAdmin.from("branches").insert(payload).select("id").single();
    if (error) throw new Error(`[BranchRepository] create: ${error.message}`);
    return data.id;
  }

  static async update(id: string, payload: UpdateBranchPayload) {
    const { error } = await supabaseAdmin.from("branches").update(payload).eq("id", id);
    if (error) throw new Error(`[BranchRepository] update: ${error.message}`);
  }

  static async softDelete(id: string) {
    const { error } = await supabaseAdmin.from("branches").update({ is_active: false }).eq("id", id);
    if (error) throw new Error(`[BranchRepository] softDelete: ${error.message}`);
  }
}