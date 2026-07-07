import { BuilderConfig, DocumentType, PaperSize, ReceiptItemPayload } from "../interfaces/types";

export class ReceiptTemplates {
  // Main compilation entry point
  static compile(
    document: any,
    items: ReceiptItemPayload[],
    builderConfig: BuilderConfig,
    branding: any,
    paperSize: PaperSize = "80mm"
  ): string {
    const sections: Record<string, () => string> = {
      header: () => this.renderHeader(document, branding, builderConfig),
      metadata: () => this.renderMetadata(document, builderConfig),
      items: () => this.renderItems(document, items, builderConfig),
      totals: () => this.renderTotals(document, builderConfig),
      payment: () => this.renderPayment(document, builderConfig),
      loyalty: () => this.renderLoyalty(document, builderConfig),
      security: () => this.renderSecurity(document, builderConfig),
      footer: () => this.renderFooter(branding, builderConfig),
    };

    // Render sections in order
    const orderedSections = builderConfig.layout_sections || [
      "header",
      "metadata",
      "items",
      "totals",
      "payment",
      "loyalty",
      "security",
      "footer",
    ];

    const renderedHTML = orderedSections
      .map((sec) => (sections[sec] ? sections[sec]() : ""))
      .join("\n");

    return `
      <div style="
        font-family: ${builderConfig.font_family || "Inter, sans-serif"};
        color: #1e293b;
        background-color: #ffffff;
        padding: ${paperSize === "A4" ? "20px" : "10px"};
        position: relative;
        max-width: 100%;
        margin: 0 auto;
      ">
        ${this.renderWatermark(document)}
        ${renderedHTML}
      </div>
    `;
  }

  private static renderWatermark(document: any): string {
    if (!document.watermark) return "";
    return `
      <div style="
        position: absolute;
        top: 30%;
        left: 10%;
        right: 10%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.05;
        transform: rotate(15deg);
        pointer-events: none;
        user-select: none;
        z-index: 0;
      ">
        <span style="
          font-size: 5rem;
          font-weight: 900;
          border: 6px dashed #000;
          padding: 10px 20px;
          text-transform: uppercase;
        ">${document.watermark}</span>
      </div>
    `;
  }

  private static renderHeader(document: any, branding: any, config: BuilderConfig): string {
    if (!config.show_header) return "";

    const titleMap: Record<DocumentType, string> = {
      sales_receipt: "SALES RECEIPT",
      invoice: "TAX INVOICE",
      quotation: "OFFICIAL QUOTATION",
      refund_receipt: "REFUND RECEIPT",
      return_receipt: "RETURN VOUCHER",
      exchange_receipt: "EXCHANGE CREDIT NOTE",
      delivery_note: "DELIVERY NOTE",
      purchase_order: "PURCHASE ORDER",
      supplier_receipt: "SUPPLIER INVOICE",
      stock_transfer_note: "STOCK TRANSFER NOTE",
      credit_note: "CREDIT NOTE",
      debit_note: "DEBIT NOTE",
      proforma_invoice: "PROFORMA INVOICE",
      payment_confirmation: "PAYMENT CONFIRMATION",
      subscription_receipt: "SUBSCRIPTION RECEIPT",
      gift_receipt: "GIFT RECEIPT",
      tax_invoice: "TAX INVOICE",
    };

    const docTitle = titleMap[document.document_type as DocumentType] || "DOCUMENT TRANSACTION";

    return `
      <div style="text-align: center; margin-bottom: 20px; position: relative; z-index: 10;">
        <h2 style="margin: 0; font-size: 1.3rem; font-weight: 900; color: ${config.primary_color}; letter-spacing: 0.05em; text-transform: uppercase;">
          ${branding.company_name || document.company_name}
        </h2>
        <p style="margin: 3px 0 0 0; font-size: 0.8rem; font-weight: bold; color: #475569;">
          ${branding.tagline || "EXCELLENCE AT SCALE"}
        </p>
        <p style="margin: 5px 0 0 0; font-size: 0.75rem; color: #64748b;">
          ${branding.address || "101 Executive Office, Nairobi"}<br/>
          Tel: ${branding.phone || "+254 700 000 000"} | Email: ${branding.email || "info@tindiholdings.com"}<br/>
          PIN: ${branding.tax_registration_number || "KRA-PIN-01102026"}
        </p>
        <div style="margin: 15px 0 5px 0; font-size: 1.1rem; font-weight: 900; letter-spacing: 0.1em; color: #0f172a; text-transform: uppercase;">
          ${docTitle}
        </div>
        <div style="border-bottom: 1px dashed #cbd5e1; margin-top: 10px;"></div>
      </div>
    `;
  }

  private static renderMetadata(document: any, config: BuilderConfig): string {
    return `
      <div style="font-size: 0.8rem; color: #475569; line-height: 1.6; margin-bottom: 15px; position: relative; z-index: 10;">
        <div style="display: flex; justify-content: space-between;">
          <span>Doc Number:</span>
          <span style="font-weight: 700; color: #0f172a;">${document.receipt_number}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Reference Link:</span>
          <span style="font-weight: 700; color: #0f172a;">${document.invoice_number}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Timestamp:</span>
          <span>${new Date(document.created_at).toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Operation Node:</span>
          <span>Cashier POS</span>
        </div>
        <div style="border-bottom: 1px dashed #cbd5e1; margin-top: 10px;"></div>
      </div>
    `;
  }

