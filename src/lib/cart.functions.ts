// ============================================================
// COMPATIBILITY SHIM â€” cart.functions.ts
// This file is now a re-export bridge to the Cart Service.
// New code should import directly from "@/services/cart"
// ============================================================

export {
  getCart,
  getCartSummary as getCartTotals,
  addToCart,
  removeFromCart,
  updateCartQuantity as updateCartItem,
  clearCart,
} from "@/services/cart";

// Alias for older route callers that used removeCartItem
export { removeFromCart as removeCartItem } from "@/services/cart";
