import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class AuthRepository {
  static async getProfileById(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(`[AuthRepository] getProfileById: ${error.message}`);
    return data;
  }

  static async upsertProfile(userId: string, data: { full_name?: string; email?: string }) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, ...data, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) throw new Error(`[AuthRepository] upsertProfile: ${error.message}`);
  }

  static async getRolesForUser(userId: string) {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (error) throw new Error(`[AuthRepository] getRolesForUser: ${error.message}`);
    return data ?? [];
  }
}