import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { SearchRepository } from "../repositories/search.repository";

export const searchProducts = createServerFn({ method: "POST" })
  .inputValidator((input: any) => z.object({
    q: z.string(),
    filters: z.object({
      categoryId: z.string().uuid().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      inStock: z.boolean().optional()
    }).optional(),
    sort: z.enum(["price_asc", "price_desc", "newest"]).optional()
  }).parse(input))
  .handler(async ({ data }) => {
    return SearchRepository.searchProducts(data);
  });

export const getSearchSuggestions = createServerFn({ method: "POST" })
  .inputValidator((input: { prefix: string }) => z.object({ prefix: z.string() }).parse(input))
  .handler(async ({ data }) => {
    return SearchRepository.getNameSuggestions(data.prefix);
  });

export const getTrendingSearches = createServerFn({ method: "GET" })
  .handler(async () => {
    return ["electronics", "apparel", "home goods", "featured", "sale", "new arrivals"];
  });