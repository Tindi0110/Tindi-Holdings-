import { supabaseAdmin } from "@/integrations/supabase/client.server";

export class RecommendationRepository {
  static async getByCategory(categoryId: string, excludeId: string, limit = 6) {
    const { data } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .ne("id", excludeId)
      .eq("is_active", true)
      .limit(limit);
    return data ?? [];
  }

  static async getNewArrivals(limit = 8) {
    const { data } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    return data ?? [];
  }
}
