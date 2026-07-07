// ============================================================
// COMPATIBILITY SHIM â€” catalog.functions.ts
// This file is now a re-export bridge to the Product & Branch Services.
// New code should import directly from "@/services/product" or "@/services/branch"
// ============================================================

export {
  listBranches,
} from "@/services/branch";

export {
  listCategories,
  listProducts,
  getProductBySlug,
  listFeaturedProducts,
} from "@/services/product";