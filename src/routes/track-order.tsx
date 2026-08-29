import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getOrderTrackingDetails, initiateReturnRequest } from "@/lib/returns.functions";
import { formatOrderStatus, getOrderStatusBadgeClass } from "@/lib/order-status";
import { QRCode, Barcode } from "@/components/shared/ReceiptSecurityCodes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Package,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  RotateCcw,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  Building,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const trackSearchSchema = z.object({
  orderNumber: z.string().optional(),
});

export const Route = createFileRoute("/track-order")({
  validateSearch: trackSearchSchema,
  head: () => ({
    meta: [
      { title: "Track Your Order — Tindi Holdings Ltd" },
      {
        name: "description",
        content: "Track your Tindi Holdings Ltd package in real-time with Jumia-style live delivery updates and courier checkpoints.",
      },
    ],
  }),
  component: TrackOrderPage,
});

function TrackOrderPage() {
  const searchParams = Route.useSearch();
  const [cartOpen, setCartOpen] = useState(false);
  const [orderQuery, setOrderQuery] = useState(searchParams.orderNumber || "");
  const [emailQuery, setEmailQuery] = useState("");
  const [activeTrackingData, setActiveTrackingData] = useState<any | null>(null);

  // Return Wizard Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [reasonCategory, setReasonCategory] = useState<any>("defective");
  const [reasonTitle, setReasonTitle] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [pickupMethod, setPickupMethod] = useState<"express_pickup" | "drop_off">("express_pickup");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffStation, setDropoffStation] = useState("Nairobi Westlands Hub");
  const [refundMethod, setRefundMethod] = useState<"mpesa" | "store_credit" | "bank_transfer">("mpesa");
  const [refundPhone, setRefundPhone] = useState("");

  const trackMutation = useMutation({
    mutationFn: (vars: { orderNumber: string; email?: string }) =>
      getOrderTrackingDetails({
        data: {
          orderNumber: vars.orderNumber.replace(/#/g, "").trim(),
          email: vars.email ? vars.email.trim() : undefined,
        },
      }),
    onSuccess: (data) => {
      setActiveTrackingData(data);
      if (data.order?.shipping_address) {
        setPickupAddress(`${data.order.shipping_address}, ${data.order.shipping_city}`);
      }
      if (data.order?.shipping_phone) {
        setRefundPhone(data.order.shipping_phone);
      }
      toast.success("Order telemetry synchronized!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Order not found. Please verify order number.");
    },
  });

  const returnMutation = useMutation({
    mutationFn: (payload: any) => initiateReturnRequest({ data: payload }),
    onSuccess: (res) => {
      toast.success(`Return request ${res.returnNumber} submitted successfully!`);
      setReturnModalOpen(false);
      // Refresh tracking
      if (orderQuery) {
        trackMutation.mutate({ orderNumber: orderQuery, email: emailQuery });
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to initiate return request");
    },
  });

  const handleOpenReturnModal = () => {
    if (!activeTrackingData?.order) return;
    const initialItems: Record<string, number> = {};
    (activeTrackingData.order.order_items || []).forEach((it: any) => {
      initialItems[it.id] = it.quantity || 1;
    });
    setSelectedItems(initialItems);
    setReasonTitle("Item defective / does not operate correctly");
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrackingData?.order) return;

    const returnItemsList: any[] = [];
    (activeTrackingData.order.order_items || []).forEach((it: any) => {
      const qty = selectedItems[it.id] || 0;
      if (qty > 0) {
        returnItemsList.push({
          productId: it.product_id,
          productName: it.product_name,
          quantity: qty,
          unitPrice: Number(it.unit_price),
        });
      }
    });

    if (returnItemsList.length === 0) {
      toast.error("Please select at least one item to return.");
      return;
    }

    returnMutation.mutate({
      orderId: activeTrackingData.order.id,
      items: returnItemsList,
      reasonCategory,
      reasonTitle,
      reasonDetails,
      pickupMethod,
      pickupAddress: pickupMethod === "express_pickup" ? pickupAddress : undefined,
      dropoffBranchName: pickupMethod === "drop_off" ? dropoffStation : undefined,
      refundMethod,
      refundPhone: refundMethod === "mpesa" ? refundPhone : undefined,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Main Track Section */}
      <div className="mx-auto max-w-4xl w-full px-6 py-10 flex-1 space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
            <Truck className="h-4 w-4" />
            <span>Jumia-Standard Live Telemetry</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-foreground">
            Track Your Package
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
            Enter your order number (e.g. <strong>ORD-20260826-ee4842</strong>) to view real-time fulfillment and rider dispatch status.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!orderQuery.trim()) {
                toast.error("Please enter an order number");
                return;
              }
              trackMutation.mutate({ orderNumber: orderQuery, email: emailQuery });
            }}
            className="grid sm:grid-cols-[1fr_1fr_auto] gap-3"
          >
            <Input
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              placeholder="Order Number (e.g. ORD-20260826-ee4842)"
              className="h-12 rounded-2xl border-border text-xs font-bold"
            />
            <Input
              type="email"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="Email address (optional)"
              className="h-12 rounded-2xl border-border text-xs font-medium"
            />
            <Button
              type="submit"
              disabled={trackMutation.isPending}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider gap-2 shadow-sm cursor-pointer"
            >
              {trackMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>Track Order</span>
            </Button>
          </form>
        </div>

        {/* Tracking Output View */}
        {activeTrackingData && (
          <div className="space-y-6">
            {/* Top Order Status Card */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-display font-black text-lg text-foreground">
                    Order #{activeTrackingData.order.order_number}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${getOrderStatusBadgeClass(
                      activeTrackingData.order.status
                    )}`}
                  >
                    {formatOrderStatus(activeTrackingData.order.status)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Placed on {new Date(activeTrackingData.order.created_at).toLocaleString()} · Recipient: <strong>{activeTrackingData.order.shipping_name}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Link to="/orders/$id" params={{ id: activeTrackingData.order.id }}>
                  <Button
                    variant="outline"
                    className="h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border-border gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Receipt</span>
                  </Button>
                </Link>

                {activeTrackingData.returnEligible && !activeTrackingData.activeReturn && (
                  <Button
                    onClick={handleOpenReturnModal}
                    className="h-10 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Return / Refund ({activeTrackingData.daysRemainingInReturnWindow}d Left)</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Active Return Alert Banner */}
            {activeTrackingData.activeReturn && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <RotateCcw className="h-6 w-6 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      Return Request Active: {activeTrackingData.activeReturn.return_number}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: <strong className="uppercase text-amber-600">{activeTrackingData.activeReturn.status.replace(/_/g, " ")}</strong> · Refund Amount: KES {Number(activeTrackingData.activeReturn.refund_amount).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Link to="/returns">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold uppercase tracking-wider border-amber-500/30 text-amber-600">
                    Track Return RMA
                  </Button>
                </Link>
              </div>
            )}

            {/* Jumia 5-Step Visual Progression Stepper */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Delivery Progression Stepper
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                {activeTrackingData.stages.map((st: any, i: number) => (
                  <div
                    key={st.step}
                    className={`flex md:flex-col items-start gap-3 relative p-4 rounded-2xl border transition-all ${
                      st.completed
                        ? "bg-emerald-500/5 border-emerald-500/30"
                        : st.active
                        ? "bg-primary/5 border-primary/40 ring-2 ring-primary/20"
                        : "bg-muted/10 border-border/60 opacity-60"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full grid place-items-center font-black text-xs shrink-0 ${
                        st.completed
                          ? "bg-emerald-500 text-white"
                          : st.active
                          ? "bg-primary text-primary-foreground animate-pulse"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {st.completed ? <CheckCircle2 className="h-4 w-4" /> : st.step}
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-foreground">{st.title}</div>
                      <div className="text-[10px] text-muted-foreground leading-snug">{st.description}</div>
                      {st.timestamp !== "Pending" && (
                        <div className="text-[9px] font-mono text-primary font-semibold mt-1">
                          {st.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dispatch & Courier Information Card */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Courier & Dispatch Details</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carrier:</span>
                    <span className="font-bold text-foreground">{activeTrackingData.courier.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Waybill Tracking Code:</span>
                    <span className="font-mono font-bold text-primary">{activeTrackingData.courier.trackingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rider Contact:</span>
                    <span className="font-bold text-foreground">{activeTrackingData.courier.driverName} ({activeTrackingData.courier.driverPhone})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Window:</span>
                    <span className="font-semibold text-emerald-600">{activeTrackingData.courier.estimatedArrival}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://wa.me/${activeTrackingData.courier.driverPhone.replace(/[^0-9]/g, "")}?text=Hello,%20I%20am%20tracking%20Order%20${activeTrackingData.order.order_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-xs font-bold uppercase tracking-wider border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 gap-1.5 h-10"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>WhatsApp Courier</span>
                    </Button>
                  </a>
                  <a
                    href={`tel:${activeTrackingData.courier.driverPhone}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl text-xs font-bold uppercase tracking-wider border-border gap-1.5 h-10"
                    >
                      <PhoneCall className="h-3.5 w-3.5" />
                      <span>Call Driver</span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Delivery Address & Destination */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Consignee Destination</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-foreground text-sm">{activeTrackingData.order.shipping_name}</div>
                  <div className="text-muted-foreground">
                    {activeTrackingData.order.shipping_address}, {activeTrackingData.order.shipping_city} {activeTrackingData.order.shipping_zip}
                  </div>
                  <div className="text-muted-foreground font-mono text-[11px]">
                    Phone: {activeTrackingData.order.shipping_phone}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-bold uppercase text-foreground">
                    {activeTrackingData.order.payment_method} · {activeTrackingData.order.payment_status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Total Valuation:</span>
                  <span className="font-black text-foreground text-sm">
                    KES {Number(activeTrackingData.order.total).toLocaleString("en-KE")}
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Checkpoints Timeline Feed */}
            <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
                Checkpoint Telemetry History
              </h2>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {activeTrackingData.timeline.map((cp: any, idx: number) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                      <strong className="font-bold text-foreground text-sm">{cp.title}</strong>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        {cp.date} at {cp.time}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{cp.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Initiation Wizard Dialog (Jumia Style) */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-border bg-card text-foreground font-sans">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>Initiate Return / Refund (Jumia Standard)</span>
            </DialogTitle>
          </DialogHeader>

          {activeTrackingData?.order && (
            <form onSubmit={handleReturnSubmit} className="space-y-6 pt-2">
              {/* Step 1: Select Items */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  1. Select Items to Return
                </label>
                <div className="space-y-2">
                  {(activeTrackingData.order.order_items || []).map((it: any) => {
                    const currentQty = selectedItems[it.id] || 0;
                    return (
                      <div
                        key={it.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-muted/10 text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground text-sm">{it.product_name}</div>
                          <div className="text-muted-foreground text-xs mt-0.5">
                            KES {Number(it.unit_price).toLocaleString()} per unit
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [it.id]: Math.max(0, (prev[it.id] || 0) - 1),
                              }))
                            }
                            className="h-8 w-8 rounded-lg bg-muted text-foreground font-bold hover:bg-muted/80 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-black text-sm w-6 text-center">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [it.id]: Math.min(it.quantity || 1, (prev[it.id] || 0) + 1),
                              }))
                            }
                            className="h-8 w-8 rounded-lg bg-muted text-foreground font-bold hover:bg-muted/80 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Reason Category & Details */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  2. Reason for Return
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    className="h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground"
                  >
                    <option value="defective">Defective / Does not work</option>
                    <option value="damaged_on_delivery">Damaged during transit</option>
                    <option value="wrong_item">Wrong item / specification</option>
                    <option value="not_as_described">Doesn't match description</option>
                    <option value="missing_parts">Missing parts / accessories</option>
                    <option value="changed_mind">Changed mind / wrong size</option>
                  </select>
                  <Input
                    value={reasonTitle}
                    onChange={(e) => setReasonTitle(e.target.value)}
                    placeholder="Short summary of issue"
                    className="h-11 rounded-xl text-xs font-medium"
                    required
                  />
                </div>
                <textarea
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  placeholder="Provide additional details on the malfunction or issue..."
                  rows={2}
                  className="w-full rounded-xl border border-border bg-transparent p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Step 3: Pickup Method */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  3. Return Pickup / Drop-off Mode
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPickupMethod("express_pickup")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      pickupMethod === "express_pickup"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-muted/10 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <Truck className="h-4 w-4 text-primary" />
                      <span>Doorstep Courier Pickup</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Our rider collects from your doorstep within 24–48 hours.
                    </p>
                  </div>

                  <div
                    onClick={() => setPickupMethod("drop_off")}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      pickupMethod === "drop_off"
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-muted/10 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      <Building className="h-4 w-4 text-primary" />
                      <span>Drop-off at Tindi Station</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Hand over package directly at any of our regional branch hubs.
                    </p>
                  </div>
                </div>

                {pickupMethod === "express_pickup" ? (
                  <Input
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="Pickup address details"
                    className="h-11 rounded-xl text-xs"
                    required
                  />
                ) : (
                  <select
                    value={dropoffStation}
                    onChange={(e) => setDropoffStation(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold"
                  >
                    <option value="Nairobi Westlands Hub">Nairobi Westlands Technology Center</option>
                    <option value="Nairobi CBD Corporate Hub">Nairobi CBD Corporate Plaza</option>
                    <option value="Mombasa Road Hub">Mombasa Road Logistics Hub</option>
                    <option value="Mombasa Coast Hub">Mombasa Nyali Station</option>
                    <option value="Kisumu Mega Station">Kisumu Oginga Odinga Station</option>
                    <option value="Nakuru Commercial Station">Nakuru Kenyatta Avenue Hub</option>
                  </select>
                )}
              </div>

              {/* Step 4: Refund Channel */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                  4. Refund Destination
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setRefundMethod("mpesa")}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      refundMethod === "mpesa"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 font-bold"
                        : "bg-muted/10 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs font-bold">M-Pesa (Instant)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Disbursed to phone</div>
                  </div>

                  <div
                    onClick={() => setRefundMethod("store_credit")}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      refundMethod === "store_credit"
                        ? "bg-primary/10 border-primary text-primary font-bold"
                        : "bg-muted/10 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs font-bold">Store Credit</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Shopping Voucher</div>
                  </div>

                  <div
                    onClick={() => setRefundMethod("bank_transfer")}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      refundMethod === "bank_transfer"
                        ? "bg-blue-500/10 border-blue-500 text-blue-600 font-bold"
                        : "bg-muted/10 border-border text-muted-foreground"
                    }`}
                  >
                    <div className="text-xs font-bold">Bank Transfer</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">1-3 Business Days</div>
                  </div>
                </div>

                {refundMethod === "mpesa" && (
                  <Input
                    value={refundPhone}
                    onChange={(e) => setRefundPhone(e.target.value)}
                    placeholder="M-Pesa Phone Number (e.g. 0712345678)"
                    className="h-11 rounded-xl text-xs font-mono"
                    required
                  />
                )}
              </div>

              <DialogFooter className="gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setReturnModalOpen(false)}
                  variant="outline"
                  className="rounded-xl h-11 text-xs font-bold uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={returnMutation.isPending}
                  className="rounded-xl h-11 px-6 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {returnMutation.isPending ? "Submitting RMA..." : "Confirm & Submit Return"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
