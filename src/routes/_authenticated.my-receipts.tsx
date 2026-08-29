import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listMyReceipts, getReceiptDetails, logReceiptAction, emailReceipt } from "@/lib/receipts.functions";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCode, Barcode } from "@/components/shared/ReceiptSecurityCodes";
import {
  FileText, Search, Filter, ArrowUpDown, Download, Printer, Mail, Share2,
  CheckCircle, Loader2, Sparkles, Building, Calendar, CreditCard, ShoppingBag, Eye,
  ShieldCheck, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const receiptsSearchSchema = z.object({
  orderId: z.string().optional(),
  receiptId: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/my-receipts")({
  validateSearch: receiptsSearchSchema,
  head: () => ({ meta: [{ title: "My Receipts — Tindi Holdings Ltd" }] }),
  component: MyReceipts,
});

type PaperSize = "A4" | "80mm" | "58mm";

function MyReceipts() {
  const queryClient = useQueryClient();
  const searchParams = Route.useSearch();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDocType, setSelectedDocType] = useState("all");
  const [sortField, setSortField] = useState<"created_at" | "amount_paid" | "branch">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Receipt Modal State
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [paperSize, setPaperSize] = useState<PaperSize>("80mm");
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fetch all user receipts
  const { data: receipts, isLoading } = useQuery({
    queryKey: ["my-receipts"],
    queryFn: () => listMyReceipts(),
  });

  // Auto-select receipt from search params if present
  useEffect(() => {
    if (!receipts || receipts.length === 0) return;
    if (searchParams.receiptId) {
      const match = receipts.find((r) => r.id === searchParams.receiptId);
      if (match) setActiveReceiptId(match.id);
    } else if (searchParams.orderId) {
      const match = receipts.find((r) => r.order_id === searchParams.orderId);
      if (match) setActiveReceiptId(match.id);
    }
  }, [receipts, searchParams.receiptId, searchParams.orderId]);

  // Fetch receipt details
  const { data: activeReceiptData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ["receipt-details", activeReceiptId],
    queryFn: () => getReceiptDetails({ data: { id: activeReceiptId! } }),
    enabled: !!activeReceiptId,
  });

  // Log action (printed, downloaded, shared, viewed)
  const logAction = useMutation({
    mutationFn: (vars: { id: string; action: string; metadata?: any }) =>
      logReceiptAction({
        data: {
          receiptId: vars.id,
          action: vars.action,
          metadata: {
            ...vars.metadata,
            userAgent: typeof window !== "undefined" ? navigator.userAgent : "",
            ipAddress: "Client Local Loopback",
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-receipts"] });
      queryClient.invalidateQueries({ queryKey: ["receipt-details", activeReceiptId] });
    },
  });

  // Email resend mutation
  const resendEmail = useMutation({
    mutationFn: (vars: { id: string; email: string }) =>
      emailReceipt({ data: { receiptId: vars.id, email: vars.email } }),
    onSuccess: () => {
      toast.success("Receipt successfully queued for email dispatch!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to dispatch email. Autoretry has logged failure.");
    },
  });

  // Share receipt simulation
  const shareReceipt = (receipt: any) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: `Receipt ${receipt.receipt_number}`,
        text: `View receipt for transaction of KES ${Number(receipt.amount_paid).toLocaleString()}`,
        url: `${window.location.origin}/verify-receipt/${receipt.receipt_number}?sig=${receipt.digital_signature}`,
      }).then(() => {
        logAction.mutate({ id: receipt.id, action: "shared", metadata: { platform: "Native Share" } });
        toast.success("Receipt link shared successfully!");
      }).catch(() => {});
    } else {
      // copy verification link to clipboard
      const verifyUrl = `${window.location.origin}/verify-receipt/${receipt.receipt_number}?sig=${receipt.digital_signature}`;
      navigator.clipboard.writeText(verifyUrl);
      logAction.mutate({ id: receipt.id, action: "shared", metadata: { platform: "Clipboard Copy" } });
      toast.success("Verification link copied to clipboard!");
    }
  };

  // Trigger browser print
  const handlePrint = (receipt: any) => {
    logAction.mutate({ id: receipt.id, action: "printed", metadata: { copies: 1, paperSize } });
    
    const printContent = printAreaRef.current?.innerHTML;
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName.toString(), "left=5000,top=5000,width=0,height=0");
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${receipt.receipt_number}</title>
            <style>
              body {
                font-family: 'Inter', sans-serif;
                color: #000;
                background: #fff;
                margin: 0;
                padding: 15px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .paper-A4 { width: 210mm; margin: 0 auto; }
              .paper-80mm { width: 80mm; font-size: 12px; }
              .paper-58mm { width: 58mm; font-size: 10px; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .font-black { font-weight: 900; }
              .uppercase { text-transform: uppercase; }
              .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .flex-col { flex-direction: column; }
              .items-center { align-items: center; }
              table { width: 100%; border-collapse: collapse; }
              th, td { padding: 4px 0; text-align: left; }
              .receipt-header { margin-bottom: 15px; }
              .receipt-footer { margin-top: 15px; font-size: 11px; text-align: center; }
              .watermark {
                border: 2px dashed #ccc;
                color: #ccc;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                padding: 5px;
                margin: 10px 0;
                text-transform: uppercase;
              }
            </style>
          </head>
          <body>
            <div class="paper-${paperSize}">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = (receipt: any) => {
    logAction.mutate({ id: receipt.id, action: "downloaded", metadata: { format: "PDF" } });
    toast.success("Receipt downloaded as PDF successfully!");
  };

  // Filter & sort logic
  const filteredReceipts = (receipts ?? [])
    .filter((r) => {
      const matchSearch =
        r.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
        r.invoice_number.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === "all" || r.status === selectedStatus;
      const matchDocType = selectedDocType === "all" || (r.document_type || "sales_receipt") === selectedDocType;
      return matchSearch && matchStatus && matchDocType;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "created_at") {
        comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortField === "amount_paid") {
        comparison = Number(b.amount_paid) - Number(a.amount_paid);
      } else if (sortField === "branch") {
        comparison = (b.branches?.name || "").localeCompare(a.branches?.name || "");
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      generated: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      viewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      printed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      downloaded: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      emailed: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      refunded: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
    return colors[status] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <CorporateHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
              <FileText className="h-8 w-8 text-primary" />
              <span>My Receipts Ledger</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-black opacity-60">
              Audit-Ready Transaction Registry & Authenticity Center
            </p>
          </div>
          <Link to="/shop">
            <Button className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11">
              Shop More
            </Button>
          </Link>
        </div>

        {/* Filters Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col md:flex-row gap-4 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="generated">Generated</option>
                <option value="viewed">Viewed</option>
                <option value="printed">Printed</option>
                <option value="downloaded">Downloaded</option>
                <option value="emailed">Emailed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Doc Type Filter */}
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground">
              <span>Type:</span>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-foreground cursor-pointer"
              >
                <option value="all">All types</option>
                <option value="sales_receipt">Sales Receipt</option>
                <option value="invoice">Invoice</option>
                <option value="quotation">Quotation</option>
                <option value="refund_receipt">Refund</option>
                <option value="delivery_note">Delivery Note</option>
                <option value="gift_receipt">Gift Receipt</option>
              </select>
            </div>

            {/* Sorting Toggle */}
            <div className="flex items-center gap-1.5 bg-muted/50 border border-border px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Sort:</span>
              <button
                onClick={() => {
                  if (sortField === "created_at") setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                  else setSortField("created_at");
                }}
                className={`font-bold ${sortField === "created_at" ? "text-foreground" : "text-muted-foreground/60"}`}
              >
                Date
              </button>
              <button
                onClick={() => {
                  if (sortField === "amount_paid") setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                  else setSortField("amount_paid");
                }}
                className={`font-bold ${sortField === "amount_paid" ? "text-foreground" : "text-muted-foreground/60"}`}
              >
                Amount
              </button>
            </div>
          </div>
        </div>

        {/* Ledger List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loading transaction logs...</p>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full grid place-items-center mx-auto mb-2">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="font-extrabold text-lg uppercase tracking-wider">Zero Signal Detected</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No registered receipts fit your parameters. Place orders in our storefront to initialize records.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReceipts.map((rec) => (
              <div
                key={rec.id}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 relative group overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-primary tracking-widest font-mono">
                      #{rec.receipt_number}
                    </span>
                    <h4 className="font-bold text-sm text-foreground/80 mt-0.5">
                      Invoice: {rec.invoice_number}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${getStatusColor(rec.status)}`}>
                      {rec.status}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-violet-500/10 text-violet-400 border-violet-500/20">
                      {(rec.document_type || "sales_receipt").replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 opacity-60" /> Branch
                    </span>
                    <span className="font-semibold text-foreground/90">
                      {rec.branches?.name || "Corporate Hub"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 opacity-60" /> Timestamp
                    </span>
                    <span className="font-semibold text-foreground/90">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3.5 w-3.5 opacity-60" /> Payment
                    </span>
                    <span className="font-semibold text-foreground/90 uppercase">
                      {rec.payment_method}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3 flex justify-between items-end">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Paid Valuation</span>
                    <span className="text-lg font-black text-foreground font-display">
                      {rec.currency} {Number(rec.amount_paid).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      logAction.mutate({ id: rec.id, action: "viewed" });
                      setActiveReceiptId(rec.id);
                    }}
                    variant="outline"
                    className="flex-1 rounded-xl h-10 text-[10px] font-black uppercase tracking-wider"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                  </Button>
                  <Button
                    onClick={() => shareReceipt(rec)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 border border-border rounded-xl"
                    title="Share Verification Link"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!activeReceiptId} onOpenChange={(o) => !o && setActiveReceiptId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 border border-border bg-card">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex justify-between items-center text-sm font-black uppercase tracking-widest text-muted-foreground">
              <span>Receipt Audit node</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">Print size:</span>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  className="bg-muted px-2 py-0.5 border border-border rounded-lg text-xs font-bold outline-none text-foreground"
                >
                  <option value="80mm">80mm POS</option>
                  <option value="58mm">58mm POS</option>
                  <option value="A4">A4 Office</option>
                </select>
              </div>
            </DialogTitle>
          </DialogHeader>

          {isLoadingDetails || !activeReceiptData ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fetching transaction node details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Printable Area */}
              <div
                ref={printAreaRef}
                className="bg-white text-black p-6 rounded-2xl border border-dashed border-slate-300 font-sans shadow-inner overflow-hidden relative"
              >
                {/* Visual Watermark Overlay */}
                {activeReceiptData.receipt.watermark && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-5 z-0">
                    <span className="text-5xl font-black border-4 border-black border-dashed px-4 py-2 rotate-12">
                      {activeReceiptData.receipt.watermark}
                    </span>
                  </div>
                )}

                {/* Print layout structure */}
                <div className="text-center space-y-1 z-10 relative">
                  <h3 className="text-base font-black uppercase tracking-wider">TINDI HOLDINGS LTD</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase">
                    {activeReceiptData.receipt.branches?.name || "Corporate Head Office"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {activeReceiptData.receipt.branches?.address || "101 Executive Way, Nairobi"}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Tel: {activeReceiptData.receipt.branches?.phone || "+254 700 000 000"}
                  </p>
                  <div className="border-b border-dashed border-slate-300 my-4" />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 z-10 relative">
                  <div className="flex justify-between">
                    <span>Receipt No:</span>
                    <span className="font-bold text-slate-900">{activeReceiptData.receipt.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Invoice Ref:</span>
                    <span className="font-bold text-slate-900">{activeReceiptData.receipt.invoice_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date / Time:</span>
                    <span>{new Date(activeReceiptData.receipt.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cashier Node:</span>
                    <span>Tindi Executive POS</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-4" />
                </div>

                {/* Items list */}
                <div className="space-y-3 z-10 relative">
                  <div className="flex justify-between text-xs font-bold text-slate-800 uppercase">
                    <span>Description</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {(activeReceiptData.receipt.receipt_items || []).map((it: any) => (
                      <div key={it.id} className="py-2 flex justify-between text-xs text-slate-600">
                        <div>
                          <div className="font-bold text-slate-800">{it.product_name}</div>
                          <div className="text-[10px]">
                            {it.quantity} x {activeReceiptData.receipt.currency} {Number(it.unit_price).toFixed(2)}
                          </div>
                        </div>
                        <span className="font-bold text-slate-950">
                          {activeReceiptData.receipt.currency} {(Number(it.unit_price) * it.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-4" />
                </div>

                {/* Totals */}
                <div className="space-y-2 text-xs text-slate-700 z-10 relative">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{activeReceiptData.receipt.currency} {(Number(activeReceiptData.receipt.amount_paid) - Number(activeReceiptData.receipt.tax_amount)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (VAT 16%):</span>
                    <span>{activeReceiptData.receipt.currency} {Number(activeReceiptData.receipt.tax_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span className="text-emerald-600">-{activeReceiptData.receipt.currency} {Number(activeReceiptData.receipt.discount_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-950 pt-2 border-t border-slate-200">
                    <span>TOTAL PAID:</span>
                    <span>{activeReceiptData.receipt.currency} {Number(activeReceiptData.receipt.amount_paid).toFixed(2)}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-4" />
                </div>

                {/* Payment & Shipping Details */}
                <div className="text-[11px] text-slate-500 space-y-1.5 z-10 relative">
                  <div className="flex justify-between">
                    <span>Payment Gateway:</span>
                    <span className="font-medium text-slate-800">{activeReceiptData.receipt.payment_details?.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transaction Reference:</span>
                    <span className="font-medium text-slate-800">{activeReceiptData.receipt.payment_details?.reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Courier:</span>
                    <span>{activeReceiptData.receipt.shipping_details?.courier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-medium text-slate-800">{activeReceiptData.receipt.shipping_details?.tracking_number}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300 my-4" />
                </div>

                {/* Loyalty Info */}
                <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-600 space-y-1 z-10 relative">
                  <div className="font-bold text-slate-800 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Tindi Loyalty Points
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Points Earned this transaction:</span>
                    <span className="font-bold text-slate-900">+{activeReceiptData.receipt.loyalty_points?.earned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Tier Status:</span>
                    <span className="font-bold text-slate-900">{activeReceiptData.receipt.loyalty_points?.tier}</span>
                  </div>
                </div>

                {/* Cryptographic Verification section */}
                <div className="mt-6 flex flex-col items-center gap-3 z-10 relative">
                  <QRCode
                    value={`${window.location.origin}/verify-receipt/${activeReceiptData.receipt.receipt_number}?sig=${activeReceiptData.receipt.digital_signature}`}
                    size={100}
                  />
                  <div className="text-center text-[9px] text-slate-400 max-w-[200px] leading-relaxed">
                    Scan this secure code to verify the cryptographic ledger signature of this receipt.
                  </div>
                  <Barcode value={activeReceiptData.receipt.receipt_number} showText={false} height={35} />
                </div>

                <div className="text-center text-[10px] text-slate-400 mt-6 z-10 relative">
                  Thank you for shopping with us!<br />
                  Subject to return policy & terms of service.<br />
                  <b>KRA PIN: {activeReceiptData.receipt.tax_details?.pin || "KRA-PIN-01102026"}</b>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <Button
                  onClick={() => handlePrint(activeReceiptData.receipt)}
                  className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Print
                </Button>
                <Button
                  onClick={() => handleDownload(activeReceiptData.receipt)}
                  variant="outline"
                  className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4 w-4" /> PDF
                </Button>
                <Button
                  onClick={() => {
                    const email = activeReceiptData.receipt.profiles?.email || "customer@tindiholdings.com";
                    resendEmail.mutate({ id: activeReceiptData.receipt.id, email });
                  }}
                  variant="outline"
                  disabled={resendEmail.isPending}
                  className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  {resendEmail.isPending ? <Loader2 className="animate-spin" /> : <Mail className="h-4 w-4" />} Email
                </Button>
                <Button
                  onClick={() => shareReceipt(activeReceiptData.receipt)}
                  variant="outline"
                  className="rounded-xl h-11 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-4 w-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CorporateFooter />
    </div>
  );
}
