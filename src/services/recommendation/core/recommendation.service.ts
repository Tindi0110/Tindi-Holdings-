import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { RecommendationRepository } from "../repositories/recommendation.repository";
import { RecommendationType } from "../interfaces/types";

export const getSimilarProducts = createServerFn({ method: "POST" })
  .inputValidator((input: { categoryId: string; productId: string }) => z.object({ categoryId: z.string().uuid(), productId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    // Custom logic to fetch products and map to recommendations
    // Since custom operator ne doesn't exist natively on supabase js client, we can filter locally or map it
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: raw } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("category_id", data.categoryId)
      .eq("is_active", true)
      .limit(6);
    
    const items = (raw ?? []).filter(p => p.id !== data.productId);
    return items.map(p => ({
      productId: p.id,
      productName: p.name,
      price: Number(p.price),
      imageUrl: p.image_url,
      slug: p.slug,
      score: 0.9,
      type: "similar" as const
    }));
  });

export const getNewArrivalRecommendations = createServerFn({ method: "GET" })
  .handler(async () => {
    const items = await RecommendationRepository.getNewArrivals();
    return items.map(p => ({
      productId: p.id,
      productName: p.name,
      price: Number(p.price),
      imageUrl: p.image_url,
      slug: p.slug,
      score: 0.95,
      type: "new_arrivals" as const
    }));
  });