  private static renderItems(document: any, items: ReceiptItemPayload[], config: BuilderConfig): string {
    const rows = items
      .map(
        (it) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 6px 0;">
          <div style="font-weight: bold; color: #1e293b;">${it.product_name}</div>
          <div style="font-size: 0.75rem; color: #64748b;">
            ${it.quantity} x ${document.currency} ${Number(it.unit_price).toFixed(2)}
          </div>
        </td>
        <td style="text-align: right; font-weight: bold; color: #0f172a; padding: 6px 0;">
          ${document.currency} ${(it.quantity * it.unit_price).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    return `
      <div style="margin-bottom: 15px; position: relative; z-index: 10;">
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
          <thead>
            <tr style="border-bottom: 1px solid #e2e8f0; text-transform: uppercase; font-size: 0.7rem; color: #64748b; font-weight: bold;">
              <th style="text-align: left; padding-bottom: 5px;">Description</th>
              <th style="text-align: right; padding-bottom: 5px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
        <div style="border-bottom: 1px dashed #cbd5e1; margin-top: 10px;"></div>
      </div>
    `;
  }

  private static renderTotals(document: any, config: BuilderConfig): string {
    const subtotal = Number(document.amount_paid) - Number(document.tax_amount);
    return `
      <div style="font-size: 0.8rem; color: #475569; line-height: 1.6; margin-bottom: 15px; position: relative; z-index: 10;">
        <div style="display: flex; justify-content: space-between;">
          <span>Subtotal:</span>
          <span>${document.currency} ${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tax (VAT 16%):</span>
          <span>${document.currency} ${Number(document.tax_amount).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Discounts:</span>
          <span style="color: #10b981;">-${document.currency} ${Number(document.discount_amount).toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 1rem; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 5px;">
          <span>TOTAL VALUATION:</span>
          <span>${document.currency} ${Number(document.amount_paid).toFixed(2)}</span>
        </div>
        <div style="border-bottom: 1px dashed #cbd5e1; margin-top: 10px;"></div>
      </div>
    `;
  }

  private static renderPayment(document: any, config: BuilderConfig): string {
    if (!config.show_payment_details || !document.payment_details?.gateway) return "";
    return `
      <div style="font-size: 0.75rem; color: #64748b; line-height: 1.6; margin-bottom: 15px; position: relative; z-index: 10;">
        <div style="display: flex; justify-content: space-between;">
          <span>Payment Node:</span>
          <span style="font-weight: bold; color: #334155;">${document.payment_method?.toUpperCase()} (${document.payment_details.gateway})</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Ref ID:</span>
          <span style="font-weight: bold; color: #334155; font-family: monospace;">${document.payment_details.reference}</span>
        </div>
        <div style="border-bottom: 1px dashed #cbd5e1; margin-top: 10px;"></div>
      </div>
    `;
  }

  private static renderLoyalty(document: any, config: BuilderConfig): string {
    if (!config.show_loyalty || !document.loyalty_points?.earned) return "";
    return `
      <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 10px; border-radius: 8px; font-size: 0.75rem; color: #475569; margin-bottom: 15px; position: relative; z-index: 10;">
        <div style="font-weight: 900; color: #1e293b; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
          ★ TINDI LOYALTY LEDGER
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Points Earned:</span>
          <span style="font-weight: bold; color: #eab308;">+${document.loyalty_points.earned}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tier Level:</span>
          <span style="font-weight: bold; color: #0f172a;">${document.loyalty_points.tier || "Standard"}</span>
        </div>
      </div>
    `;
  }

  private static renderSecurity(document: any, config: BuilderConfig): string {
    if (!config.show_qrcode && !config.show_barcode) return "";
    return `
      <div style="display: flex; flex-col; align-items: center; justify-content: center; text-align: center; gap: 8px; margin-top: 15px; position: relative; z-index: 10;">
        <div style="font-size: 0.75rem; color: #94a3b8; max-width: 250px; line-height: 1.4; margin-bottom: 5px;">
          Cryptographic Signature Ledger. Scan secure QR code to verify authenticity.
        </div>
        <div style="font-size: 0.65rem; color: #cbd5e1; font-family: monospace; word-break: break-all; margin-bottom: 10px;">
          SIG: ${document.digital_signature}
        </div>
      </div>
    `;
  }

  private static renderFooter(branding: any, config: BuilderConfig): string {
    if (!config.show_footer) return "";
    return `
      <div style="text-align: center; font-size: 0.7rem; color: #94a3b8; line-height: 1.5; margin-top: 20px; position: relative; z-index: 10;">
        <p style="margin: 0;">${branding.footer_message || "Tindi Holdings Limited. All rights reserved."}</p>
        <p style="margin: 3px 0 0 0; font-style: italic;">${branding.return_policy || "Returns within 30 days."}</p>
      </div>
    `;
  }
}
