import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminOrders, updateOrderStatus, listOrderNotes, addOrderNote } from "@/lib/admin.functions";
import { OrderWaybillDialog } from "@/components/admin/OrderWaybillDialog";
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
  Package,
  Truck,
  Phone,
  MessageSquare,
  Mail,
  Send,
  CheckCircle2,
  Share2,
  ExternalLink,
  MessageCircle,
  Copy,
  Printer,
  StickyNote,
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

const cleanKenyaPhone = (phoneRaw?: string | null) => {
  if (!phoneRaw) return "";
  let p = phoneRaw.replace(/[^0-9+]/g, "");
  if (p.startsWith("+")) p = p.substring(1);
  if (p.startsWith("07") || p.startsWith("01")) {
    p = "254" + p.substring(1);
  }
  return p;
};

function OrdersAdmin() {
  const queryClient = useQueryClient();
  const { status: statusParam } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [waybillOrder, setWaybillOrder] = useState<any | null>(null);
  const [newNote, setNewNote] = useState("");

  // Customer Communication Modal State
  const [messagingOrder, setMessagingOrder] = useState<any | null>(null);
  const [messageTemplate, setMessageTemplate] = useState<"received" | "dispatched" | "pickup" | "paid" | "custom">("received");
  const [customBody, setCustomBody] = useState("");

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
  });

  const { data: orderNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["admin", "order_notes", selectedOrder?.id],
    queryFn: () => listOrderNotes({ data: { order_id: selectedOrder.id } }),
    enabled: !!selectedOrder?.id,
  });

  const addNoteMutation = useMutation({
    mutationFn: (vars: { order_id: string; note: string; author?: string }) =>
      addOrderNote({ data: vars }),
    onSuccess: () => {
      toast.success("Staff note recorded");
      setNewNote("");
      refetchNotes();
    },
    onError: (e: Error) => toast.error(e.message),
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

  // Generate communication message for active template
  const getMessageContent = (order: any, type: string) => {
    if (!order) return "";
    const name = order.shipping_name || "Valued Customer";
    const num = order.order_number || order.id.slice(0, 8);
    const total = Number(order.total).toLocaleString("en-KE");
    const city = order.shipping_city || "your destination";
    const address = order.shipping_address || "your designated address";

    switch (type) {
      case "received":
        return `Hello ${name}, thank you for your purchase from Tindi Holdings Ltd! We have received your order #${num} totaling KES ${total}. We are currently processing and preparing your items for delivery to ${city}. You will receive a dispatch update shortly. Thank you for shopping with us!`;
      case "dispatched":
        return `Hello ${name}, great news! Your order #${num} has been dispatched for delivery to ${address}, ${city}. Our delivery team/rider will contact you on ${order.shipping_phone || "your phone"} upon arrival. Thank you for choosing Tindi Holdings!`;
      case "pickup":
        return `Hello ${name}, your order #${num} (KES ${total}) has been verified and is ready for collection at our store. Please present this order number at the collection desk. Thank you - Tindi Holdings.`;
      case "paid":
        return `Hello ${name}, we have confirmed receipt of your payment of KES ${total} for order #${num} via ${order.payment_method?.toUpperCase() || "M-Pesa"}. Your official digital receipt is available. Thank you - Tindi Holdings Ltd.`;
      case "custom":
        return customBody || `Hello ${name}, regarding your order #${num} with Tindi Holdings...`;
      default:
        return "";
    }
  };

  const handleSendWhatsApp = (order: any, text?: string) => {
    const phone = cleanKenyaPhone(order.shipping_phone);
    if (!phone) {
      toast.error("Customer phone number is missing");
      return;
    }
    const msg = text || getMessageContent(order, messageTemplate);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("WhatsApp client opened");
  };

  const handleSendEmail = (order: any, text?: string) => {
    const subject = `Order Confirmation & Update #${order.order_number} — Tindi Holdings Ltd`;
    const msg = text || getMessageContent(order, messageTemplate);
    const email = order.email || "";
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("Email client opened");
  };

  const handleSendSMS = (order: any, text?: string) => {
    const phone = cleanKenyaPhone(order.shipping_phone);
    if (!phone) {
      toast.error("Customer phone number is missing");
      return;
    }
    const msg = text || getMessageContent(order, messageTemplate);
    const url = `sms:${phone}?body=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    toast.success("SMS composer opened");
  };

  const copyMessageToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Notification message copied to clipboard");
  };

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
              <h2 className="text-xl font-black uppercase tracking-tight">Order Fulfillment & Client Communication</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Track shipments, package contents, and instantly notify customers via WhatsApp, Email, & SMS.
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
            <table className="w-full text-sm min-w-[960px]">
              <thead className="bg-muted/20 text-[10px] text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Order</th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Items</th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Total (KES)</th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-center font-black uppercase tracking-wider">Notify Client</th>
                  <th className="px-5 py-4 text-right font-black uppercase tracking-wider">Inspect</th>
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
                  const hasPhone = !!cleanKenyaPhone(o.shipping_phone);

                  return (
                    <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <span className="font-mono text-xs font-black text-primary">#{o.order_number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-foreground text-xs">
                        <div>{o.shipping_name || "Guest Customer"}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{o.shipping_phone || "—"}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-muted/40 text-foreground border border-border">
                          <Package className="h-3.5 w-3.5 text-primary" />
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground">
                          {o.payment_method || "M-Pesa"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-primary text-sm">
                        KES {Number(o.total).toLocaleString("en-KE")}
                      </td>
                      <td className="px-5 py-4">
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

                      {/* ══════════════════════════════════════════════════════════
                          COMMUNICATION MODES: WHATSAPP, EMAIL, DIRECT SMS
                         ══════════════════════════════════════════════════════════ */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Direct */}
                          <button
                            onClick={() => handleSendWhatsApp(o)}
                            disabled={!hasPhone}
                            title="Reply via WhatsApp (Order Received / Update)"
                            className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed grid place-items-center cursor-pointer"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>

                          {/* Email Direct */}
                          <button
                            onClick={() => handleSendEmail(o)}
                            title="Reply via Email"
                            className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-600 hover:bg-sky-500 hover:text-white transition-all grid place-items-center cursor-pointer"
                          >
                            <Mail className="h-4 w-4" />
                          </button>

                          {/* Direct SMS */}
                          <button
                            onClick={() => handleSendSMS(o)}
                            disabled={!hasPhone}
                            title="Send Direct SMS"
                            className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed grid place-items-center cursor-pointer"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>

                          {/* Open Full Notification Hub */}
                          <button
                            onClick={() => {
                              setMessagingOrder(o);
                              setMessageTemplate("received");
                              setCustomBody("");
                            }}
                            title="Open Message Templates & Composer"
                            className="h-8 px-2 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all text-[11px] font-black uppercase grid place-items-center cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setWaybillOrder(o)}
                            title="Generate & Print Dispatch Waybill"
                            className="h-8 px-2.5 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all text-[11px] font-black uppercase inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" /> Waybill
                          </button>
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </div>
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

      {/* ═══════════════════════════════════════════════════════════════
          CUSTOMER COMMUNICATION COMPOSER MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={!!messagingOrder} onOpenChange={(open) => !open && setMessagingOrder(null)}>
        <DialogContent className="max-w-xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-7">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Client Communication Hub</span>
                <DialogTitle className="font-black text-xl mt-0.5">
                  Notify Client for Order #{messagingOrder?.order_number}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {messagingOrder && (
            <div className="space-y-4 py-2 text-xs">
              {/* Recipient meta */}
              <div className="bg-muted/20 p-3.5 rounded-2xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">{messagingOrder.shipping_name || "Customer"}</div>
                  <div className="text-muted-foreground font-mono text-[11px]">
                    Phone: {messagingOrder.shipping_phone || "N/A"} • Total: KES {Number(messagingOrder.total).toLocaleString("en-KE")}
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {messagingOrder.payment_method?.toUpperCase()}
                </span>
              </div>

              {/* Template selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-2">
                  Select Notification Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "received", label: "📦 Received" },
                    { id: "dispatched", label: "🚚 Dispatched" },
                    { id: "pickup", label: "📍 Ready" },
                    { id: "paid", label: "💳 Paid" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setMessageTemplate(t.id as any)}
                      className={`p-2 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                        messageTemplate === t.id
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message preview box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Message Preview / Customized Text
                  </label>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(getMessageContent(messagingOrder, messageTemplate))}
                    className="text-[10px] text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" /> Copy Text
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customBody || getMessageContent(messagingOrder, messageTemplate)}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border border-border bg-card text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                />
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-border">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-3">
                  Choose Communication Dispatch Channel:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <Button
                    onClick={() => handleSendWhatsApp(messagingOrder)}
                    disabled={!cleanKenyaPhone(messagingOrder.shipping_phone)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </Button>

                  {/* Email */}
                  <Button
                    onClick={() => handleSendEmail(messagingOrder)}
                    className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl h-11 font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email App</span>
                  </Button>

                  {/* Direct SMS */}
                  <Button
                    onClick={() => handleSendSMS(messagingOrder)}
                    disabled={!cleanKenyaPhone(messagingOrder.shipping_phone)}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Direct SMS</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setMessagingOrder(null)} className="rounded-xl font-bold text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          ORDER DETAILS INSPECTION DIALOG
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Order Inspection</span>
                <DialogTitle className="font-black text-xl mt-0.5">Order #{selectedOrder?.order_number}</DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setWaybillOrder(selectedOrder)}
                  size="sm"
                  variant="outline"
                  className="rounded-xl font-black text-xs uppercase gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Dispatch Waybill
                </Button>
                <span
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border ${
                    statusColor[mapStatusToUi(selectedOrder?.status ?? "")] ?? ""
                  }`}
                >
                  {mapStatusToUi(selectedOrder?.status ?? "")}
                </span>
              </div>
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

              {/* Quick Communication Bar inside Modal */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground text-xs">Notify Client on Order Status:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWhatsApp(selectedOrder)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleSendEmail(selectedOrder)}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-sky-700 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                  <button
                    onClick={() => handleSendSMS(selectedOrder)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-purple-700 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> SMS
                  </button>
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

              {/* ══════════════════════════════════════════════════════════
                  INTERNAL STAFF NOTES & LOG
                 ══════════════════════════════════════════════════════════ */}
              <div className="border-t border-border pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <StickyNote className="h-4 w-4 text-primary" /> Internal Staff Notes & Logistics Log
                  </span>
                  <span className="text-[10px] text-muted-foreground">Private to staff only</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Type dispatch note, courier update, customer request..."
                    className="flex-1 h-10 px-3.5 rounded-xl border border-border bg-card text-xs outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newNote.trim()) {
                        addNoteMutation.mutate({ order_id: selectedOrder.id, note: newNote.trim() });
                      }
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (newNote.trim()) {
                        addNoteMutation.mutate({ order_id: selectedOrder.id, note: newNote.trim() });
                      }
                    }}
                    disabled={!newNote.trim() || addNoteMutation.isPending}
                    size="sm"
                    className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black text-xs uppercase"
                  >
                    Post Note
                  </Button>
                </div>

                {orderNotes.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {orderNotes.map((n: any) => (
                      <div key={n.id} className="p-3 rounded-xl bg-muted/30 border border-border text-xs flex items-start justify-between">
                        <div>
                          <p className="text-foreground font-medium">{n.note}</p>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            By <strong className="text-foreground">{n.author || "Staff"}</strong> • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(n.created_at).toLocaleDateString()})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-muted/10 border border-border text-center text-muted-foreground text-xs">
                    No internal staff notes yet. Use the box above to log fulfillment updates.
                  </div>
                )}
              </div>

              {/* Status Update Quick Buttons */}
              <div className="pt-2 border-t border-border">
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

      {/* Official Waybill Dialog Mount */}
      <OrderWaybillDialog
        open={!!waybillOrder}
        onOpenChange={(open) => !open && setWaybillOrder(null)}
        order={waybillOrder}
      />
    </AdminShell>
  );
}
