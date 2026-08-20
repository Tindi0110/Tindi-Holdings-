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
  Phone,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
        setSelectedOrder((prev: any) =>
          prev ? { ...prev, status: mapStatusToDb(selectedOrder.uiStatus || prev.status) } : null,
        );
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredOrders = orders.filter((o) => {
    const uiStat = mapStatusToUi(o.status);
    if (statusParam && statusParam !== "all" && uiStat !== statusParam) return false;
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
              <p className="text-xs text-muted-foreground mt-0.5">
                Live tracking, package contents, and payment dispatch in Kenyan Shillings (KES).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl flex items-center gap-1.5 text-xs font-bold w-fit"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by order #, customer name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="text-xs font-bold text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-muted/20 text-[10px] text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left font-black uppercase tracking-wider">Items</th>
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
                    <td colSpan={8} className="px-6 py-16 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading orders...
                    </td>
                  </tr>
                )}
                {filteredOrders.map((o) => {
                  const uiStatus = mapStatusToUi(o.status);
                  const itemCount = (o.order_items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
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
                        <div className="text-[10px] text-muted-foreground">{o.shipping_phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-muted/40 text-foreground border border-border">
                          <Package className="h-3.5 w-3.5 text-primary" />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
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
                          className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!isLoading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-xs text-muted-foreground">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Dialog with Purchased Items Breakdown */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Order Inspection</span>
                <DialogTitle className="font-black text-xl mt-0.5">Order #{selectedOrder?.order_number}</DialogTitle>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border ${
                  statusColor[mapStatusToUi(selectedOrder?.status ?? "")] ?? ""
                }`}
              >
                {mapStatusToUi(selectedOrder?.status ?? "")}
              </span>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 py-3 text-xs">
              {/* Customer & Payment Meta */}
              <div className="grid sm:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border border-border">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[10px] uppercase font-black tracking-wider">Consignee Details</span>
                  <strong className="text-foreground text-sm block font-bold">{selectedOrder.shipping_name || "Guest Customer"}</strong>
                  <div className="text-muted-foreground text-xs flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{selectedOrder.shipping_address || "Standard Delivery Address"}, {selectedOrder.shipping_city || "Nairobi"}</span>
                  </div>
                  {selectedOrder.shipping_phone && (
                    <div className="text-muted-foreground text-xs flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{selectedOrder.shipping_phone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1 sm:border-l sm:border-border sm:pl-4">
                  <span className="text-muted-foreground block text-[10px] uppercase font-black tracking-wider">Payment & Total</span>
                  <strong className="text-primary text-lg block font-black">KES {Number(selectedOrder.total).toLocaleString("en-KE")}</strong>
                  <div className="text-muted-foreground text-xs capitalize flex items-center gap-1.5 mt-1">
                    <CreditCard className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Paid via {selectedOrder.payment_method || "M-Pesa"}</span>
                  </div>
                  <div className="text-muted-foreground text-xs flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════════
                  WHAT WAS ORDERED — PURCHASED ITEMS BREAKDOWN
                 ══════════════════════════════════════════════════════════ */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs uppercase font-black tracking-wider flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-primary" /> What Was Ordered ({selectedOrder.order_items?.length || 0} Products)
                  </span>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/30 text-[10px] text-muted-foreground border-b border-border text-left">
                      <tr>
                        <th className="px-4 py-3 font-black uppercase">Product</th>
                        <th className="px-4 py-3 font-black uppercase text-center">Qty</th>
                        <th className="px-4 py-3 font-black uppercase text-right">Unit Price</th>
                        <th className="px-4 py-3 font-black uppercase text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(selectedOrder.order_items || []).map((it: any) => {
                        const lineTotal = Number(it.unit_price) * Number(it.quantity);
                        const img = it.products?.image_url;
                        return (
                          <tr key={it.id} className="hover:bg-muted/10">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-muted/40 border border-border p-1 overflow-hidden shrink-0">
                                  {img ? (
                                    <img src={img} alt={it.product_name} className="h-full w-full object-contain" />
                                  ) : (
                                    <div className="h-full w-full grid place-items-center text-[8px] text-muted-foreground font-bold">
                                      PKG
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-foreground">{it.product_name}</div>
                                  {it.product_id && (
                                    <div className="text-[10px] font-mono text-muted-foreground">ID: {it.product_id.slice(0, 8)}...</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-black text-foreground">
                              × {it.quantity}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-muted-foreground">
                              KES {Number(it.unit_price).toLocaleString("en-KE")}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-primary">
                              KES {lineTotal.toLocaleString("en-KE")}
                            </td>
                          </tr>
                        );
                      })}
                      {(!selectedOrder.order_items || selectedOrder.order_items.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                            Order items archived or fulfilled via external POS.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Summary Breakdown */}
              <div className="border-t border-border pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">
                    KES {Number(selectedOrder.subtotal || selectedOrder.total).toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping / Delivery</span>
                  <span className="font-bold text-foreground">
                    {Number(selectedOrder.shipping) === 0
                      ? "FREE"
                      : `KES ${Number(selectedOrder.shipping).toLocaleString("en-KE")}`}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT (16% Incl.)</span>
                  <span className="font-bold text-foreground">
                    KES {Number(selectedOrder.tax || selectedOrder.total * 0.16).toLocaleString("en-KE")}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black pt-2 border-t border-border text-foreground">
                  <span className="uppercase tracking-tight">Grand Total</span>
                  <span className="text-primary font-black text-base">
                    KES {Number(selectedOrder.total).toLocaleString("en-KE")}
                  </span>
                </div>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-2">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider block mb-2">
                  Update Order Status
                </span>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((st) => {
                    const isCurrent = mapStatusToUi(selectedOrder.status) === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          updateStatusMutation.mutate({ id: selectedOrder.id, status: st });
                          setSelectedOrder((prev: any) => ({ ...prev, status: mapStatusToDb(st) }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isCurrent
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedOrder(null)} className="rounded-xl font-bold text-xs">
              Close Inspection
            </Button>
            <Button
              onClick={() => {
                if (selectedOrder) {
                  updateStatusMutation.mutate({ id: selectedOrder.id, status: "completed" });
                  setSelectedOrder(null);
                }
              }}
              className="rounded-xl bg-success hover:bg-success/90 text-white font-black text-xs uppercase tracking-wider px-6"
            >
              Mark Order Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
