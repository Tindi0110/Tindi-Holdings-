// ============================================================
// RECEIPT & DOCUMENT SERVICE â€” Public Barrel
// Routes and components should import from here.
// Core receipt logic lives in src/lib/receipts.functions.ts
// which is preserved as the canonical receipt service module
// (contains full cryptographic verification, QR codes, etc.)
// ============================================================

export {
  createReceipt,
  getReceipt,
  getOrderReceipt,
  listMyReceipts,
  listAdminReceipts,
  verifyReceipt,
  generateReceiptPDF,
  generateSignature,
} from "@/lib/receipts.functions";