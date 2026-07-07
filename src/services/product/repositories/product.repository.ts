import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ProductFilter, CreateProductPayload, UpdateProductPayload } from "../interfaces/types";

export class ProductRepository {
  static async findAll(filter: ProductFilter = {}) {
    let query = supabaseAdmin
      .from("products")
      .select("*, categories(name, slug)")
      .eq("is_active", true);

    if (filter.categoryId) query = query.eq("category_id", filter.categoryId);
    if (filter.branchId) query = query.eq("branch_id", filter.branchId);
    if (filter.inStock) query = query.gt("stock", 0);
    if (filter.isFeatured) query = query.eq("is_featured", true);
    if (filter.minPrice !== undefined) query = query.gte("price", filter.minPrice);
    if (filter.maxPrice !== undefined) query = query.lte("price", filter.maxPrice);
    if (filter.search) query = query.ilike("name", `%${filter.search}%`);

    switch (filter.sortBy) {
      case 'price_asc': query = query.order("price", { ascending: true }); break;
      case 'price_desc': query = query.order("price", { ascending: false }); break;
      case 'newest': query = query.order("created_at", { ascending: false }); break;
      default: query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(`[ProductRepository] findAll: ${error.message}`);
    return data ?? [];
  }

  static async findBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(`[ProductRepository] findBySlug: ${error.message}`);
    return data;
  }

  static async findFeatured(limit = 8) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`[ProductRepository] findFeatured: ${error.message}`);
    return data ?? [];
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`[ProductRepository] findById: ${error.message}`);
    return data;
  }

  static async create(payload: CreateProductPayload) {
    const slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({ ...payload, slug, is_active: true })
      .select("id").single();
    if (error) throw new Error(`[ProductRepository] create: ${error.message}`);
    return data.id;
  }

  static async update(id: string, payload: UpdateProductPayload) {
    const { error } = await supabaseAdmin.from("products").update(payload).eq("id", id);
    if (error) throw new Error(`[ProductRepository] update: ${error.message}`);
  }

  static async softDelete(id: string) {
    const { error } = await supabaseAdmin.from("products").update({ is_active: false }).eq("id", id);
    if (error) throw new Error(`[ProductRepository] softDelete: ${error.message}`);
  }

  static async findCategories() {
    const { data, error } = await supabaseAdmin.from("categories").select("*").order("sort_order");
    if (error) throw new Error(`[ProductRepository] findCategories: ${error.message}`);
    return data ?? [];
  }
}