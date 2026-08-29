import { ReceiptRepository } from "../repositories/receipt.repository";
import { generateHMACSignature, generateDocumentHash, verifyCryptographicSignature } from "../utils/crypto";
import { DocumentPayload, ReceiptSettings, BuilderConfig, TelemetryMetadata, ReceiptStatus } from "../interfaces/types";
import { ReceiptTemplates } from "../templates/receipt.templates";

export class ReceiptService {
  // 1. Core Document Creation API
  static async createDocument(payload: DocumentPayload) {
    const { document_type, amount_paid, branch_id, user_id, company_id, company_name } = payload;

    // Generate unique prefix based on document type
    const prefixMap: Record<string, string> = {
      sales_receipt: "RCP",
      invoice: "INV",
      quotation: "QTN",
      refund_receipt: "REF",
      delivery_note: "DLV",
      purchase_order: "PO",
    };
    const prefix = prefixMap[document_type] || "DOC";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const docNumber = `${prefix}-${dateStr}-${randomSuffix}`;
    const invoiceNumber = `REF-${dateStr}-${randomSuffix}`;

    // Cryptographic signature
    const signature = generateHMACSignature(docNumber, amount_paid, branch_id || null);

    // Build DB payload
    const receiptPayload: any = {
      receipt_number: docNumber,
      document_type,
      order_id: payload.order_id || null,
      invoice_number: invoiceNumber,
      branch_id: branch_id || null,
      user_id: user_id || null,
      company_id: company_id || null,
      company_name: company_name || "Tindi Holdings Ltd",
      amount_paid,
      currency: payload.currency || "KES",
      tax_amount: payload.tax_amount || 0,
      tax_details: payload.tax_details || {},
      discount_amount: payload.discount_amount || 0,
      discount_details: payload.discount_details || {},
      loyalty_points: payload.loyalty_points || {},
      payment_method: payload.payment_method || "cod",
      payment_details: payload.payment_details || {},
      shipping_details: payload.shipping_details || {},
      status: "generated" as const,
      receipt_hash: "temp",
      digital_signature: signature,
      is_archived: false,
    };

    // Calculate receipt line items stock snapshots
    const items = payload.items || [];
    const itemsToInsert = items.map((it, idx) => ({
      product_id: it.product_id || null,
      product_name: it.product_name,
      quantity: it.quantity,
      unit_price: it.unit_price,
      stock_before: it.stock_before || 0,
      stock_remaining: it.stock_remaining || 0,
      warehouse: it.warehouse || "Primary Warehouse",
      inventory_transaction_id: it.inventory_transaction_id || `TXN-${dateStr}-${idx}-${randomSuffix}`,
    }));

    // Calculate SHA-256 hash of items + payload
    const hash = generateDocumentHash(receiptPayload, itemsToInsert);
    receiptPayload.receipt_hash = hash;

    // Persist Document
    const documentId = await ReceiptRepository.insertDocument(receiptPayload);

    // Persist Line Items
    const itemsWithIds = itemsToInsert.map(it => ({
      receipt_id: documentId,
      ...it
    }));
    await ReceiptRepository.insertItems(itemsWithIds);

    // Register action audit trail
    await ReceiptRepository.logAction({
      receipt_id: documentId,
      action: "generated",
      details: { trigger: "service_api_create" }
    });

    return { documentId, docNumber, signature };
  }

  // 2. Cryptographic Document Verification API (Exposes zero sensitive data)
  static async verifyDocument(receiptNumber: string, signature: string) {
    const receipt = await ReceiptRepository.findByNumber(receiptNumber);
    if (!receipt) {
      return { verified: false, reason: "No transaction matching this document exists on the ledger." };
    }

    const verified = verifyCryptographicSignature(receiptNumber, Number(receipt.amount_paid), receipt.branch_id, signature);
    if (!verified) {
      return { verified: false, reason: "Cryptographic HMAC check failed. This document has been altered." };
    }

    // Mask sensitive fields completely to enforce privacy
    return {
      verified: true,
      document: {
        receipt_number: receipt.receipt_number,
        invoice_number: receipt.invoice_number,
        document_type: receipt.document_type,
        company_name: receipt.company_name,
        branch: receipt.branches?.name || "Global Headquarters",
        date: new Date(receipt.created_at).toLocaleDateString(),
        time: new Date(receipt.created_at).toLocaleTimeString(),
        amount_paid: receipt.amount_paid,
        payment_status: "Settled / Verified",
        status: receipt.status,
        currency: receipt.currency
      }
    };
  }

