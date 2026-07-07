// ============================================================
// COMPATIBILITY SHIM â€” orders.functions.ts
// This file is now a re-export bridge to the Order Service.
// New code should import directly from "@/services/order"
// ============================================================

export {
  placeOrder,
  listMyOrders,
  getMyOrder,
  trackOrder as getPublicOrderTrack,
  listAdminOrders,
  updateOrderStatus,
} from "@/services/order";

// Direct alias for getPublicOrderTrack used in some track-order routes
export { trackOrder } from "@/services/order";