import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Download,
  Mail,
  Share2,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { QRCode, Barcode } from "@/components/shared/ReceiptSecurityCodes";
import { BuilderConfig, ReceiptSettings } from "../interfaces/types";

interface DocumentViewerProps {
  receipt: any;
  items: any[];
  config: BuilderConfig;
  branding: ReceiptSettings;
  paperSize: "80mm" | "58mm" | "A4";
  onPrint: () => void;
  onDownload: () => void;
  onEmail: () => void;
  onShare: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  receipt,
  items,
  config,
  branding,
  paperSize,
  onPrint,
  onDownload,
  onEmail,
  onShare,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  const subtotal = Number(receipt.amount_paid) - Number(receipt.tax_amount);
  const primaryColor = config.primary_color || "#3b82f6";
  const fontFamily = config.font_family || "Inter, sans-serif";

  // Document types names display mapping
  const docTypeLabels: Record<string, string> = {
    sales_receipt: "Sales Receipt",
    invoice: "Tax Invoice",
    quotation: "Official Quotation",
    refund_receipt: "Refund Receipt",
    delivery_note: "Delivery Note",
  };
  const docLabel = docTypeLabels[receipt.document_type] || "Receipt";

  return (
    <div className="space-y-6">
      {/* Printable template shell wrapper */}
      <div
        ref={printAreaRef}
        style={{ fontFamily }}
        className="bg-white text-black p-6 rounded-2xl border border-dashed border-slate-300 shadow-inner relative overflow-hidden"
      >
        {/* Confident watermark overlay */}
        {receipt.watermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 z-0">
            <span className="text-5xl font-black border-4 border-black border-dashed px-4 py-2 rotate-12">
              {receipt.watermark}
            </span>
          </div>
        )}

        {/* 1. Header component */}
        {config.show_header && (
          <div className="text-center space-y-1 mb-4 z-10 relative">
            <h3
              style={{ color: primaryColor }}
              className="text-base font-black uppercase tracking-wider"
            >
              {branding.company_name || receipt.company_name}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase">
              {branding.tagline || "EXCELLENCE & INNOVATION"}
            </p>
            <p className="text-[9px] text-slate-400">
              {branding.address || "101 Executive Office, Nairobi"}
              <br />
              Tel: {branding.phone || "+254 700 000 000"} | Email:{" "}
              {branding.email || "info@tindiholdings.com"}
              <br />
              PIN: {branding.tax_registration_number || "KRA-PIN-01102026"}
            </p>
            <div className="border-b border-dashed border-slate-200 mt-3" />
          </div>
        )}

