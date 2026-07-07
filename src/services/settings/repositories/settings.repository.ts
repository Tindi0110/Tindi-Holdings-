import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class SettingsRepository {
  static async findGlobal() {
    const { data, error } = await supabaseAdmin
      .from("receipt_settings")
      .select("*")
      .is("branch_id", null)
      .maybeSingle();
    if (error) throw new Error(`[SettingsRepository] findGlobal: ${error.message}`);
    return data;
  }

  static async findByBranch(branchId: string) {
    const { data, error } = await supabaseAdmin
      .from("receipt_settings")
      .select("*")
      .eq("branch_id", branchId)
      .maybeSingle();
    if (error) throw new Error(`[SettingsRepository] findByBranch: ${error.message}`);
    return data;
  }

  static async upsertGlobal(data: any) {
    const { error } = await supabaseAdmin
      .from("receipt_settings")
      .upsert({ ...data, branch_id: null, updated_at: new Date().toISOString() }, { onConflict: "branch_id" });
    if (error) throw new Error(`[SettingsRepository] upsertGlobal: ${error.message}`);
  }

  static async upsertBranch(branchId: string, data: any) {
    const { error } = await supabaseAdmin
      .from("receipt_settings")
      .upsert({ ...data, branch_id: branchId, updated_at: new Date().toISOString() }, { onConflict: "branch_id" });
    if (error) throw new Error(`[SettingsRepository] upsertBranch: ${error.message}`);
  }
}