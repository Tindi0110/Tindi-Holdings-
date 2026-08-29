export type RecommendationType = "similar" | "trending" | "new_arrivals" | "bestseller";
export interface Recommendation {
  productId: string;
  productName: string;
  price: number;
  imageUrl: string | null;
  slug: string;
  score: number;
  type: RecommendationType;
}
