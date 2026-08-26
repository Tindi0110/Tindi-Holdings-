export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "dispatched"
  | "delivered"
  | "completed"
  | "cancelled";

/**
 * Standardize order status string across both Admin and Customer views
 */
export function formatOrderStatus(status?: string | null): string {
  if (!status) return "Pending";
  const s = status.toLowerCase();
  if (s === "delivered" || s === "completed") return "Completed";
  if (s === "shipped" || s === "dispatched") return "Dispatched";
  if (s === "processing") return "Processing";
  if (s === "cancelled") return "Cancelled";
  if (s === "pending") return "Pending";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Standardize badge colors across both Admin and Customer views
 */
export function getOrderStatusBadgeClass(status?: string | null): string {
  if (!status) return "bg-warning/10 text-warning border-warning/20";
  const s = status.toLowerCase();
  if (s === "delivered" || s === "completed") {
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  }
  if (s === "shipped" || s === "dispatched") {
    return "bg-primary/10 text-primary border-primary/20";
  }
  if (s === "processing") {
    return "bg-amber-500/10 text-amber-600 border-amber-500/20";
  }
  if (s === "cancelled") {
    return "bg-destructive/10 text-destructive border-destructive/20";
  }
  return "bg-warning/10 text-warning border-warning/20";
}
