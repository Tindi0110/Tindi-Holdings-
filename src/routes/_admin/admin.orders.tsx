import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminOrders, updateOrderStatus } from "@/lib/admin.functions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ShoppingCart,
  Search,
  Eye,
  RefreshCw,
  CreditCard,
  MapPin,
  Calendar,
  User,
  Package,
  CheckCircle2,
  AlertCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { z } from "zod";

const ordersSearchSchema = z.object({
  status: z.string().optional(),
});

export const Route = createFileRoute("/_admin/admin/orders")({
  validateSearch: ordersSearchSchema,
  head: () => ({
    meta: [{ title: "Orders Management — Tindi Group" }, { name: "robots", content: "noindex" }],
  }),
  component: OrdersAdmin,
});

const STATUSES = [
  "pending",
  "processing",
  "dispatched",
  "completed",
  "cancelled",
] as const;

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-conversion/10 text-conversion border-conversion/20",
  dispatched: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-error/10 text-error border-error/20",
};

const mapStatusToDb = (status: string) => {
  if (status === "dispatched") return "shipped";
  if (status === "completed") return "delivered";
  return status;
};

const mapStatusToUi = (status: string) => {
  if (status === "shipped") return "dispatched";
  if (status === "delivered") return "completed";
  return status;
};

function OrdersAdmin() {
  const queryClient = useQueryClient();
  const { status: statusParam } = Route.useSearch();
  const [activeFilter, setActiveFilter] = useState(statusParam || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      updateOrderStatus({
        data: {
          id: vars.id,
          status: mapStatusToDb(vars.status),
        },
      }),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
      if (selectedOrder) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status: mapStatusToDb(prev.uiStatus) } : null);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orderCounts: Record<string, number> = { all: orders.length };
  for (const s of STATUSES) {
    const dbVal = mapStatusToDb(s);
    orderCounts[s] = orders.filter((o) => o.status === dbVal).length;
  }

  const filteredOrders = orders.filter((o) => {
    const uiStat = mapStatusToUi(o.status);
    if (activeFilter !== "all" && uiStat !== activeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNum = (o.order_number || "").toLowerCase().includes(q);
      const matchName = (o.shipping_name || "").toLowerCase().includes(q);
      const matchId = o.id.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchId) return false;
    }
    return true;
  });

  return (
    <AdminShell title="Orders & Dispatch">
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Order Fulfillment Center</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Live tracking, payment statuses, and regional dispatch.</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl flex items-center gap-1.5 text-xs font-bold w-fit">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
              activeFilter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All Orders ({orderCounts.all})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
                activeFilter === s ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} ({orderCounts[s] ?? 0})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by order #, customer name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-muted/20 text-[10px] text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Total (KES)</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Order Status</th>
                  <th className="px-6 py-4 text-right font-black uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading orders...
                    </td>
                  </tr>
                )}
                {filteredOrders.map((o) => {
                  const uiStatus = mapStatusToUi(o.status);
                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <span className="font-mono text-xs font-black text-primary">#{o.order_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground text-xs">
                        {o.shipping_name || "Guest Customer"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                          {o.payment_method || "M-Pesa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-primary text-sm">
                        KES {Number(o.total).toLocaleString("en-KE")}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={uiStatus}
                          onValueChange={(v) => updateStatusMutation.mutate({ id: o.id, status: v })}
                        >
                          <SelectTrigger
                            className={`h-8 w-32 text-[10px] font-black uppercase rounded-lg border shadow-none ${statusColor[uiStatus] ?? "bg-muted"}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-card">
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="capitalize text-xs font-bold py-1.5">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="h-8 px-3 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-xs text-muted-foreground">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Order Summary</span>
                <DialogTitle className="font-black text-xl mt-0.5">#{selectedOrder?.order_number}</DialogTitle>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${statusColor[mapStatusToUi(selectedOrder?.status ?? "")] ?? ""}`}>
                {mapStatusToUi(selectedOrder?.status ?? "")}
              </span>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Consignee</span>
                  <strong className="text-foreground text-sm">{selectedOrder.shipping_name || "Guest Customer"}</strong>
                  <div className="text-muted-foreground text-[11px] mt-0.5">{selectedOrder.shipping_address || "Standard Delivery Address"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Payment & Total</span>
                  <strong className="text-primary text-base font-black">KES {Number(selectedOrder.total).toLocaleString("en-KE")}</strong>
                  <div className="text-muted-foreground text-[11px] mt-0.5 capitalize">Via {selectedOrder.payment_method || "M-Pesa"}</div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-muted-foreground text-[10px] uppercase font-bold block">Order Timeline</span>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground bg-muted/10 p-2.5 rounded-lg border border-border">
                  <Calendar className="h-4 w-4 text-primary" /> Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-xl">Close</Button>
            <Button
              onClick={() => {
                if (selectedOrder) {
                  updateStatusMutation.mutate({ id: selectedOrder.id, status: "completed" });
                  setSelectedOrder(null);
                }
              }}
              className="rounded-xl bg-success hover:bg-success/90 text-white font-black text-xs uppercase tracking-wider"
            >
              Mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
