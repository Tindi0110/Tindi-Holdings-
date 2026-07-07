import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SearchQuery } from "../interfaces/types";

export class SearchRepository {
  static async searchProducts(query: SearchQuery) {
    let qBuilder = supabaseAdmin
      .from("products")
      .select("*", { count: 'exact' })
      .eq("is_active", true);

    if (query.q) {
      qBuilder = qBuilder.ilike("name", `%${query.q}%`);
    }

    if (query.filters?.categoryId) {
      qBuilder = qBuilder.eq("category_id", query.filters.categoryId);
    }
    if (query.filters?.minPrice !== undefined) {
      qBuilder = qBuilder.gte("price", query.filters.minPrice);
    }
    if (query.filters?.maxPrice !== undefined) {
      qBuilder = qBuilder.lte("price", query.filters.maxPrice);
    }
    if (query.filters?.inStock) {
      qBuilder = qBuilder.gt("stock", 0);
    }

    if (query.sort === 'price_asc') qBuilder = qBuilder.order("price", { ascending: true });
    else if (query.sort === 'price_desc') qBuilder = qBuilder.order("price", { ascending: false });
    else qBuilder = qBuilder.order("created_at", { ascending: false });

    const { data, count, error } = await qBuilder.limit(20);
    if (error) throw new Error(`[SearchRepository] searchProducts: ${error.message}`);

    return {
      products: (data ?? []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image_url: p.image_url,
        stock: p.stock
      })),
      totalCount: count ?? 0,
      query: query.q
    };
  }

  static async getNameSuggestions(prefix: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("name")
      .ilike("name", `%${prefix}%`)
      .limit(8);
    if (error) throw new Error(`[SearchRepository] getNameSuggestions: ${error.message}`);
    return (data ?? []).map(p => ({ text: p.name, type: 'product' as const }));
  }
}