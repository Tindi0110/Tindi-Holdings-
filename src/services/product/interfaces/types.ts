export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  category_id: string | null;
  branch_id: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}
export interface ProductFilter {
  categoryId?: string;
  branchId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}
export interface CreateProductPayload {
  name: string;
  price: number;
  description?: string;
  category_id?: string;
  stock?: number;
  image_url?: string;
  is_featured?: boolean;
  compare_at_price?: number;
}
export type UpdateProductPayload = Partial<CreateProductPayload> & { is_active?: boolean };