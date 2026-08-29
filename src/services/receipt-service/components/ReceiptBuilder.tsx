import React, { useState } from "react";
import { BuilderConfig, ReceiptSettings } from "../interfaces/types";
import {
  Eye,
  ArrowUp,
  ArrowDown,
  Check,
  Sparkles,
  Sliders,
  Layout,
  Type,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReceiptBuilderProps {
  config: BuilderConfig;
  branding: ReceiptSettings;
  onSave: (config: BuilderConfig) => void;
}

export const ReceiptBuilder: React.FC<ReceiptBuilderProps> = ({ config, branding, onSave }) => {
  const [localConfig, setLocalConfig] = useState<BuilderConfig>({ ...config });

  const toggleSection = (field: keyof BuilderConfig) => {
    setLocalConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const updateColor = (color: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      primary_color: color,
    }));
  };

  const updateFont = (font: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      font_family: font,
    }));
  };

  const moveSection = (idx: number, dir: "up" | "down") => {
    const list = [...localConfig.layout_sections];
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    setLocalConfig((prev) => ({
      ...prev,
      layout_sections: list,
    }));
  };

  // Mock document variables to compile live preview
  const previewDoc = {
    receipt_number: "RCP-20260707-1234",
    invoice_number: "REF-20260707-5678",
    document_type: "sales_receipt",
    company_name: branding.company_name || "Tindi Holdings Ltd",
    amount_paid: 12500,
    currency: "KES",
    tax_amount: 1724.13,
    discount_amount: 1250,
    payment_method: "mpesa",
    payment_details: { gateway: "M-Pesa Express", reference: "QG76FT92K1" },
    loyalty_points: { earned: 125, tier: "Platinum" },
    digital_signature: "7f4c9c1b...da8f61e2",
    created_at: new Date().toISOString(),
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 text-sm">
      {/* 1. Configuration Panel */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-border">
            <Sliders className="h-5 w-5 text-primary" />
            <h3 className="font-extrabold uppercase tracking-tight text-base">
              Visual Layout Controls
            </h3>
          </div>

          {/* Color & Fonts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Palette className="h-3.5 w-3.5" /> Primary Accent Color
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="color"
                  value={localConfig.primary_color}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-12 h-10 p-1 rounded-lg cursor-pointer bg-transparent border border-border"
                />
                <span className="font-mono text-xs uppercase font-bold text-foreground/80">
                  {localConfig.primary_color}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Type className="h-3.5 w-3.5" /> Font Typography
              </label>
              <select
                value={localConfig.font_family}
                onChange={(e) => updateFont(e.target.value)}
                className="w-full h-10 px-3 border border-border bg-muted/30 text-xs font-bold rounded-xl outline-none text-foreground"
              >
                <option value="Inter, sans-serif">Inter Sans (Standard)</option>
                <option value="'Courier New', monospace">Courier Monospace</option>
                <option value="Georgia, serif">Georgia Editorial</option>
                <option value="system-ui, sans-serif">System Native UI</option>
              </select>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layout className="h-3.5 w-3.5" /> Component Toggles
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ToggleBtn
                label="Header branding"
                active={localConfig.show_header}
                onClick={() => toggleSection("show_header")}
              />
              <ToggleBtn
                label="Footer details"
                active={localConfig.show_footer}
                onClick={() => toggleSection("show_footer")}
              />
              <ToggleBtn
                label="Code-128 Barcode"
                active={localConfig.show_barcode}
                onClick={() => toggleSection("show_barcode")}
              />
              <ToggleBtn
                label="Ledger QR Code"
                active={localConfig.show_qrcode}
                onClick={() => toggleSection("show_qrcode")}
              />
              <ToggleBtn
                label="Loyalty Summary"
                active={localConfig.show_loyalty}
                onClick={() => toggleSection("show_loyalty")}
              />
              <ToggleBtn
                label="Shipping Status"
                active={localConfig.show_shipping}
                onClick={() => toggleSection("show_shipping")}
              />
              <ToggleBtn
                label="Payment Gateway"
                active={localConfig.show_payment_details}
                onClick={() => toggleSection("show_payment_details")}
              />
            </div>
          </div>

          {/* Section Sorter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Section Ordering (Drag & Drop)
            </h4>
            <div className="space-y-1.5 bg-muted/20 border border-border p-3.5 rounded-2xl">
              {localConfig.layout_sections.map((section, idx) => (
                <div
                  key={section}
                  className="flex items-center justify-between px-3 py-2 bg-card border border-border rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  <span className="text-foreground/80">{section}</span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 hover:bg-muted text-muted-foreground/60 hover:text-foreground rounded disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, "down")}
                      disabled={idx === localConfig.layout_sections.length - 1}
                      className="p-1 hover:bg-muted text-muted-foreground/60 hover:text-foreground rounded disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => onSave(localConfig)}
            className="w-full h-11 bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl"
          >
            Save Builder Layout
          </Button>
        </div>
      </div>

      {/* 2. Live Interactive Preview */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-wider flex items-center gap-1.5 px-1">
          <Eye className="h-4 w-4 text-primary" /> Live Layout Telemetry Preview
        </h4>
        <div className="bg-white text-black p-6 rounded-[2rem] border border-dashed border-slate-300 font-sans shadow-xl max-w-sm mx-auto overflow-hidden">
          {/* Header section */}
          {localConfig.show_header && (
            <div className="text-center space-y-1 mb-4">
              <h3
                style={{ color: localConfig.primary_color }}
                className="text-base font-black uppercase tracking-wider"
              >
                {branding.company_name || previewDoc.company_name}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {branding.tagline || "EXCELLENCE AT SCALE"}
              </p>
              <p className="text-[9px] text-slate-400">
                {branding.address || "101 Executive Office, Nairobi"}
                <br />
                PIN: {branding.tax_registration_number || "KRA-PIN-01102026"}
              </p>
              <div className="border-b border-dashed border-slate-200 mt-3"></div>
            </div>
          )}

          {/* Metadata Section */}
          <div className="space-y-1.5 text-[10px] text-slate-600 mb-4">
            <div className="flex justify-between">
              <span>Receipt No:</span>
              <span className="font-bold text-slate-900">{previewDoc.receipt_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span>{new Date(previewDoc.created_at).toLocaleString()}</span>
            </div>
            <div className="border-b border-dashed border-slate-200 mt-3"></div>
          </div>

          {/* Items Preview */}
          <div className="space-y-2 text-[10px] mb-4">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Description</span>
              <span>Total</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <div>
                <span className="font-bold text-slate-800">Tindi Elite Automation Hub</span>
                <div className="text-[8px]">1 x KES 12,500.00</div>
              </div>
              <span className="font-bold text-slate-900">KES 12,500.00</span>
            </div>
            <div className="border-b border-dashed border-slate-200 mt-3"></div>
          </div>

          {/* Totals Preview */}
          <div className="space-y-1.5 text-[10px] text-slate-600 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>KES 10,775.87</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (VAT 16%):</span>
              <span>KES 1,724.13</span>
            </div>
            <div className="flex justify-between text-xs font-black text-slate-950 border-t border-slate-100 pt-2">
              <span>TOTAL PAID:</span>
              <span>KES 12,500.00</span>
            </div>
            <div className="border-b border-dashed border-slate-200 mt-3"></div>
          </div>

          {/* Payment Preview */}
          {localConfig.show_payment_details && (
            <div className="text-[9px] text-slate-500 space-y-1 mb-4">
              <div className="flex justify-between">
                <span>Payment Gateway:</span>
                <span className="font-bold text-slate-800">
                  {previewDoc.payment_details.gateway}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ref ID:</span>
                <span className="font-bold text-slate-800">
                  {previewDoc.payment_details.reference}
                </span>
              </div>
              <div className="border-b border-dashed border-slate-200 mt-3"></div>
            </div>
          )}

          {/* Loyalty Preview */}
          {localConfig.show_loyalty && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-[9px] text-slate-600 space-y-1 mb-4">
              <div className="font-bold text-slate-800 flex items-center gap-1">
                ★ TINDI LOYALTY LEDGER
              </div>
              <div className="flex justify-between">
                <span>Points Earned:</span>
                <span className="font-bold text-slate-900">
                  +{previewDoc.loyalty_points.earned}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tier Level:</span>
                <span className="font-bold text-slate-900">{previewDoc.loyalty_points.tier}</span>
              </div>
            </div>
          )}

          {/* QR Code / Barcode placeholder */}
          <div className="flex flex-col items-center gap-2 mt-4">
            {localConfig.show_qrcode && (
              <div className="h-20 w-20 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-[8px] text-slate-400">
                Ledger QR Code
              </div>
            )}
            {localConfig.show_barcode && (
              <div className="h-6 w-full max-w-[150px] bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-[8px] text-slate-400">
                Code-128 Barcode
              </div>
            )}
          </div>

          {/* Footer Preview */}
          {localConfig.show_footer && (
            <div className="text-center text-[9px] text-slate-400 mt-6">
              {branding.footer_message || "Tindi Holdings Ltd. All rights reserved."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ToggleBtn: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
        active
          ? "bg-primary/5 border-primary/20 text-primary"
          : "bg-muted/10 border-border text-muted-foreground/80 hover:bg-muted/20"
      }`}
    >
      <span>{label}</span>
      {active && <Check className="h-3.5 w-3.5 shrink-0" />}
    </button>
  );
};
