export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  branch_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_phone: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface OrderFilter {
  status?: OrderStatus;
  branchId?: string;
  userId?: string;
  search?: string;
}

export interface PlaceOrderPayload {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_phone: string;
  payment_method: "cod" | "stripe" | "paypal" | "mpesa";
  payment_phone?: string | null;
}
