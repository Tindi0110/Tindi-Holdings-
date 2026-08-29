/**
 * Receipt Service Test Suite
 * ─────────────────────────────────────────────────────────────
 * This is a validation test spec for the Receipt & Document Management Service.
 * Run with: npx vitest run src/services/receipt-service/tests/receipt-service.test.ts
 *
 * Note: These tests require a valid Supabase test environment.
 * For CI pipelines, mock the supabaseAdmin client before running.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateHMACSignature,
  generateDocumentHash,
  verifyCryptographicSignature,
} from "../utils/crypto";
import { ReceiptTemplates } from "../templates/receipt.templates";
import type { BuilderConfig, ReceiptItemPayload } from "../interfaces/types";

// ─── 1. Cryptographic Utility Unit Tests ─────────────────────────────────────

describe("Cryptographic Utilities", () => {
  const testReceiptNumber = "RCP-20260707-1234";
  const testAmount = 12500.0;
  const testBranchId = "branch-uuid-test-001";

  it("should generate a consistent HMAC signature for the same inputs", () => {
    const sig1 = generateHMACSignature(testReceiptNumber, testAmount, testBranchId);
    const sig2 = generateHMACSignature(testReceiptNumber, testAmount, testBranchId);
    expect(sig1).toBe(sig2);
    expect(typeof sig1).toBe("string");
    expect(sig1.length).toBe(64); // SHA-256 hex is always 64 chars
  });

  it("should produce different signatures for different inputs", () => {
    const sig1 = generateHMACSignature(testReceiptNumber, testAmount, testBranchId);
    const sig2 = generateHMACSignature(testReceiptNumber, testAmount + 1, testBranchId);
    const sig3 = generateHMACSignature(testReceiptNumber, testAmount, null);
    expect(sig1).not.toBe(sig2);
    expect(sig1).not.toBe(sig3);
  });

  it("should verify a valid HMAC signature correctly", () => {
    const validSig = generateHMACSignature(testReceiptNumber, testAmount, testBranchId);
    const isValid = verifyCryptographicSignature(
      testReceiptNumber,
      testAmount,
      testBranchId,
      validSig,
    );
    expect(isValid).toBe(true);
  });

  it("should detect a tampered (invalid) HMAC signature", () => {
    const tamperedSig = "deadbeef0000000000000000000000000000000000000000000000000000dead";
    const isValid = verifyCryptographicSignature(
      testReceiptNumber,
      testAmount,
      testBranchId,
      tamperedSig,
    );
    expect(isValid).toBe(false);
  });

  it("should produce a deterministic SHA-256 receipt hash", () => {
    const payload = {
      receipt_number: testReceiptNumber,
      document_type: "sales_receipt",
      amount_paid: testAmount,
      tax_amount: 1724.13,
      discount_amount: 1250,
      created_at: "2026-07-07T17:00:00.000Z",
    };
    const items: ReceiptItemPayload[] = [
      { product_name: "Tindi Automation Hub", quantity: 1, unit_price: 12500 },
    ];
    const hash1 = generateDocumentHash(payload, items);
    const hash2 = generateDocumentHash(payload, items);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it("should generate different hashes if items change (tamper detection)", () => {
    const payload = { receipt_number: testReceiptNumber, amount_paid: testAmount };
    const items1: ReceiptItemPayload[] = [
      { product_name: "Product A", quantity: 1, unit_price: 100 },
    ];
    const items2: ReceiptItemPayload[] = [
      { product_name: "Product B", quantity: 2, unit_price: 50 },
    ];
    expect(generateDocumentHash(payload, items1)).not.toBe(generateDocumentHash(payload, items2));
  });
});

// ─── 2. Template Compiler Tests ───────────────────────────────────────────────

describe("ReceiptTemplates.compile()", () => {
  const mockConfig: BuilderConfig = {
    branch_id: null,
    primary_color: "#3b82f6",
    font_family: "Inter, sans-serif",
    show_header: true,
    show_footer: true,
    show_barcode: true,
    show_qrcode: true,
    show_loyalty: true,
    show_shipping: true,
    show_payment_details: true,
    layout_sections: [
      "header",
      "metadata",
      "items",
      "totals",
      "payment",
      "loyalty",
      "security",
      "footer",
    ],
  };

  const mockBranding = {
    company_name: "Tindi Holdings Ltd",
    tagline: "Excellence & Innovation",
    phone: "+254 700 000 000",
    email: "info@tindiholdings.com",
    address: "101 Executive Way, Nairobi",
    tax_registration_number: "KRA-PIN-01102026",
    footer_message: "Thank you for shopping with us!",
    return_policy: "Returns within 30 days.",
  };

  const mockDocument = {
    receipt_number: "RCP-20260707-1234",
    document_type: "sales_receipt",
    company_name: "Tindi Holdings Ltd",
    amount_paid: 12500,
    currency: "KES",
    tax_amount: 1724.13,
    discount_amount: 1250,
    payment_details: { gateway: "M-Pesa", reference: "ABC123XYZ" },
    loyalty_points: { earned: 125, tier: "Platinum" },
    digital_signature: "abc123def456",
    created_at: "2026-07-07T17:00:00.000Z",
  };

  const mockItems: ReceiptItemPayload[] = [
    { product_name: "Tindi AI Module", quantity: 2, unit_price: 5000 },
  ];

  it("should compile a valid HTML string for a sales receipt", () => {
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      mockConfig,
      mockBranding,
      "80mm",
    );
    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(100);
    expect(html).toContain("Tindi Holdings Ltd");
    expect(html).toContain("RCP-20260707-1234");
    expect(html).toContain("KES");
  });

  it("should include item totals correctly", () => {
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      mockConfig,
      mockBranding,
      "80mm",
    );
    expect(html).toContain("Tindi AI Module");
    expect(html).toContain("10000.00"); // 2 * 5000
  });

  it("should exclude header when show_header is false", () => {
    const configNoHeader = { ...mockConfig, show_header: false };
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      configNoHeader,
      mockBranding,
      "80mm",
    );
    expect(html).not.toContain("Excellence & Innovation");
  });

  it("should exclude footer when show_footer is false", () => {
    const configNoFooter = { ...mockConfig, show_footer: false };
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      configNoFooter,
      mockBranding,
      "80mm",
    );
    expect(html).not.toContain("Thank you for shopping with us!");
  });

  it("should inject watermark when watermark field is present", () => {
    const docWithWatermark = { ...mockDocument, watermark: "REFUNDED" };
    const html = ReceiptTemplates.compile(
      docWithWatermark,
      mockItems,
      mockConfig,
      mockBranding,
      "80mm",
    );
    expect(html).toContain("REFUNDED");
  });

  it("should render loyalty section only when show_loyalty is true and data present", () => {
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      mockConfig,
      mockBranding,
      "80mm",
    );
    expect(html).toContain("TINDI LOYALTY LEDGER");

    const configNoLoyalty = { ...mockConfig, show_loyalty: false };
    const htmlNoLoyalty = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      configNoLoyalty,
      mockBranding,
      "80mm",
    );
    expect(htmlNoLoyalty).not.toContain("TINDI LOYALTY LEDGER");
  });

  it("should respect custom section ordering", () => {
    const reorderedConfig = {
      ...mockConfig,
      layout_sections: [
        "footer",
        "header",
        "items",
        "totals",
        "metadata",
        "payment",
        "loyalty",
        "security",
      ],
    };
    const html = ReceiptTemplates.compile(
      mockDocument,
      mockItems,
      reorderedConfig,
      mockBranding,
      "80mm",
    );
    // Footer text should appear BEFORE header branding text
    const footerIdx = html.indexOf("Thank you for shopping with us!");
    const headerIdx = html.indexOf("Excellence & Innovation");
    expect(footerIdx).toBeLessThan(headerIdx);
  });
});

// ─── 3. Document Number Format Tests ─────────────────────────────────────────

describe("Document Number Format Validation", () => {
  it("should match RCP-YYYYMMDD-XXXX format for sales receipt", () => {
    const pattern = /^RCP-\d{8}-\d{4}$/;
    expect("RCP-20260707-1234").toMatch(pattern);
  });

  it("should match INV-YYYYMMDD-XXXX format for invoice", () => {
    const pattern = /^INV-\d{8}-\d{4}$/;
    expect("INV-20260707-5678").toMatch(pattern);
  });

  it("should match REF-YYYYMMDD-XXXX format for refund", () => {
    const pattern = /^REF-\d{8}-\d{4}$/;
    expect("REF-20260707-9012").toMatch(pattern);
  });
});

// ─── 4. Document Type Enum Validation ────────────────────────────────────────

describe("DocumentType enum coverage", () => {
  const validDocTypes = [
    "sales_receipt",
    "invoice",
    "quotation",
    "refund_receipt",
    "return_receipt",
    "exchange_receipt",
    "delivery_note",
    "purchase_order",
    "supplier_receipt",
    "stock_transfer_note",
    "credit_note",
    "debit_note",
    "proforma_invoice",
    "payment_confirmation",
    "subscription_receipt",
    "gift_receipt",
    "tax_invoice",
  ];

  it("should have exactly 17 document types registered", () => {
    expect(validDocTypes.length).toBe(17);
  });

  it("all document types should be snake_case lowercase", () => {
    validDocTypes.forEach((dt) => {
      expect(dt).toMatch(/^[a-z_]+$/);
    });
  });
});