        {/* 2. Metadata Section */}
        <div className="space-y-1.5 text-[10px] text-slate-600 mb-4 z-10 relative">
          <div className="flex justify-between">
            <span className="font-semibold">{docLabel} No:</span>
            <span className="font-black text-slate-900">#{receipt.receipt_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Reference Invoice:</span>
            <span className="font-bold text-slate-900">{receipt.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Date / Time:</span>
            <span>{new Date(receipt.created_at).toLocaleString()}</span>
          </div>
          <div className="border-b border-dashed border-slate-200 mt-3" />
        </div>

        {/* 3. Items list table */}
        <div className="space-y-3 mb-4 z-10 relative">
          <div className="flex justify-between text-[10px] font-bold text-slate-800 uppercase">
            <span>Description</span>
            <span>Total</span>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((it: any) => (
              <div key={it.id} className="py-2 flex justify-between text-[10px] text-slate-600">
                <div>
                  <div className="font-bold text-slate-800">{it.product_name}</div>
                  <div className="text-[9px]">
                    {it.quantity} x {receipt.currency} {Number(it.unit_price).toFixed(2)}
                  </div>
                </div>
                <span className="font-bold text-slate-950">
                  {receipt.currency} {(Number(it.unit_price) * it.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-b border-dashed border-slate-200 mt-3" />
        </div>

        {/* 4. Stock audit log block (rendered only for managers/admins) */}
        {receipt.receipt_hash && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[9px] text-slate-600 space-y-1 mb-4 z-10 relative">
            <div className="font-bold text-slate-900 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-500" /> CONFIDENTIAL STOCK AUDIT TELEMETRY
            </div>
            <div className="divide-y divide-slate-100 mt-1">
              {items.map((it: any) => (
                <div key={it.id} className="py-1 flex justify-between">
                  <span>{it.product_name}</span>
                  <span className="font-mono text-slate-800">
                    Before: <b>{it.stock_before}</b> | Remaining: <b>{it.stock_remaining}</b>
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[8px] text-slate-400 mt-1 pt-1 border-t border-slate-200 flex justify-between">
              <span>Inv TXID: {items?.[0]?.inventory_transaction_id || "N/A"}</span>
              <span>Warehouse: {items?.[0]?.warehouse || "Primary"}</span>
            </div>
          </div>
        )}

        {/* 5. Totals section */}
        <div className="space-y-1.5 text-[10px] text-slate-600 mb-4 z-10 relative">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>
              {receipt.currency} {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax (VAT 16%):</span>
            <span>
              {receipt.currency} {Number(receipt.tax_amount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs font-black text-slate-950 border-t border-slate-200 pt-2">
            <span>TOTAL PAID:</span>
            <span>
              {receipt.currency} {Number(receipt.amount_paid).toFixed(2)}
            </span>
          </div>
          <div className="border-b border-dashed border-slate-200 mt-3" />
        </div>

        {/* 6. Payment block */}
        {config.show_payment_details && receipt.payment_details?.gateway && (
          <div className="text-[9px] text-slate-500 space-y-1 mb-4 z-10 relative">
            <div className="flex justify-between">
              <span>Payment Gateway:</span>
              <span className="font-bold text-slate-800">{receipt.payment_details.gateway}</span>
            </div>
            <div className="flex justify-between">
              <span>Ref ID:</span>
              <span className="font-bold text-slate-800">{receipt.payment_details.reference}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 mt-3" />
          </div>
        )}

        {/* 7. Loyalty summaries */}
        {config.show_loyalty && receipt.loyalty_points?.earned && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[9px] text-slate-600 space-y-1 mb-4 z-10 relative">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              ★ TINDI LOYALTY LEDGER
            </div>
            <div className="flex justify-between">
              <span>Points Earned:</span>
              <span className="font-bold text-slate-900">+{receipt.loyalty_points.earned}</span>
            </div>
            <div className="flex justify-between">
              <span>Tier Level:</span>
              <span className="font-bold text-slate-900">{receipt.loyalty_points.tier}</span>
            </div>
          </div>
        )}

        {/* 8. QR and Barcode Verification block */}
        <div className="mt-6 flex flex-col items-center gap-3 z-10 relative">
          {config.show_qrcode && (
            <QRCode
              value={`${window.location.origin}/verify-receipt/${receipt.receipt_number}?sig=${receipt.digital_signature}`}
              size={90}
            />
          )}
          {config.show_barcode && (
            <Barcode value={receipt.receipt_number} showText={false} height={30} />
          )}
        </div>

        {/* 9. Footer notes */}
        {config.show_footer && (
          <div className="text-center text-[9px] text-slate-400 mt-6 z-10 relative">
            {branding.footer_message || "Tindi Holdings Ltd. All rights reserved."}
            <br />
            {branding.return_policy || "Returns within 30 days with original copy."}
          </div>
        )}
      </div>

      {/* 10. Operations Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Button
          onClick={onPrint}
          className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
        <Button
          onClick={onDownload}
          variant="outline"
          className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Download className="h-4 w-4" /> PDF
        </Button>
        <Button
          onClick={onEmail}
          variant="outline"
          className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Mail className="h-4 w-4" /> Email
        </Button>
        <Button
          onClick={onShare}
          variant="outline"
          className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
        >
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </div>
    </div>
  );
};
