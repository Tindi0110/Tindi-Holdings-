export interface StockLevel {
  product_id: string;
  product_name: string;
  current_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
}
export interface InventoryAdjustment {
  product_id: string;
  quantity_delta: number;
  reason: string;
}
export interface LowStockAlert {
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
}
