export type DocumentType =
  | "sales_receipt"
  | "invoice"
  | "quotation"
  | "refund_receipt"
  | "return_receipt"
  | "exchange_receipt"
  | "delivery_note"
  | "purchase_order"
  | "supplier_receipt"
  | "stock_transfer_note"
  | "credit_note"
  | "debit_note"
  | "proforma_invoice"
  | "payment_confirmation"
  | "subscription_receipt"
  | "gift_receipt"
  | "tax_invoice";

export type ReceiptStatus =
  | "generated"
  | "viewed"
  | "printed"
  | "downloaded"
  | "shared"
  | "emailed"
  | "cancelled"
  | "refunded"
  | "returned"
  | "archived";

export type PaperSize = "A4" | "A5" | "58mm" | "80mm";
export type LayoutOrientation = "portrait" | "landscape";

export interface ReceiptItemPayload {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  stock_before?: number;
  stock_remaining?: number;
  warehouse?: string;
  inventory_transaction_id?: string;
}

export interface DocumentPayload {
  document_type: DocumentType;
  order_id?: string;
  branch_id?: string;
  user_id?: string;
  company_id?: string;
  company_name?: string;
  amount_paid: number;
  currency?: string;
  tax_amount?: number;
  tax_details?: {
    vat_rate?: number;
    vat_amount?: number;
    pin?: string;
    breakdown?: Record<string, number>;
  };
  discount_amount?: number;
  discount_details?: {
    coupon?: string;
    voucher?: string;
    percentage?: number;
    amount?: number;
  };
  loyalty_points?: {
    earned?: number;
    redeemed?: number;
    balance?: number;
    tier?: string;
  };
  payment_method?: string;
  payment_details?: {
    gateway?: string;
    reference?: string;
    mpesa_receipt?: string | null;
    card_last_four?: string | null;
    bank_reference?: string | null;
    wallet_id?: string | null;
  };
  shipping_details?: {
    address?: string;
    method?: string;
    courier?: string;
    tracking_number?: string;
    status?: string;
  };
  items: ReceiptItemPayload[];
}

export interface ReceiptSettings {
  id?: string;
  branch_id: string | null;
  company_name: string;
  company_logo?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  tagline?: string | null;
  return_policy?: string | null;
  terms?: string | null;
  footer_message?: string | null;
  social_media?: Record<string, string>;
  paper_size?: string;
  font_family?: string;
  receipt_width?: string;
  date_format?: string;
  time_format?: string;
  currency_default?: string;
  tax_registration_number?: string | null;
}

export interface BuilderConfig {
  id?: string;
  branch_id: string | null;
  company_id?: string | null;
  primary_color: string;
  font_family: string;
  show_header: boolean;
  show_footer: boolean;
  show_barcode: boolean;
  show_qrcode: boolean;
  show_loyalty: boolean;
  show_shipping: boolean;
  show_payment_details: boolean;
  layout_sections: string[];
}

export interface TelemetryMetadata {
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  os?: string;
  browser?: string;
  platform?: string;
  [key: string]: any;
}
