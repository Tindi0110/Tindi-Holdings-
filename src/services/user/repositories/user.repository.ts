import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { UpdateProfilePayload, UserFilter } from "../interfaces/types";

export class UserRepository {
  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*, user_roles(role)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`[UserRepository] findById: ${error.message}`);
    return data;
  }

  static async findAll(filter: UserFilter = {}) {
    let query = supabaseAdmin.from("profiles").select("*, user_roles(role)");
    if (filter.search) {
      query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
    }
    if (filter.branchId) {
      query = query.eq("branch_id", filter.branchId);
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw new Error(`[UserRepository] findAll: ${error.message}`);
    return data ?? [];
  }

  static async update(id: string, data: UpdateProfilePayload) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`[UserRepository] update: ${error.message}`);
  }

  static async upsertRole(userId: string, role: string) {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role }, { onConflict: "user_id,role" });
    if (error) throw new Error(`[UserRepository] upsertRole: ${error.message}`);
  }

  static async removeRole(userId: string) {
    const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    if (error) throw new Error(`[UserRepository] removeRole: ${error.message}`);
  }
}
