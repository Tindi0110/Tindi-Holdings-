import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { ProductRepository } from "../repositories/product.repository";

async function requireAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listProducts = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        categoryId: z.string().uuid().optional(),
        branchId: z.string().uuid().optional(),
        search: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        inStock: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        sortBy: z.enum(["price_asc", "price_desc", "newest"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => ProductRepository.findAll(data));

export const getProductBySlug = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string }) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => ProductRepository.findBySlug(data.slug));

export const listFeaturedProducts = createServerFn({ method: "GET" }).handler(async () =>
  ProductRepository.findFeatured(),
);

export const listCategories = createServerFn({ method: "GET" }).handler(async () =>
  ProductRepository.findCategories(),
);

export const searchProducts = createServerFn({ method: "POST" })
  .inputValidator((input: { query: string }) => z.object({ query: z.string() }).parse(input))
  .handler(async ({ data }) => ProductRepository.findAll({ search: data.query }));

export const createProduct = createServerFn({ method: "POST" })
  .inputValidator((input: any) =>
    z
      .object({
        name: z.string().min(1),
        price: z.number().positive(),
        description: z.string().optional(),
        category_id: z.string().uuid().optional(),
        stock: z.number().int().min(0).default(0),
        image_url: z.string().url().optional(),
        is_featured: z.boolean().default(false),
        compare_at_price: z.number().optional(),
      })
      .parse(input),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const id = await ProductRepository.create(data);
    return { id };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({ id: z.string().uuid() }).passthrough().parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    const { id, ...payload } = data;
    await ProductRepository.update(id, payload);
    return { success: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }: any) => {
    await requireAdmin(context.userId);
    await ProductRepository.softDelete(data.id);
    return { success: true };
  });
