export {
  listProducts,
  getProductBySlug,
  listFeaturedProducts,
  listCategories,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./core/product.service";
export { ProductRepository } from "./repositories/product.repository";
export {
  useProducts,
  useProduct,
  useFeaturedProducts,
  useCategories,
  useSearchProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "./hooks/useProductService";
export type {
  Product,
  Category,
  ProductFilter,
  CreateProductPayload,
  UpdateProductPayload,
} from "./interfaces/types";
