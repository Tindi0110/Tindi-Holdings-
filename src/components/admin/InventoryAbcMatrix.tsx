import React, { useState } from "react";
import { Package, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AbcProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unitsSold: number;
  revenue: number;
  classification: "A" | "B" | "C";
  daysOfSupply: number; // estimated days of inventory remaining
  turnoverRatio: number;
}

interface Props {
  items: AbcProductItem[];
  isLoading?: boolean;
}

export function InventoryAbcMatrix({ items, isLoading }: Props) {
  const [selectedClass, setSelectedClass] = useState<"ALL" | "A" | "B" | "C">("ALL");

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-muted rounded-md" />
        <div className="h-48 bg-muted/30 rounded-xl" />
      </div>
    );
  }

  const classACount = items.filter((i) => i.classification === "A").length;
  const classBCount = items.filter((i) => i.classification === "B").length;
  const classCCount = items.filter((i) => i.classification === "C").length;

  const filteredItems =
    selectedClass === "ALL" ? items : items.filter((i) => i.classification === selectedClass);

  return (
    <div className="space-y-4 bg-card border border-border rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
            <Package className="h-3 w-3" /> Pareto 80/20 Analysis
          </span>
          <h3 className="text-base font-black tracking-tight mt-1">
            ABC Inventory Velocity Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify fast-turnover revenue drivers vs capital tied up in slow-moving stock
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
          {(["ALL", "A", "B", "C"] as const).map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-colors ${
                selectedClass === cls
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {cls === "ALL" ? "All SKUs" : `Class ${cls}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid sm:grid-cols-3 gap-3 pt-1">
        <div
          onClick={() => setSelectedClass("A")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedClass === "A"
              ? "border-emerald-500 bg-emerald-500/10"
              : "border-border bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> Class A (Fast Movers)
            </span>
            <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
              80% Rev
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-foreground">{classACount} SKUs</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            High velocity, critical restock priority
          </p>
        </div>

        <div
          onClick={() => setSelectedClass("B")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedClass === "B" ? "border-blue-500 bg-blue-500/10" : "border-border bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-600 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Class B (Stable)
            </span>
            <span className="text-[10px] font-black uppercase bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              15% Rev
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-foreground">{classBCount} SKUs</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Steady demand, standard buffer</p>
        </div>

        <div
          onClick={() => setSelectedClass("C")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedClass === "C" ? "border-rose-500 bg-rose-500/10" : "border-border bg-muted/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-rose-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Class C (Slow / Dead)
            </span>
            <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-700 dark:text-rose-300 px-1.5 py-0.5 rounded">
              5% Rev
            </span>
          </div>
          <div className="text-xl font-black mt-1 text-foreground">{classCCount} SKUs</div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Clearance or bundle candidate</p>
        </div>
      </div>

      {/* Product Items Table */}
      <div className="border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 border-b border-border text-[10px] font-black uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Classification</th>
              <th className="px-4 py-3 text-left">Product Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Units Sold</th>
              <th className="px-4 py-3 text-right">Revenue (KES)</th>
              <th className="px-4 py-3 text-right">Stock On Hand</th>
              <th className="px-4 py-3 text-right">Estimated Days of Supply</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.slice(0, 15).map((p) => {
              const badgeColor =
                p.classification === "A"
                  ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  : p.classification === "B"
                    ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                    : "bg-rose-500/15 text-rose-600 border-rose-500/30";

              return (
                <tr key={p.id} className="hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-black text-[10px] border ${badgeColor}`}
                    >
                      CLASS {p.classification}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-foreground max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-right font-bold">{p.unitsSold}</td>
                  <td className="px-4 py-3 text-right font-black text-primary">
                    KES {Number(p.revenue).toLocaleString("en-KE")}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">{p.stock} units</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-black ${
                        p.daysOfSupply < 7
                          ? "text-rose-500"
                          : p.daysOfSupply > 60
                            ? "text-amber-500"
                            : "text-emerald-500"
                      }`}
                    >
                      {p.daysOfSupply} Days
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
