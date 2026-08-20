import React from "react";
import { Clock, TrendingUp, Zap } from "lucide-react";

export interface HourlySlot {
  hour: number; // 0..23
  label: string; // "12 AM", "1 PM", etc.
  revenue: number;
  orders: number;
}

interface Props {
  data: HourlySlot[];
  isLoading?: boolean;
}

export function HourlyHeatmap({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-5 w-48 bg-muted rounded-md mb-4" />
        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 h-36 bg-muted/20 rounded-xl" />
      </div>
    );
  }

  const maxRevenue = Math.max(1, ...data.map((d) => d.revenue));
  const peakSlot = data.reduce(
    (max, cur) => (cur.revenue > max.revenue ? cur : max),
    data[0] || { hour: 0, label: "12 AM", revenue: 0, orders: 0 }
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="h-3 w-3" /> 24-Hour Telemetry
            </span>
          </div>
          <h3 className="text-base font-black tracking-tight mt-1">Hourly Sales & Peak Rush</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Day-part transaction density to optimize store and dispatch staffing
          </p>
        </div>

        {peakSlot.revenue > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
            <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span>Peak Rush: {peakSlot.label} (KES {peakSlot.revenue.toLocaleString("en-KE")})</span>
          </div>
        )}
      </div>

      {/* 24-hour heatmap tiles */}
      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-2">
        {data.map((slot) => {
          const intensity = slot.revenue / maxRevenue;
          const isPeak = slot.hour === peakSlot.hour && slot.revenue > 0;

          // Color scale based on revenue intensity
          let tileBg = "bg-muted/30 border-border/40 text-muted-foreground";
          if (intensity > 0.75) {
            tileBg = "bg-primary text-primary-foreground font-black border-primary";
          } else if (intensity > 0.45) {
            tileBg = "bg-primary/70 text-white font-bold border-primary/70";
          } else if (intensity > 0.2) {
            tileBg = "bg-primary/30 text-foreground font-semibold border-primary/40";
          } else if (intensity > 0) {
            tileBg = "bg-primary/10 text-foreground border-primary/20";
          }

          return (
            <div
              key={slot.hour}
              className={`rounded-xl border p-2 flex flex-col justify-between text-center transition-transform hover:scale-105 relative overflow-hidden group ${tileBg} ${
                isPeak ? "ring-2 ring-amber-400 shadow-md" : ""
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                {slot.label}
              </span>
              <div className="my-1">
                <span className="text-xs font-black block truncate">
                  {slot.revenue > 0 ? `KES ${(slot.revenue / 1000).toFixed(0)}k` : "—"}
                </span>
                <span className="text-[9px] opacity-75 font-bold block">
                  {slot.orders} ord
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold pt-2 border-t border-border">
        <span>Low Rush: Off-Peak Hours</span>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-xs bg-muted/40" />
          <div className="h-2 w-2 rounded-xs bg-primary/20" />
          <div className="h-2 w-2 rounded-xs bg-primary/50" />
          <div className="h-2 w-2 rounded-xs bg-primary" />
          <span>High Volume Rush</span>
        </div>
      </div>
    </div>
  );
}
