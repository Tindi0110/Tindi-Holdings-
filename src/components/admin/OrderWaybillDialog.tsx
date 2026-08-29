import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Printer,
  Package,
  Truck,
  CheckSquare,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  Calendar,
} from "lucide-react";

interface OrderWaybillProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any | null;
  branchName?: string;
}

export function OrderWaybillDialog({
  open,
  onOpenChange,
  order,
  branchName = "Central Hub — Nairobi",
}: OrderWaybillProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.order_items || [];
  const totalUnits = items.reduce((sum: number, it: any) => sum + (Number(it.quantity) || 1), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto print:p-0 print:border-none print:shadow-none">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Logistics & Dispatch
                </span>
                <DialogTitle className="font-black text-lg">Official Dispatch Waybill</DialogTitle>
              </div>
            </div>
            <Button
              onClick={handlePrint}
              className="bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl gap-2 h-9 px-4 cursor-pointer"
            >
              <Printer className="h-4 w-4" /> Print Waybill
            </Button>
          </div>
        </DialogHeader>

        {/* Printable Waybill Sheet */}
        <div
          ref={printRef}
          className="space-y-6 text-foreground bg-white text-slate-900 p-6 rounded-2xl border border-slate-200 print:border-none print:p-0"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                TINDI HOLDINGS LTD
              </h1>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Enterprise Logistics & Dispatch Note
              </p>
              <div className="text-xs text-slate-500 mt-1">
                Fulfillment Origin: <strong className="text-slate-900">{branchName}</strong>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="font-mono font-black text-lg text-slate-900">
                #{order.order_number}
              </div>
              <div className="text-[10px] font-mono uppercase bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-bold inline-block">
                TRACKING: TH-{order.order_number?.replace(/[^a-zA-Z0-9]/g, "")}-
                {new Date().getFullYear()}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Date: {new Date(order.created_at || Date.now()).toLocaleDateString("en-KE")}
              </div>
            </div>
          </div>

          {/* Barcode Visual Representation */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
            <div className="flex items-center gap-[2px] h-10">
              {Array.from({ length: 42 }).map((_, i) => {
                const heights = [32, 40, 28, 40, 36, 40, 30, 40];
                const h = heights[i % heights.length];
                const w = i % 3 === 0 ? "w-1" : i % 5 === 0 ? "w-1.5" : "w-[2px]";
                return <div key={i} className={`bg-slate-900 ${w}`} style={{ height: `${h}px` }} />;
              })}
            </div>
            <span className="font-mono text-[10px] font-bold tracking-widest text-slate-700 mt-1">
              *TH-{order.order_number}*
            </span>
          </div>

          {/* Consignee vs Origin Information */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
              <div className="font-black uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1">
                <User className="h-3 w-3" /> Consignee / Delivery Address
              </div>
              <div className="font-black text-sm text-slate-900">
                {order.shipping_name || "Valued Customer"}
              </div>
              <div className="text-slate-700 flex items-start gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500" />
                <span>
                  {order.shipping_address || "Standard Address"}, {order.shipping_city || "Nairobi"}
                </span>
              </div>
              <div className="text-slate-700 flex items-center gap-1 font-mono">
                <Phone className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span>{order.shipping_phone || "No phone provided"}</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
              <div className="font-black uppercase tracking-wider text-[10px] text-slate-500 flex items-center gap-1">
                <Truck className="h-3 w-3" /> Dispatch & Courier Info
              </div>
              <div className="text-slate-700">
                <strong>Dispatch Station:</strong> {branchName}
              </div>
              <div className="text-slate-700">
                <strong>Payment Method:</strong> {order.payment_method?.toUpperCase() || "M-PESA"}
              </div>
              <div className="text-slate-700">
                <strong>Total Value:</strong> KES {Number(order.total || 0).toLocaleString("en-KE")}
              </div>
              <div className="text-slate-700">
                <strong>Total Package SKUs:</strong> {items.length} items ({totalUnits} total units)
              </div>
            </div>
          </div>

          {/* Package Contents Checklist */}
          <div>
            <div className="font-black uppercase tracking-wider text-xs text-slate-800 mb-2 flex items-center justify-between">
              <span>Itemized Packing Checklist</span>
              <span className="text-[10px] font-normal text-slate-500">
                Tick boxes upon packing & inspection
              </span>
            </div>
            <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-100 text-[10px] text-slate-700 uppercase font-black border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2 text-center w-8">#</th>
                  <th className="px-3 py-2 text-left">Product Name</th>
                  <th className="px-3 py-2 text-center w-16">Qty</th>
                  <th className="px-3 py-2 text-center w-24">Packed [✓]</th>
                  <th className="px-3 py-2 text-center w-24">Verified [✓]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it: any, idx: number) => (
                  <tr key={it.id || idx}>
                    <td className="px-3 py-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-bold text-slate-900">
                      {it.product_name}
                      {it.product_id && (
                        <span className="font-mono text-[9px] text-slate-500 ml-2">
                          [{it.product_id.slice(0, 8)}]
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center font-black text-slate-900">
                      {it.quantity}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="w-4 h-4 border border-slate-400 rounded mx-auto" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="w-4 h-4 border border-slate-400 rounded mx-auto" />
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                      Package items compiled as standardized parcel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Courier Handover & Signatures Section */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
              <div className="font-black uppercase tracking-wider text-[10px] text-slate-600">
                1. Dispatch Officer Handover
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-300 pb-1 text-slate-600">
                  Officer Name: _______________________
                </div>
                <div className="border-b border-slate-300 pb-1 text-slate-600">
                  Signature: __________________________
                </div>
                <div className="text-[10px] text-slate-500">Branch Stamp / Stamp Here [ ]</div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-3.5 space-y-3 bg-slate-50/50">
              <div className="font-black uppercase tracking-wider text-[10px] text-slate-600">
                2. Courier / Rider Acknowledgement
              </div>
              <div className="space-y-2">
                <div className="border-b border-slate-300 pb-1 text-slate-600">
                  Rider / Courier Name: _________________
                </div>
                <div className="border-b border-slate-300 pb-1 text-slate-600">
                  Vehicle / Bike Reg: ___________________
                </div>
                <div className="border-b border-slate-300 pb-1 text-slate-600">
                  Rider Phone: ________________________
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[10px] text-center text-slate-500 pt-2 border-t border-slate-100">
            Official Tindi Holdings Ltd Distribution System • Goods received in good condition •
            Support: support@tindiholdings.co.ke
          </div>
        </div>

        <DialogFooter className="print:hidden pt-3 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold text-xs"
          >
            Close
          </Button>
          <Button
            onClick={handlePrint}
            className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6 gap-2 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Waybill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
