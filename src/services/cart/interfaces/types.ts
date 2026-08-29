export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    stock: number;
    slug: string;
  } | null;
}
export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}
export interface AddToCartPayload {
  productId: string;
  quantity: number;
}
