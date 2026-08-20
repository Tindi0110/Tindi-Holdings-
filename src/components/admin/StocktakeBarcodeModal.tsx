import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Boxes,
  Plus,
  Minus,
  Sparkles,
  Barcode,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductStock, createStockAdjustment } from "@/lib/admin.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: any[];
}

export function StocktakeBarcodeModal({ open, onOpenChange, products }: Props) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [scanInput, setScanInput] = useState("");
  const [scannedMap, setScannedMap] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-focus barcode input
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = scanInput.trim().toLowerCase();
    if (!raw) return;

    // Search product by slug, id, or exact name
    const match = products.find(
      (p) =>
        (p.slug || "").toLowerCase() === raw ||
        (p.id || "").toLowerCase() === raw ||
        (p.name || "").toLowerCase().includes(raw),
    );

    if (match) {
      setScannedMap((prev) => ({
        ...prev,
        [match.id]: (prev[match.id] || 0) + 1,
      }));
      toast.success(`Scanned: ${match.name} (+1 count)`);
    } else {
      toast.error(`No product found for barcode "${raw}"`);
    }
    setScanInput("");
  };

  const handleQtyChange = (id: string, delta: number) => {
    setScannedMap((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const resetStocktake = () => {
    if (confirm("Clear all scanned counts for this stocktake audit?")) {
      setScannedMap({});
      toast.info("Stocktake audit cleared");
    }
  };

  const reconcileAll = async () => {
    const keys = Object.keys(scannedMap);
    if (keys.length === 0) return toast.error("No scanned items to reconcile");

    setIsSubmitting(true);
    try {
      for (const prodId of keys) {
        const physicalCount = scannedMap[prodId];
        const prod = products.find((p) => p.id === prodId);
        if (!prod) continue;

        const variance = physicalCount - prod.stock;
        if (variance !== 0) {
          // Update product stock
          await updateProductStock({ data: { id: prodId, stock: physicalCount } });
          // Log adjustment record
          await createStockAdjustment({
            data: {
              product_id: prodId,
              quantity: Math.abs(variance),
              type: variance < 0 ? "Damaged / Shrinkage" : "Audit Surplus",
              reason: `Physical Barcode Stocktake Reconciliation (Variance: ${variance > 0 ? "+" : ""}${variance} units)`,
            },
          });
        }
      }

      toast.success("Stocktake reconciled successfully! All physical stock updated in DB.");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["admin", "adjustments"] });
      setScannedMap({});
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to reconcile stocktake");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scannedList = Object.keys(scannedMap).map((id) => {
    const prod = products.find((p) => p.id === id);
    const counted = scannedMap[id];
    const theoretical = prod?.stock ?? 0;
    const variance = counted - theoretical;
    return { id, name: prod?.name ?? "Unknown Product", counted, theoretical, variance };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center text-primary">
                <Scan className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black uppercase tracking-tight">
                  High-Speed Barcode Stocktake Mode
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Scan USB/Bluetooth physical barcodes or type SKU to audit inventory.
                </p>
              </div>
            </div>
            {scannedList.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetStocktake}
                className="text-xs text-muted-foreground hover:text-destructive gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear Audit
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Scan Barcode Field */}
        <form onSubmit={handleScanSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Scan barcode or enter product SKU/slug..."
              className="w-full h-11 pl-9 pr-4 rounded-xl border border-border bg-muted/20 font-mono text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <Button
            type="submit"
            className="rounded-xl px-5 h-11 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider"
          >
            Count Scan
          </Button>
        </form>

        {/* Scanned Audit Table */}
        <div className="mt-4 border border-border rounded-2xl overflow-hidden bg-muted/10">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 border-b border-border text-[10px] font-black uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left">Product Node</th>
                  <th className="px-3 py-2.5 text-center">System Stock</th>
                  <th className="px-3 py-2.5 text-center">Physical Count</th>
                  <th className="px-3 py-2.5 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scannedList.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-bold text-foreground">{item.name}</td>
                    <td className="px-3 py-3 text-center text-muted-foreground font-medium">
                      {item.theoretical} units
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-card border border-border rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.id, -1)}
                          className="h-6 w-6 rounded grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-black px-2 min-w-[24px] text-center text-primary">
                          {item.counted}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(item.id, 1)}
                          className="h-6 w-6 rounded grid place-items-center hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-black">
                      {item.variance === 0 ? (
                        <span className="text-emerald-600">Matched (0)</span>
                      ) : item.variance > 0 ? (
                        <span className="text-emerald-600">+{item.variance} Surplus</span>
                      ) : (
                        <span className="text-rose-600">{item.variance} Missing</span>
                      )}
                    </td>
                  </tr>
                ))}
                {scannedList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-muted-foreground">
                      <Scan className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-bold">Awaiting Barcode Scans</p>
                      <p className="text-[11px]">Connect your barcode scanner or enter SKU codes above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2 pt-3 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl font-bold text-xs">
            Close
          </Button>
          <Button
            onClick={reconcileAll}
            disabled={scannedList.length === 0 || isSubmitting}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-6"
          >
            {isSubmitting ? "Reconciling..." : `Auto-Reconcile (${scannedList.length} SKUs)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
