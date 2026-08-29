import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminReturns, adminUpdateReturnStatus } from "@/lib/returns.functions";
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  ClipboardCheck,
  CreditCard,
  Eye,
  AlertCircle,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/returns")({
  head: () => ({ meta: [{ title: "Returns & Refunds Portal — Tindi Admin" }] }),
  component: AdminReturns,
});

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

const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  pickup_scheduled: "Pickup Scheduled",
  in_transit: "In Transit",
  received: "Item Received",
  inspecting: "QC Inspection",
  refunded: "Refunded",
  rejected: "Rejected",
};

const NEXT_ACTIONS: Record<
  string,
  { label: string; next: string; icon: React.ElementType; color: string }[]
> = {
  requested: [
    {
      label: "Approve Return",
      next: "approved",
      icon: ShieldCheck,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      label: "Reject Request",
      next: "rejected",
      icon: XCircle,
      color: "bg-destructive hover:bg-destructive/90 text-white",
    },
  ],
  approved: [
    {
      label: "Mark Pickup Scheduled",
      next: "pickup_scheduled",
      icon: Truck,
      color: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
    {
      label: "Reject",
      next: "rejected",
      icon: XCircle,
      color: "bg-destructive hover:bg-destructive/90 text-white",
    },
  ],
  pickup_scheduled: [
    {
      label: "Mark In Transit",
      next: "in_transit",
      icon: Package,
      color: "bg-amber-500 hover:bg-amber-600 text-white",
    },
  ],
  in_transit: [
    {
      label: "Mark Item Received",
      next: "received",
      icon: CheckCircle2,
      color: "bg-purple-600 hover:bg-purple-700 text-white",
    },
  ],
  received: [
    {
      label: "Begin Quality Inspection",
      next: "inspecting",
      icon: ClipboardCheck,
      color: "bg-orange-500 hover:bg-orange-600 text-white",
    },
  ],
  inspecting: [
    {
      label: "Pass QC — Issue Refund",
      next: "refunded",
      icon: CreditCard,
      color: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    {
      label: "Fail QC — Reject Return",
      next: "rejected",
      icon: XCircle,
      color: "bg-destructive hover:bg-destructive/90 text-white",
    },
  ],
};

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
  subtext,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  subtext?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl ${color} grid place-items-center`}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="font-black text-2xl text-foreground">{value}</div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </div>
        {subtext && <div className="text-[10px] text-muted-foreground mt-0.5">{subtext}</div>}
      </div>
    </div>
  );
}

function RMAActionDrawer({ rma, open, onClose }: { rma: any; open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState("");
  const [refundRef, setRefundRef] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [qcPass, setQcPass] = useState<boolean | null>(null);

  const actions = NEXT_ACTIONS[rma?.status] || [];

  const updateMutation = useMutation({
    mutationFn: (vars: { nextStatus: string }) =>
      adminUpdateReturnStatus({
        data: {
          returnRequestId: rma.id,
          newStatus: vars.nextStatus as any,
          adminNotes: adminNotes || undefined,
          refundReference: refundRef || undefined,
          rejectionReason: rejectReason || undefined,
          qualityCheckPassed: qcPass ?? undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Return status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-returns"] });
      onClose();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  if (!rma) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-border bg-card text-foreground font-sans">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider">
            <RotateCcw className="h-4 w-4 text-primary" />
            <span>RMA Inspector — {rma.return_number}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* RMA Summary */}
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-muted/10 border border-border space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Customer
              </div>
              <div className="font-bold text-foreground">
                {rma.profiles?.full_name || rma.profiles?.email || "Unknown"}
              </div>
              <div className="text-muted-foreground font-mono">{rma.profiles?.email}</div>
            </div>
            <div className="p-3 rounded-2xl bg-muted/10 border border-border space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Return Details
              </div>
              <div className="font-bold text-foreground">
                {rma.return_number} ·{" "}
                <span className="uppercase">{STATUS_LABELS[rma.status] || rma.status}</span>
              </div>
              <div className="text-muted-foreground">
                Refund:{" "}
                <strong className="text-emerald-600">
                  KES {Number(rma.refund_amount).toLocaleString()}
                </strong>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-muted/10 border border-border space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reason
              </div>
              <div className="font-bold text-foreground capitalize">
                {rma.reason_category?.replace(/_/g, " ")}
              </div>
              <div className="text-muted-foreground">{rma.reason_title}</div>
            </div>
            <div className="p-3 rounded-2xl bg-muted/10 border border-border space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pickup / Refund Method
              </div>
              <div className="font-bold text-foreground capitalize">
                {rma.pickup_method === "express_pickup"
                  ? "Doorstep Pickup"
                  : `Drop-off: ${rma.dropoff_branch_name}`}
              </div>
              <div className="text-muted-foreground uppercase">
                Refund via: {rma.refund_method?.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* Items */}
          {rma.items && rma.items.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Return Items
              </div>
              <div className="space-y-1.5">
                {rma.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex justify-between p-2.5 rounded-xl bg-muted/20 text-xs"
                  >
                    <div>
                      <span className="font-bold">{item.product_name}</span>
                      <span className="text-muted-foreground ml-2">×{item.quantity}</span>
                    </div>
                    <span className="font-black">
                      KES {(item.quantity * item.unit_price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reason Details */}
          {rma.reason_details && (
            <div className="p-3 rounded-2xl border border-border bg-amber-500/5 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-1">
                Customer Notes
              </div>
              <p className="text-foreground leading-relaxed">{rma.reason_details}</p>
            </div>
          )}

          {/* Waybill */}
          {rma.waybill_number && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/10 border border-border text-xs">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-muted-foreground">Waybill:</span>
              <span className="font-black font-mono text-foreground">{rma.waybill_number}</span>
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Admin Notes (optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this return inspection..."
              rows={2}
              className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Refund Reference — shown only for refund actions */}
          {rma.status === "inspecting" && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                M-Pesa Refund Reference (if issuing refund)
              </label>
              <Input
                value={refundRef}
                onChange={(e) => setRefundRef(e.target.value)}
                placeholder="e.g. QEZ123ABCD"
                className="h-11 rounded-xl text-xs font-mono"
              />
            </div>
          )}

          {/* Rejection Reason — shown for reject actions */}
          {(rma.status === "requested" ||
            rma.status === "approved" ||
            rma.status === "inspecting") && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Rejection Reason (if rejecting)
              </label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejecting this return request..."
                className="h-11 rounded-xl text-xs"
              />
            </div>
          )}

          {/* Action Buttons */}
          {actions.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Available Actions
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {actions.map((action) => (
                  <Button
                    key={action.next}
                    onClick={() => {
                      if (action.next === "refunded") setQcPass(true);
                      if (action.next === "rejected") setQcPass(false);
                      updateMutation.mutate({ nextStatus: action.next });
                    }}
                    disabled={updateMutation.isPending}
                    className={`h-11 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer ${action.color}`}
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <action.icon className="h-4 w-4" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-muted/10 border border-border text-xs text-center text-muted-foreground">
              {rma.status === "refunded"
                ? "✅ Refund has been disbursed — no further actions needed."
                : rma.status === "rejected"
                  ? "❌ This return was rejected. No further actions."
                  : "No actions available for this status."}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-10 text-xs font-bold uppercase"
          >
            Close Inspector
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminReturns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRMA, setSelectedRMA] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ["admin-returns", statusFilter, search],
    queryFn: () =>
      listAdminReturns({
        data: {
          status: statusFilter !== "all" ? (statusFilter as any) : undefined,
          search: search.trim() || undefined,
          limit: 100,
        },
      }),
  });

  // Compute metrics from returned data
  const totalReturns = returns.length;
  const pendingReview = returns.filter((r: any) => r.status === "requested").length;
  const inQC = returns.filter((r: any) => r.status === "inspecting").length;
  const totalRefunded = returns
    .filter((r: any) => r.status === "refunded")
    .reduce((sum: number, r: any) => sum + Number(r.refund_amount), 0);

  return (
    <AdminShell title="Returns & Refunds Portal">
      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={RotateCcw}
            label="Total Returns"
            value={totalReturns}
            color="bg-blue-500/10 text-blue-600"
            subtext="All statuses"
          />
          <MetricCard
            icon={AlertCircle}
            label="Pending Review"
            value={pendingReview}
            color="bg-amber-500/10 text-amber-600"
            subtext="Awaiting admin action"
          />
          <MetricCard
            icon={ClipboardCheck}
            label="In QC Inspection"
            value={inQC}
            color="bg-orange-500/10 text-orange-600"
            subtext="Quality check phase"
          />
          <MetricCard
            icon={DollarSign}
            label="Total Refunded"
            value={`KES ${totalRefunded.toLocaleString()}`}
            color="bg-emerald-500/10 text-emerald-600"
            subtext="Disbursed refunds"
          />
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search RMA number, customer name..."
              className="pl-9 h-11 rounded-xl text-xs"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "requested",
              "approved",
              "in_transit",
              "received",
              "inspecting",
              "refunded",
              "rejected",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/20 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s] || s.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Returns Table */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 gap-3 flex-col">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Loading return requests...
              </p>
            </div>
          ) : returns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center p-8">
              <RotateCcw className="h-10 w-10 text-muted-foreground" />
              <div>
                <div className="font-black text-lg text-foreground">No Returns Found</div>
                <p className="text-xs text-muted-foreground mt-1">
                  No return requests match the current filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      RMA / Order
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Customer
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Reason
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Refund Amount
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Date
                    </th>
                    <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {returns.map((rma: any) => (
                    <tr key={rma.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-black text-foreground">{rma.return_number}</div>
                        <div className="text-muted-foreground font-mono text-[10px]">
                          {rma.orders?.order_number || rma.order_id.slice(0, 8)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground">
                          {rma.profiles?.full_name || "—"}
                        </div>
                        <div className="text-muted-foreground text-[10px]">
                          {rma.profiles?.email}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-foreground capitalize">
                          {rma.reason_category?.replace(/_/g, " ")}
                        </div>
                        <div className="text-muted-foreground text-[10px] truncate max-w-[140px]">
                          {rma.reason_title}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-black text-emerald-600">
                          KES {Number(rma.refund_amount).toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {rma.refund_method?.replace(/_/g, " ")}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_BADGE[rma.status] || "bg-muted text-muted-foreground border-border"}`}
                        >
                          {STATUS_LABELS[rma.status] || rma.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(rma.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRMA(rma);
                            setDrawerOpen(true);
                          }}
                          className={`rounded-xl text-[10px] font-black uppercase tracking-wider gap-1 cursor-pointer ${
                            rma.status === "requested"
                              ? "bg-amber-500 hover:bg-amber-600 text-white"
                              : rma.status === "refunded" || rma.status === "rejected"
                                ? "bg-muted text-foreground"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                        >
                          <Eye className="h-3 w-3" />
                          {rma.status === "requested"
                            ? "Review"
                            : rma.status === "refunded" || rma.status === "rejected"
                              ? "View"
                              : "Action"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Action Drawer */}
      <RMAActionDrawer
        rma={selectedRMA}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRMA(null);
        }}
      />
    </AdminShell>
  );
}
