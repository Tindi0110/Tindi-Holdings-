import crypto from "crypto";

export function generateHMACSignature(
  receiptNumber: string,
  amount: number,
  branchId: string | null,
): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "tindi-document-service-hmac-salt-key-v2";
  const data = `${receiptNumber}|${amount.toFixed(2)}|${branchId ?? ""}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function generateDocumentHash(receiptPayload: any, items: any[]): string {
  const rawData = {
    receipt_number: receiptPayload.receipt_number,
    document_type: receiptPayload.document_type,
    amount_paid: receiptPayload.amount_paid,
    tax_amount: receiptPayload.tax_amount,
    discount_amount: receiptPayload.discount_amount,
    created_at: receiptPayload.created_at || new Date().toISOString(),
    items: items.map((i) => ({ name: i.product_name, qty: i.quantity, price: i.unit_price })),
  };
  return crypto.createHash("sha256").update(JSON.stringify(rawData)).digest("hex");
}

export function verifyCryptographicSignature(
  receiptNumber: string,
  amount: number,
  branchId: string | null,
  signature: string,
): boolean {
  const expectedSignature = generateHMACSignature(receiptNumber, amount, branchId);
  return expectedSignature === signature;
}
