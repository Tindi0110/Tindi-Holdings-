// ============================================================
// COMPATIBILITY SHIM — payments.functions.ts
// This file is now a re-export bridge to the Payment Service.
// New code should import directly from "@/services/payment"
// ============================================================

export {
  createStripeCheckout,
  verifyStripeSession,
  createPayPalOrder,
  capturePayPalOrder,
  initiateMpesaSTK,
  getPaymentStatus,
  simulateCOD,
} from "@/services/payment";
