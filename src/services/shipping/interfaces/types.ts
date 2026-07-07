export type DeliveryStatus = 'awaiting_pickup' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned';
export interface ShippingMethod {
  id: string;
  name: string;
  provider: string;
  estimated_days: number;
  price: number;
}
export interface TrackingEvent {
  id: string;
  order_id: string;
  status: DeliveryStatus;
  location: string;
  description: string;
  timestamp: string;
}
export interface TrackingInfo {
  order_number: string;
  current_status: DeliveryStatus | null;
  events: TrackingEvent[];
  tracking_number: string | null;
  courier: string | null;
}