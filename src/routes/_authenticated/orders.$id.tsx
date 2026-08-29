import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useQuery, useMutation, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getMyOrder } from "@/lib/orders.functions";
import { getReceiptForOrder, logReceiptAction } from "@/lib/receipts.functions";
import { getOrderTrackingDetails, initiateReturnRequest } from "@/lib/returns.functions";
import { formatOrderStatus, getOrderStatusBadgeClass } from "@/lib/order-status";
import { QRCode, Barcode } from "@/components/shared/ReceiptSecurityCodes";
import {
  ChevronLeft,
  CheckCircle2,
  FileText,
  Printer,
  Share2,
  Download,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Building,
  Calendar,
  CreditCard,
  Truck,
  RotateCcw,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order Detail — Tindi Holdings Ltd" }] }),
  loader: async ({ params, context }) => {
    const o = await context.queryClient.ensureQueryData({
      queryKey: ["order", params.id],
      queryFn: () => getMyOrder({ data: { id: params.id } }),
    });
    if (!o) throw notFound();
    return {
      dehydratedState: dehydrate(context.queryClient),
    };
  },
  notFoundComponent: () => <div className="p-10 text-center">Order not found.</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-error">{error.message}</div>,
  component: OrderDetail,
});

function OrderDetail() {
  const { dehydratedState } = Route.useLoaderData();
  return (
    <HydrationBoundary state={dehydratedState}>
      <OrderDetailInner />
    </HydrationBoundary>
  );
}

