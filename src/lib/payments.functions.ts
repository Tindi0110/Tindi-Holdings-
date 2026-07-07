// ============================================================
// COMPATIBILITY SHIM â€” payments.functions.ts
// This file is now a re-export bridge to the Payment Service.
// New code should import directly from "@/services/payment"
// ============================================================

export {
  createStripeCheckout,
  getPaymentStatus,
  simulateCOD,
  verifyStripeSession,
} from "@/services/payment";