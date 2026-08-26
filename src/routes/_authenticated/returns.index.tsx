import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { listMyReturns } from "@/lib/returns.functions";
import {
  RotateCcw,
  Package,
  Truck,
  ClipboardCheck,
  CreditCard,
  CheckCircle2,
  ChevronLeft,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/returns/")({
  head: () => ({ meta: [{ title: "My Returns & Refunds — Tindi Group" }] }),
  component: MyReturns,
});

const STAGE_ICONS: Record<string, React.ElementType> = {
  requested: RotateCcw,
  approved: ShieldCheck,
  pickup_scheduled: Truck,
  in_transit: Package,
  received: ClipboardCheck,
  inspecting: ClipboardCheck,
  refunded: CreditCard,
  rejected: XCircle,
};

const STAGE_LABELS: Record<string, string> = {
  requested: "Request Submitted",
  approved: "Return Approved",
  pickup_scheduled: "Pickup Arranged",
  in_transit: "In Transit",
  received: "Item Received",
  inspecting: "Quality Check",
  refunded: "Refund Issued",
  rejected: "Request Rejected",
};

const REFUND_STAGES = [
  "requested",
  "approved",
  "pickup_scheduled",
  "in_transit",
  "received",
  "inspecting",
  "refunded",
];

const STATUS_BADGE: Record<string, string> = {
  requested: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  pickup_scheduled: "bg-primary/10 text-primary border-primary/20",
  in_transit: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  received: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  inspecting: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  refunded: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function ReturnProgressStepper({ status }: { status: string }) {
  const currentIndex = REFUND_STAGES.indexOf(status);
  const isRejected = status === "rejected";

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {REFUND_STAGES.map((stage, idx) => {
          const completed = currentIndex > idx;
          const active = currentIndex === idx;
          const Icon = STAGE_ICONS[stage] || RotateCcw;
          return (
            <div key={stage} className="flex flex-col items-center gap-1.5 min-w-[56px]">
              <div
                className={`h-9 w-9 rounded-full grid place-items-center border-2 transition-all ${
                  isRejected && stage === "refunded"
                    ? "border-destructive/30 bg-destructive/5 text-destructive/30"
                    : completed
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                    ? "border-primary bg-primary text-primary-foreground animate-pulse"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-tight text-center leading-tight max-w-[56px] ${
                  completed
                    ? "text-emerald-600"
                    : active
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
              {idx < REFUND_STAGES.length - 1 && (
                <div
                  className={`absolute hidden md:block`}
                />
              )}
            </div>
          );
        })}
      </div>

      {isRejected && (
        <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-xs text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          <span className="font-bold">This return request was rejected. Contact support for more info.</span>
        </div>
      )}
    </div>
  );
}

function ReturnCard({ rma }: { rma: any }) {
  const [expanded, setExpanded] = useState(false);
  const events: any[] = rma.return_events || [];

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 grid place-items-center shrink-0">
            <RotateCcw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-sm text-foreground tracking-tight">
                {rma.return_number}
              </span>
              <span
                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_BADGE[rma.status] || "bg-muted/20 text-muted-foreground border-border"}`}
              >
                {STAGE_LABELS[rma.status] || rma.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Order #{rma.orders?.order_number || rma.order_id.slice(0, 8)} · Submitted{" "}
              {new Date(rma.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Refund Amount</div>
            <div className="font-black text-sm text-emerald-600">
              KES {Number(rma.refund_amount).toLocaleString()}
            </div>
          </div>
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs font-bold"
          >
            {expanded ? "Collapse" : "Details"}
          </Button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-5 border-t border-border/60 bg-muted/5">
        <ReturnProgressStepper status={rma.status} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/40">
          {/* Return Items */}
          {rma.items && rma.items.length > 0 && (
            <div className="pt-4 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Items Being Returned
              </div>
              {rma.items.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between text-xs p-2.5 rounded-xl bg-muted/20 border border-border/60"
                >
                  <div>
                    <div className="font-bold text-foreground">{item.product_name}</div>
                    <div className="text-muted-foreground">
                      Qty: {item.quantity} × KES {Number(item.unit_price).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-black text-sm text-foreground">
                    KES {(item.quantity * item.unit_price).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Return Details */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-muted/10 border border-border/60 space-y-1 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reason</div>
              <div className="font-bold text-foreground capitalize">
                {rma.reason_category?.replace(/_/g, " ") || "—"}
              </div>
              <div className="text-muted-foreground">{rma.reason_title}</div>
            </div>

            <div className="p-3 rounded-2xl bg-muted/10 border border-border/60 space-y-1 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Return Method</div>
              <div className="font-bold text-foreground capitalize">
                {rma.pickup_method === "express_pickup" ? "🚗 Doorstep Pickup" : "🏢 Drop-off at Hub"}
              </div>
              {rma.dropoff_branch_name && (
                <div className="text-muted-foreground">{rma.dropoff_branch_name}</div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-muted/10 border border-border/60 space-y-1 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Refund Channel</div>
              <div className="font-bold text-foreground uppercase">
                {rma.refund_method === "mpesa"
                  ? "💚 M-Pesa (Instant)"
                  : rma.refund_method === "store_credit"
                  ? "🎫 Store Voucher"
                  : "🏦 Bank Transfer"}
              </div>
              {rma.waybill_number && (
                <div className="font-mono text-[10px] text-muted-foreground">
                  Waybill: {rma.waybill_number}
                </div>
              )}
            </div>
          </div>

          {/* Timeline Events */}
          {events.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Activity Timeline
              </div>
              <div className="space-y-1.5">
                {events.map((ev: any) => (
                  <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                    <div className="h-5 w-5 rounded-full bg-primary/10 grid place-items-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{ev.event_title || ev.event_type?.replace(/_/g, " ")}</div>
                      <div className="text-muted-foreground text-[10px]">{ev.event_description}</div>
                      <div className="text-muted-foreground text-[10px] font-mono">
                        {new Date(ev.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refund confirmation */}
          {rma.status === "refunded" && rma.refund_reference && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-black text-emerald-700 text-sm">
                  Refund Disbursed Successfully ✓
                </div>
                <div className="text-emerald-600 font-mono mt-0.5">
                  Ref: {rma.refund_reference} · KES {Number(rma.refund_amount).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Link to="/orders/$id" params={{ id: rma.order_id }}>
              <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold gap-1">
                <ExternalLink className="h-3 w-3" />
                View Original Order
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MyReturns() {
  const [cartOpen, setCartOpen] = useState(false);

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["my-returns"],
    queryFn: () => listMyReturns({}),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-4xl w-full px-6 py-8 flex-1 space-y-6">
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Orders
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display font-black text-2xl text-foreground tracking-tight">
              My Returns & Refunds
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Track all your active return requests and refund disbursements
            </p>
          </div>
          <Link to="/returns-policy">
            <Button variant="outline" className="rounded-xl h-10 text-xs font-bold uppercase gap-2">
              <ShieldCheck className="h-4 w-4" />
              Returns Policy
            </Button>
          </Link>
        </div>

        {/* Policy Banner */}
        <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-black text-amber-700 text-sm mb-1">14-Day Return Guarantee</div>
            <p className="text-muted-foreground leading-relaxed">
              Tindi Holdings guarantees a full refund or exchange on all qualifying products returned within
              14 days of delivery. Initiate returns directly from your{" "}
              <Link to="/orders" className="text-primary font-bold hover:underline">
                order details
              </Link>{" "}
              page.
            </p>
          </div>
        </div>

        {/* Returns List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Loading your return requests...
            </p>
          </div>
        ) : returns.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
            <div className="h-16 w-16 rounded-3xl bg-muted/30 grid place-items-center">
              <RotateCcw className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <div className="font-black text-lg text-foreground">No Return Requests</div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                You haven't initiated any returns yet. If you have a delivered order that requires a return,
                go to the order details to start the process.
              </p>
            </div>
            <Link to="/orders">
              <Button className="rounded-xl px-6 font-bold uppercase tracking-wider text-xs">
                Browse My Orders
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{returns.length} return {returns.length === 1 ? "request" : "requests"} found</span>
            </div>
            {returns.map((rma: any) => (
              <ReturnCard key={rma.id} rma={rma} />
            ))}
          </div>
        )}
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
