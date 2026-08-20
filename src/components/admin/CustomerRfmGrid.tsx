import React from "react";
import { Users, Crown, HeartHandshake, AlertTriangle, UserX, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface RfmSegment {
  key: "champions" | "loyal" | "promising" | "at_risk" | "dormant";
  name: string;
  description: string;
  customerCount: number;
  revenue: number;
  avgSpend: number;
  percentageOfRevenue: number;
}

interface Props {
  segments: RfmSegment[];
  isLoading?: boolean;
}

const SEGMENT_ICONS: Record<string, React.ElementType> = {
  champions: Crown,
  loyal: HeartHandshake,
  promising: Sparkles,
  at_risk: AlertTriangle,
  dormant: UserX,
};

const SEGMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  champions: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  loyal: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  promising: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
  at_risk: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  dormant: { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/30" },
};

export function CustomerRfmGrid({ segments, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-card border border-border animate-pulse p-6" />
        ))}
      </div>
    );
  }

  const handleCampaignTrigger = (segmentName: string) => {
    toast.success(`📢 Dispatched automated re-engagement campaign to ${segmentName}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
            <Users className="h-3 w-3" /> RFM Segmentation Engine
          </span>
          <h3 className="text-base font-black tracking-tight mt-1">Customer Lifecycle & Value Cohorts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recency, Frequency & Monetary scoring across customer base
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {segments.map((seg) => {
          const Icon = SEGMENT_ICONS[seg.key] || Users;
          const styling = SEGMENT_COLORS[seg.key] || SEGMENT_COLORS.loyal;

          return (
            <div
              key={seg.key}
              className={`rounded-2xl border bg-card p-5 space-y-3 transition-all hover:shadow-md ${styling.border}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-9 w-9 rounded-xl grid place-items-center ${styling.bg} ${styling.text}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">{seg.name}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">{seg.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 text-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Customers</span>
                  <span className="text-sm font-black text-foreground">{seg.customerCount}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Revenue Share</span>
                  <span className={`text-sm font-black ${styling.text}`}>{seg.percentageOfRevenue}%</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block">Avg Basket</span>
                  <span className="text-xs font-bold text-foreground truncate block">
                    KES {Math.round(seg.avgSpend).toLocaleString("en-KE")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-black text-foreground">
                  Total: KES {seg.revenue.toLocaleString("en-KE")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCampaignTrigger(seg.name)}
                  className="rounded-xl h-7 text-[10px] font-bold gap-1"
                >
                  <MessageCircle className="h-3 w-3" /> Engage Cohort
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