  // 3. Process Linked Refund Document
  static async refundDocument(originalId: string, amount: number, reason: string, staffId?: string) {
    const original = await ReceiptRepository.findById(originalId);
    if (!original) throw new Error("Original document not found.");

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refundNumber = `REF-${dateStr}-${randomSuffix}`;

    // Create refund DB record
    await ReceiptRepository.insertRefund({
      refund_number: refundNumber,
      original_receipt_id: originalId,
      refund_amount: amount,
      refund_reason: reason,
      staff_id: staffId || null as any
    });

    // Update status to refunded and apply watermark
    await ReceiptRepository.updateStatus(originalId, "refunded", "REFUNDED");

    // Register log action
    await ReceiptRepository.logAction({
      receipt_id: originalId,
      action: "refunded",
      user_id: staffId,
      details: { refund_number: refundNumber, amount, reason }
    });

    return { refundNumber };
  }

  // 4. Client Telemetry Logs Parser
  static async logClientAction(receiptId: string, action: string, userId?: string, telemetry?: TelemetryMetadata) {
    const userAgent = telemetry?.userAgent || "";
    let browser = "Unknown";
    let os = "Unknown";

    if (userAgent) {
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Firefox")) browser = "Firefox";

      if (userAgent.includes("Windows")) os = "Windows";
      else if (userAgent.includes("Mac")) os = "macOS";
      else if (userAgent.includes("Android")) os = "Android";
      else if (userAgent.includes("iPhone")) os = "iOS";
    }

    await ReceiptRepository.logAction({
      receipt_id: receiptId,
      action,
      user_id: userId,
      ip_address: telemetry?.ipAddress || "127.0.0.1",
      device: telemetry?.device || "Desktop",
      browser,
      os,
      details: telemetry || {}
    });

    // Update receipt status accordingly if lifecycle events
    if (["printed", "downloaded", "emailed", "shared"].includes(action)) {
      await ReceiptRepository.updateStatus(receiptId, action as ReceiptStatus);
    }
  }

  // 5. Simulate Email Sending with retry log
  static async sendEmailReceipt(receiptId: string, email: string, userId?: string) {
    const receipt = await ReceiptRepository.findById(receiptId);
    if (!receipt) throw new Error("Document not found");

    // Simulating SMTP delivery
    const isSent = Math.random() > 0.15; // 85% success rate

    if (!isSent) {
      await ReceiptRepository.logAction({
        receipt_id: receiptId,
        action: "email_failed",
        user_id: userId,
        details: { target_email: email, error: "SMTP Gateway Host Unavailable (Simulated)" }
      });
      throw new Error("SMTP connection failed. Retrying in background job.");
    }

    await ReceiptRepository.logAction({
      receipt_id: receiptId,
      action: "emailed",
      user_id: userId,
      details: { target_email: email }
    });

    await ReceiptRepository.updateStatus(receiptId, "emailed");
    return { success: true };
  }

  // 6. Get Branding Settings
  static async getBrandingSettings(branchId: string | null) {
    const settings = await ReceiptRepository.getBrandingSettings(branchId);
    return settings || { company_name: "Tindi Holdings Ltd", tagline: "Excellence & Innovation" };
  }

  // 7. Save Branding Settings
  static async saveBrandingSettings(settings: ReceiptSettings) {
    await ReceiptRepository.upsertBrandingSettings(settings);
  }

  // 8. Get Visual Builder config
  static async getBuilderConfig(branchId: string | null) {
    const config = await ReceiptRepository.getBuilderConfig(branchId);
    return config || {
      branch_id: branchId,
      primary_color: "#3b82f6",
      font_family: "Inter, sans-serif",
      show_header: true,
      show_footer: true,
      show_barcode: true,
      show_qrcode: true,
      show_loyalty: true,
      show_shipping: true,
      show_payment_details: true,
      layout_sections: ["header", "metadata", "items", "totals", "payment", "loyalty", "security", "footer"]
    };
  }

  // 9. Save Visual Builder config
  static async saveBuilderConfig(config: BuilderConfig) {
    await ReceiptRepository.upsertBuilderConfig(config);
  }

  // 10. Generate Document HTML for printing
  static async generateDocumentHTML(id: string, paperSize: "80mm" | "58mm" | "A4") {
    const receipt = await ReceiptRepository.findById(id);
    const branding = await this.getBrandingSettings(receipt.branch_id);
    const config = await this.getBuilderConfig(receipt.branch_id);

    return ReceiptTemplates.compile(receipt, receipt.receipt_items || [], config, branding, paperSize);
  }
}