function OrderDetailInner() {
  const { id } = Route.useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Return Wizard State
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [reasonCategory, setReasonCategory] = useState<any>("defective");
  const [reasonTitle, setReasonTitle] = useState("");
  const [reasonDetails, setReasonDetails] = useState("");
  const [pickupMethod, setPickupMethod] = useState<"express_pickup" | "drop_off">("express_pickup");
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffStation, setDropoffStation] = useState("Nairobi Westlands Hub");
  const [refundMethod, setRefundMethod] = useState<"mpesa" | "store_credit" | "bank_transfer">("mpesa");
  const [refundPhone, setRefundPhone] = useState("");

  const { data: order, refetch: refetchOrder } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getMyOrder({ data: { id } }),
  });

  const { data: trackingData, refetch: refetchTracking } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: () => getOrderTrackingDetails({ data: { orderId: id } }),
  });

  const { data: receipt, isLoading: isReceiptLoading, refetch: fetchReceipt } = useQuery({
    queryKey: ["order-receipt", id],
    queryFn: () => getReceiptForOrder({ data: { orderId: id } }),
    enabled: receiptOpen,
  });

  const returnMutation = useMutation({
    mutationFn: (payload: any) => initiateReturnRequest({ data: payload }),
    onSuccess: (res) => {
      toast.success(`Return request ${res.returnNumber} submitted successfully!`);
      setReturnModalOpen(false);
      refetchTracking();
      refetchOrder();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to initiate return request");
    },
  });

  const handleOpenReturnModal = () => {
    if (!order) return;
    const initial: Record<string, number> = {};
    (order.order_items || []).forEach((it: any) => {
      initial[it.id] = it.quantity || 1;
    });
    setSelectedItems(initial);
    setReasonTitle("Item defective / does not operate correctly");
    setPickupAddress(`${order.shipping_address}, ${order.shipping_city}`);
    setRefundPhone(order.shipping_phone || "");
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    const returnItemsList: any[] = [];
    (order.order_items || []).forEach((it: any) => {
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
      orderId: order.id,
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

  const logAction = useMutation({
    mutationFn: (vars: { id: string; action: string }) =>
      logReceiptAction({
        data: {
          receiptId: vars.id,
          action: vars.action,
          metadata: {
            userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
            ipAddress: "Client Local Loopback",
          },
        },
      }),
  });

  const handlePrint = () => {
    if (!printAreaRef.current || !receipt) return;
    logAction.mutate({ id: receipt.id, action: "printed" });
    const printContent = printAreaRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${receipt.receipt_number}</title>
          <style>
            body { font-family: monospace, sans-serif; padding: 20px; font-size: 12px; color: #000; }
            .border-b { border-bottom: 1px dashed #999; margin: 8px 0; }
            .flex { display: flex; justify-content: space-between; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .text-xs { font-size: 10px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!receipt) return;
    logAction.mutate({ id: receipt.id, action: "downloaded" });
    const blob = new Blob(
      [
        `TINDI HOLDINGS LTD - OFFICIAL RECEIPT\n` +
          `Receipt No: ${receipt.receipt_number}\n` +
          `Invoice No: ${receipt.invoice_number}\n` +
          `Date: ${new Date(receipt.created_at).toLocaleString()}\n` +
          `Total Amount: ${receipt.currency} ${Number(receipt.amount_paid).toLocaleString()}\n` +
          `Digital Signature: ${receipt.digital_signature}\n`,
      ],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${receipt.receipt_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded successfully!");
  };

  const handleShare = () => {
    if (!receipt) return;
    const verifyUrl = `${window.location.origin}/verify-receipt/${receipt.receipt_number}?sig=${receipt.digital_signature}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Official Receipt ${receipt.receipt_number}`,
          text: `Transaction Receipt for KES ${Number(receipt.amount_paid).toLocaleString()}`,
          url: verifyUrl,
        })
        .then(() => {
          logAction.mutate({ id: receipt.id, action: "shared" });
          toast.success("Receipt link shared!");
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(verifyUrl);
      logAction.mutate({ id: receipt.id, action: "shared" });
      toast.success("Verification link copied to clipboard!");
    }
  };

  if (!order) return null;
  const items = (order.order_items ?? []) as Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;

  const uiStatus = formatOrderStatus(order.status);
  const statusBadge = getOrderStatusBadgeClass(order.status);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-4xl w-full px-6 py-8 flex-1 space-y-6">
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to My Orders
        </Link>

        {/* Order Status Banner */}
        <div className="rounded-3xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-600 grid place-items-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-display font-black text-lg text-foreground">
                  Order #{order.order_number}
                </span>
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${statusBadge}`}
                >
                  {uiStatus}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Placed on {new Date(order.created_at).toLocaleString()} · {items.length} {items.length === 1 ? "item" : "items"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => {
                setReceiptOpen(true);
                fetchReceipt();
              }}
              className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>View Digital Receipt</span>
            </Button>

            {trackingData?.returnEligible && !trackingData?.activeReturn && (
              <Button
                onClick={handleOpenReturnModal}
                className="h-11 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Return / Refund ({trackingData.daysRemainingInReturnWindow}d left)</span>
              </Button>
            )}

            <Link to="/my-receipts" search={{ orderId: order.id }}>
              <Button
                variant="outline"
                className="h-11 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider border-border"
                title="Open in receipts ledger"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Return Alert Banner */}
        {trackingData?.activeReturn && (
          <div className="rounded-3xl bg-amber-500/10 border border-amber-500/30 p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <RotateCcw className="h-6 w-6 text-amber-500 shrink-0" />
              <div>
                <div className="font-bold text-sm text-foreground">
                  Active Return Request: {trackingData.activeReturn.return_number}
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: <strong className="uppercase text-amber-600">{trackingData.activeReturn.status.replace(/_/g, " ")}</strong> · Refund Amount: KES {Number(trackingData.activeReturn.refund_amount).toLocaleString()}
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

        {/* Jumia 5-Stage Visual Progression Stepper */}
        {trackingData?.stages && (
          <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Jumia-Style Fulfillment Progression
              </h2>
              <Link to="/track-order" search={{ orderNumber: order.order_number }} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                <span>Live Telemetry</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {trackingData.stages.map((st: any) => (
                <div
                  key={st.step}
                  className={`flex md:flex-col items-start gap-2.5 p-3.5 rounded-2xl border transition-all ${
                    st.completed
                      ? "bg-emerald-500/5 border-emerald-500/30"
                      : st.active
                      ? "bg-primary/5 border-primary/40 ring-2 ring-primary/20"
                      : "bg-muted/10 border-border/60 opacity-60"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full grid place-items-center font-black text-xs shrink-0 ${
                      st.completed
                        ? "bg-emerald-500 text-white"
                        : st.active
                        ? "bg-primary text-primary-foreground animate-pulse"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {st.completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : st.step}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-foreground">{st.title}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{st.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_340px] gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black uppercase tracking-wide text-foreground">
              Ordered Products
            </h2>
            <div className="divide-y divide-border/60">
              {items.map((it) => (
                <div key={it.id} className="py-3.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-foreground text-sm">{it.product_name}</div>
                    <div className="text-xs text-muted-foreground font-medium mt-0.5">
                      Quantity: <strong className="text-foreground">{it.quantity}</strong> × KES {Number(it.unit_price).toLocaleString("en-KE")}
                    </div>
                  </div>
                  <div className="font-black text-foreground text-sm">
                    KES {(Number(it.unit_price) * it.quantity).toLocaleString("en-KE")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="bg-card border border-border rounded-3xl p-6 h-fit space-y-4 shadow-sm text-xs">
            <h2 className="text-base font-black uppercase tracking-wide text-foreground">
              Order Summary
            </h2>
            <div className="space-y-2.5">
              <Row
                k="Status"
                v={
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${statusBadge}`}
                  >
                    {uiStatus}
                  </span>
                }
              />
              <Row
                k="Payment"
                v={
                  <span className="font-bold uppercase text-foreground">
                    {order.payment_method} · {order.payment_status}
                  </span>
                }
              />
              <Row
                k="Subtotal"
                v={`KES ${Number(order.subtotal).toLocaleString("en-KE")}`}
              />
              <Row
                k="Delivery"
                v={
                  Number(order.shipping) === 0
                    ? "FREE"
                    : `KES ${Number(order.shipping).toLocaleString("en-KE")}`
                }
              />
              <Row
                k="VAT (16% Incl.)"
                v={`KES ${Number(order.tax).toLocaleString("en-KE")}`}
              />
              <div className="flex justify-between font-black pt-3 border-t border-border text-foreground text-sm">
                <span className="uppercase">Total Amount</span>
                <span className="text-primary font-black text-base">
                  KES {Number(order.total).toLocaleString("en-KE")}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-1 text-xs">
              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Shipping Destination
              </div>
              <div className="font-bold text-foreground">{order.shipping_name}</div>
              <div className="text-muted-foreground">
                {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
              </div>
              <div className="text-muted-foreground font-mono text-[11px]">{order.shipping_phone}</div>
            </div>
          </aside>
        </div>
      </div>

      {/* Return Initiation Wizard Dialog */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-border bg-card text-foreground font-sans">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>Initiate Return / Refund (Jumia Standard)</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReturnSubmit} className="space-y-6 pt-2">
            {/* Step 1: Select Items */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">
                1. Select Items to Return
              </label>
              <div className="space-y-2">
                {items.map((it) => {
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
                    Our rider collects from your delivery address within 24–48h.
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
                    Hand over package directly at any of our branch hubs.
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
        </DialogContent>
      </Dialog>

      {/* Digital Receipt Viewer Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-border bg-card text-foreground font-sans">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
              <span>Official Digital Tax Receipt</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  disabled={!receipt}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 rounded-xl text-[10px] font-bold uppercase gap-1"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </Button>
                <Button
                  onClick={handleDownload}
                  disabled={!receipt}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 rounded-xl text-[10px] font-bold uppercase gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!receipt}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl"
                  title="Share Verification Link"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isReceiptLoading || !receipt ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Generating official digital receipt...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Printable Receipt Paper */}
              <div
                ref={printAreaRef}
                className="bg-white text-slate-900 p-6 rounded-2xl border border-dashed border-slate-300 font-sans shadow-inner relative overflow-hidden"
              >
                {/* Header */}
                <div className="text-center space-y-1 relative z-10">
                  <h3 className="text-base font-black uppercase tracking-wider text-slate-950">
                    TINDI HOLDINGS LTD
                  </h3>
                  <p className="text-xs text-slate-600 font-bold uppercase">
                    {receipt.branches?.name || "Corporate Headquarters"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {receipt.branches?.address || "101 Executive Commercial Way, Nairobi, Kenya"}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Tel: {receipt.branches?.phone || "+254 700 000 000"} · PIN: KRA-PIN-01102026
                  </p>
                  <div className="border-b border-dashed border-slate-300 my-3" />
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-xs text-slate-700 relative z-10">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt Number:</span>
                    <span className="font-black text-slate-950 font-mono">{receipt.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice Reference:</span>
                    <span className="font-bold text-slate-900 font-mono">{receipt.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Order Number:</span>
                    <span className="font-bold text-slate-900">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date / Time:</span>
                    <span>{new Date(receipt.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Gateway:</span>
                    <span className="font-bold uppercase text-slate-900">{receipt.payment_method}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-3" />
                </div>

                {/* Items */}
                <div className="space-y-2.5 relative z-10">
                  <div className="flex justify-between text-[11px] font-black text-slate-900 uppercase">
                    <span>Item Description</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(receipt.receipt_items || items || []).map((it: any) => (
                      <div key={it.id} className="py-2 flex justify-between text-xs text-slate-700">
                        <div>
                          <div className="font-bold text-slate-900">{it.product_name}</div>
                          <div className="text-[10px] text-slate-500">
                            {it.quantity} × {receipt.currency} {Number(it.unit_price).toLocaleString("en-KE")}
                          </div>
                        </div>
                        <span className="font-black text-slate-950">
                          {receipt.currency} {(Number(it.unit_price) * it.quantity).toLocaleString("en-KE")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-3" />
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-1.5 text-xs text-slate-700 relative z-10">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{receipt.currency} {(Number(receipt.amount_paid) - Number(receipt.tax_amount)).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (16% KRA eTIMS):</span>
                    <span>{receipt.currency} {Number(receipt.tax_amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span className="uppercase">TOTAL PAID:</span>
                    <span>{receipt.currency} {Number(receipt.amount_paid).toLocaleString("en-KE", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-3" />
                </div>

                {/* Security Codes: QR & Barcode */}
                <div className="pt-2 flex flex-col items-center justify-center gap-3 relative z-10">
                  <QRCode
                    value={`${window.location.origin}/verify-receipt/${receipt.receipt_number}?sig=${receipt.digital_signature}`}
                    size={80}
                  />
                  <Barcode value={receipt.receipt_number} width={1.2} height={28} />
                  <p className="text-[9px] text-slate-400 font-mono text-center">
                    KRA eTIMS Cryptographic Seal · {receipt.digital_signature}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between text-xs pt-2">
                <Link
                  to="/my-receipts"
                  search={{ orderId: order.id }}
                  className="text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <span>Open Full Receipts Ledger</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Button
                  onClick={() => setReceiptOpen(false)}
                  className="rounded-xl px-6 h-10 font-bold uppercase text-xs"
                >
                  Close Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted-foreground font-medium">{k}</span>
      <span>{v}</span>
    </div>
  );
}


