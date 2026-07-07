export interface SearchQuery {
  q: string;
  filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  };
  sort?: 'price_asc' | 'price_desc' | 'newest';
}
export interface SearchResult {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string | null;
    stock: number;
  }>;
  totalCount: number;
  query: string;
}
export interface SearchSuggestion {
  text: string;
  type: 'product' | 'category';
}