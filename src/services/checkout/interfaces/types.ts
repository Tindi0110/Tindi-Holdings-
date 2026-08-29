export interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
}
export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: number;
}
export interface CouponValidation {
  valid: boolean;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  message?: string;
}
export interface CheckoutPayload {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_phone: string;
  payment_method: "cod" | "stripe" | "paypal" | "mpesa";
  payment_phone?: string | null;
  coupon_code?: string;
}
