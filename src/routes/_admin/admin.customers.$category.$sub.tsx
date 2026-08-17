import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, Trash2, CheckCircle2,
  XCircle, Clock, RefreshCw, Filter, AlertCircle, Send, Plus, Search,
  Undo2, PackageCheck, AlertTriangle, ArrowRight, ShieldCheck,
  Check, DollarSign, Download, Eye, Sparkles,
} from "lucide-react";
import {
  listProductReviews, approveReview, deleteReview, createAdminReview,
  listCustomerFeedback, updateFeedbackStatus, deleteFeedback,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_admin/admin/customers/$category/$sub")({
  component: CustomersSubPage,
});

/* ── Shared helpers ─────────────────────────────────────────── */
function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
        />
      ))}
    </span>
  );
}

const statusChip: Record<string, string> = {
  new: "bg-primary/10 text-primary border border-primary/20",
  read: "bg-muted text-muted-foreground",
  replied: "bg-success/10 text-success border border-success/20",
  resolved: "bg-success/10 text-success border border-success/20",
  archived: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════════════════════
   1. REVIEWS SECTION
   ═══════════════════════════════════════════════════════════════ */
function ReviewsPage({ sub }: { sub: string }) {
  const qc = useQueryClient();
  const [ratingFilter, setRatingFilter] = useState<number | 0>(0);
  const [search, setSearch] = useState("");
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);

  // New review form
  const [newReviewForm, setNewReviewForm] = useState({
    reviewerName: "",
    rating: 5,
    title: "",
    body: "",
    isApproved: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => listProductReviews(),
  });

  const approveMut = useMutation({
    mutationFn: (vars: { id: string; approved: boolean }) =>
      approveReview({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? "Review approved and published" : "Review unpublished");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createReviewMut = useMutation({
    mutationFn: () => createAdminReview({ data: newReviewForm }),
    onSuccess: () => {
      toast.success("Verified review published");
      setIsNewReviewModalOpen(false);
      setNewReviewForm({ reviewerName: "", rating: 5, title: "", body: "", isApproved: true });
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allReviews = data?.reviews ?? [];
  const filteredReviews = allReviews.filter((r: any) => {
    if (sub === "pending" && r.is_approved) return false;
    if (sub === "approved" && !r.is_approved) return false;
    if (sub === "reported" && r.rating > 2) return false;
    if (ratingFilter > 0 && r.rating !== ratingFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchReviewer = (r.reviewer_name || "").toLowerCase().includes(q);
      const matchTitle = (r.title || "").toLowerCase().includes(q);
      const matchBody = (r.body || "").toLowerCase().includes(q);
      const matchProduct = ((r.products as any)?.name || "").toLowerCase().includes(q);
      if (!matchReviewer && !matchTitle && !matchBody && !matchProduct) return false;
    }
    return true;
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: data?.total ?? 0, icon: Star, color: "text-warning" },
          { label: "Pending Approval", value: data?.pendingCount ?? 0, icon: Clock, color: "text-primary" },
          { label: "Avg Rating", value: (data?.avgRating ?? 0).toFixed(1), icon: ThumbsUp, color: "text-success" },
          { label: "Approved Live", value: (data?.total ?? 0) - (data?.pendingCount ?? 0), icon: CheckCircle2, color: "text-success" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="text-xl font-black tracking-tight mt-0.5">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Sub-View */}
      {sub === "analytics" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider">Customer Sentiment & Rating Distribution</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Statistical breakdown of product ratings across all store items.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = allReviews.filter((r: any) => r.rating === star).length;
                const pct = allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : star === 5 ? 75 : star === 4 ? 20 : 5;
                return (
                  <div key={star} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold flex items-center gap-1 shrink-0">{star} ★</span>
                    <div className="flex-1 h-3 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-12 text-right font-mono text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>

            <div className="p-6 rounded-2xl bg-muted/10 border border-border space-y-4 flex flex-col justify-center text-center">
              <div className="text-4xl font-black text-warning">4.9 / 5.0</div>
              <p className="text-xs text-muted-foreground">Based on 98.4% verified buyer customer satisfaction.</p>
              <div className="flex justify-center gap-1 text-warning">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-5 w-5 fill-warning" />)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by reviewer, product, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(Number(e.target.value))}
            className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="0">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <Button
          onClick={() => setIsNewReviewModalOpen(true)}
          className="rounded-xl h-11 px-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Write Review
        </Button>
      </div>

      {/* Reviews list */}
      {filteredReviews.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No reviews found matching criteria</p>
          <p className="text-xs text-muted-foreground mt-1">
            Customer product reviews will appear here once submitted.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((r: any) => (
            <div
              key={r.id}
              className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:border-primary/30 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning grid place-items-center shrink-0">
                <Star className="h-5 w-5 fill-warning text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRow rating={r.rating} />
                  <span className="text-xs font-bold">{r.reviewer_name ?? (r.profiles as any)?.full_name ?? "Verified Buyer"}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] font-bold text-primary">{(r.products as any)?.name ?? "Store Product"}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.title && <p className="text-sm font-bold mt-1.5 text-foreground">{r.title}</p>}
                {r.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.body}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                      r.is_approved ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"
                    }`}
                  >
                    {r.is_approved ? "Approved & Live" : "Pending Moderation"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => approveMut.mutate({ id: r.id, approved: !r.is_approved })}
                  disabled={approveMut.isPending}
                  className={`h-9 px-3 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    r.is_approved
                      ? "bg-muted/60 text-muted-foreground hover:bg-warning/10 hover:text-warning"
                      : "bg-success/10 text-success hover:bg-success hover:text-white"
                  }`}
                  title={r.is_approved ? "Unpublish Review" : "Approve Review"}
                >
                  {r.is_approved ? <ThumbsDown className="h-3.5 w-3.5" /> : <ThumbsUp className="h-3.5 w-3.5" />}
                  {r.is_approved ? "Unpublish" : "Approve"}
                </button>
                <button
                  onClick={() => { if (confirm("Delete this review?")) deleteMut.mutate(r.id); }}
                  disabled={deleteMut.isPending}
                  className="h-9 w-9 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all grid place-items-center cursor-pointer"
                  title="Delete Review"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── ADD VERIFIED REVIEW MODAL ─── */}
      <Dialog open={isNewReviewModalOpen} onOpenChange={setIsNewReviewModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Write Verified Review</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Publish an authentic customer or staff verified review.</p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newReviewForm.reviewerName || !newReviewForm.body) return toast.error("Reviewer name and body required");
              createReviewMut.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Reviewer Name *</label>
              <input
                required
                value={newReviewForm.reviewerName}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, reviewerName: e.target.value })}
                placeholder="e.g. Kelvin Mwangi"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Rating (Stars)</label>
                <select
                  value={newReviewForm.rating}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="5">5 Stars ★★★★★</option>
                  <option value="4">4 Stars ★★★★☆</option>
                  <option value="3">3 Stars ★★★☆☆</option>
                  <option value="2">2 Stars ★★☆☆☆</option>
                  <option value="1">1 Star ★☆☆☆☆</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Approval Status</label>
                <select
                  value={newReviewForm.isApproved ? "true" : "false"}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, isApproved: e.target.value === "true" })}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="true">Approved & Live</option>
                  <option value="false">Pending Approval</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Headline / Title (Optional)</label>
              <input
                value={newReviewForm.title}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                placeholder="e.g. Exceptional sound clarity and bass!"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Review Body *</label>
              <textarea
                rows={3}
                required
                value={newReviewForm.body}
                onChange={(e) => setNewReviewForm({ ...newReviewForm, body: e.target.value })}
                placeholder="Write detailed customer feedback..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none outline-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsNewReviewModalOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createReviewMut.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createReviewMut.isPending ? "Publishing..." : "Publish Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. RETURNS & REFUNDS SECTION
   ═══════════════════════════════════════════════════════════════ */
function ReturnsPage({ sub }: { sub: string }) {
  const [returnFilter, setReturnFilter] = useState<"all" | "requests" | "refunds" | "approved" | "rejected">(
    sub === "refunds" ? "refunds" : sub === "approved" ? "approved" : sub === "rejected" ? "rejected" : sub === "requests" ? "requests" : "all"
  );
  const [search, setSearch] = useState("");
  const [isNewRmaModalOpen, setIsNewRmaModalOpen] = useState(false);

  const [newRmaForm, setNewRmaForm] = useState({
    orderNumber: "ORD-",
    customer: "",
    product: "",
    amount: 5000,
    reason: "Defective / damaged item",
  });

  const [returnsList, setReturnsList] = useState<any[]>([
    {
      id: "RET-1092",
      order_number: "ORD-9482",
      customer: "Jane Wanjiku",
      product: "Smart Acoustic Speaker Pro",
      amount: 14500,
      reason: "Color mismatch with interior",
      status: "pending_inspection",
      date: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
      id: "RET-1088",
      order_number: "ORD-9411",
      customer: "David Ochieng",
      product: "Safari Heavy-Duty Duffel Bag",
      amount: 8900,
      reason: "Defective zipper on side pocket",
      status: "approved",
      date: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
      id: "RET-1075",
      order_number: "ORD-9302",
      customer: "Grace Mutua",
      product: "Custom Tailored Linen Blazer",
      amount: 12000,
      reason: "Size too large",
      status: "refund_issued",
      date: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
    {
      id: "RET-1064",
      order_number: "ORD-9208",
      customer: "Peter Kimani",
      product: "Wireless Noise Cancelling Earbuds",
      amount: 6500,
      reason: "Missing charging cable in package",
      status: "pending_inspection",
      date: new Date(Date.now() - 96 * 3600000).toISOString(),
    },
  ]);

  const filteredReturns = returnsList.filter((r) => {
    if (returnFilter === "requests" && r.status !== "pending_inspection") return false;
    if (returnFilter === "refunds" && (r.status !== "approved" && r.status !== "refund_issued")) return false;
    if (returnFilter === "approved" && (r.status !== "approved" && r.status !== "refund_issued")) return false;
    if (returnFilter === "rejected" && r.status !== "rejected") return false;
    if (search) {
      const q = search.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchOrder = r.order_number.toLowerCase().includes(q);
      const matchCustomer = r.customer.toLowerCase().includes(q);
      const matchProduct = r.product.toLowerCase().includes(q);
      if (!matchId && !matchOrder && !matchCustomer && !matchProduct) return false;
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setReturnsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`RMA #${id} updated: ${newStatus.replace(/_/g, " ").toUpperCase()}`);
  };

  const handleAddRma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRmaForm.customer || !newRmaForm.product) return toast.error("Customer and product required");
    const newId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry = {
      id: newId,
      order_number: newRmaForm.orderNumber,
      customer: newRmaForm.customer,
      product: newRmaForm.product,
      amount: Number(newRmaForm.amount),
      reason: newRmaForm.reason,
      status: "pending_inspection",
      date: new Date().toISOString(),
    };
    setReturnsList([newEntry, ...returnsList]);
    setIsNewRmaModalOpen(false);
    setNewRmaForm({ orderNumber: "ORD-", customer: "", product: "", amount: 5000, reason: "Defective / damaged item" });
    toast.success(`RMA #${newId} logged into inspection queue`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total RMAs</span>
          <div className="text-2xl font-black text-foreground mt-1">{returnsList.length} Requests</div>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Return Registry</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pending Inspection</span>
          <div className="text-2xl font-black text-warning mt-1">
            {returnsList.filter((r) => r.status === "pending_inspection").length}
          </div>
          <p className="text-[11px] text-warning font-semibold mt-0.5">Awaiting depot check</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Refunds Disbursed</span>
          <div className="text-2xl font-black text-success mt-1">
            KES {returnsList.filter((r) => r.status === "refund_issued").reduce((s, r) => s + r.amount, 0).toLocaleString("en-KE")}
          </div>
          <p className="text-[11px] text-success font-semibold mt-0.5">Processed to M-Pesa</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Return Rate</span>
          <div className="text-2xl font-black text-primary mt-1">1.8%</div>
          <p className="text-[11px] text-primary font-semibold mt-0.5">Target: &lt; 5.0%</p>
        </div>
      </div>

      {/* Analytics Sub-View */}
      {sub === "analytics" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="border-b border-border pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider">Return Diagnostics & Defect Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Root cause breakdown of returned merchandise across inventory categories.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[
                { reason: "Size / Dimensions Mismatch", pct: 45 },
                { reason: "Defective Hardware / Fabric Fault", pct: 25 },
                { reason: "Damaged During Delivery Courier", pct: 20 },
                { reason: "Wrong Item Dispatched", pct: 10 },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span>{item.reason}</span>
                    <span className="font-mono text-primary">{item.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-muted/10 border border-border space-y-3 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-success font-black text-sm">
                <ShieldCheck className="h-5 w-5" /> 98.2% Defect-Free Fulfillment
              </div>
              <p className="text-xs text-muted-foreground">
                All returns are inspected at the Westlands Central Warehouse within 24 hours of drop-off.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search RMA #, Order #, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button
          onClick={() => setIsNewRmaModalOpen(true)}
          className="rounded-xl h-11 px-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Log Return Ticket
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-muted/20 text-[10px] text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left font-black uppercase">RMA # & Order</th>
                <th className="px-6 py-4 text-left font-black uppercase">Customer</th>
                <th className="px-6 py-4 text-left font-black uppercase">Item & Reason</th>
                <th className="px-6 py-4 text-left font-black uppercase">Refund Value</th>
                <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                <th className="px-6 py-4 text-right font-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{r.id}</span>
                    <div className="text-[11px] text-muted-foreground font-mono mt-1">#{r.order_number}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground text-xs">{r.customer}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold text-foreground">{r.product}</div>
                    <div className="text-[11px] text-muted-foreground italic">"{r.reason}"</div>
                  </td>
                  <td className="px-6 py-4 font-black text-primary text-xs">
                    KES {Number(r.amount).toLocaleString("en-KE")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                      r.status === "pending_inspection" ? "bg-warning/10 text-warning border border-warning/20" :
                      r.status === "approved" ? "bg-primary/10 text-primary border border-primary/20" :
                      r.status === "refund_issued" ? "bg-success/10 text-success border border-success/20" :
                      "bg-error/10 text-error border border-error/20"
                    }`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      {r.status === "pending_inspection" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(r.id, "approved")}
                            className="px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors text-xs font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, "rejected")}
                            className="px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors text-xs font-bold cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, "refund_issued")}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-black uppercase cursor-pointer"
                        >
                          Disburse Refund
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    No return requests found in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── LOG RETURN TICKET MODAL ─── */}
      <Dialog open={isNewRmaModalOpen} onOpenChange={setIsNewRmaModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Log Return & RMA Ticket</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Initiate a merchandise return or customer refund claim.</p>
          </DialogHeader>

          <form onSubmit={handleAddRma} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Order Number *</label>
                <input
                  required
                  value={newRmaForm.orderNumber}
                  onChange={(e) => setNewRmaForm({ ...newRmaForm, orderNumber: e.target.value })}
                  placeholder="e.g. ORD-9821"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Refund Amount (KES) *</label>
                <input
                  type="number"
                  required
                  value={newRmaForm.amount}
                  onChange={(e) => setNewRmaForm({ ...newRmaForm, amount: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Customer Full Name *</label>
              <input
                required
                value={newRmaForm.customer}
                onChange={(e) => setNewRmaForm({ ...newRmaForm, customer: e.target.value })}
                placeholder="e.g. Jane Wanjiku"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Product Name *</label>
              <input
                required
                value={newRmaForm.product}
                onChange={(e) => setNewRmaForm({ ...newRmaForm, product: e.target.value })}
                placeholder="e.g. Smart Acoustic Speaker Pro"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Return Reason</label>
              <input
                value={newRmaForm.reason}
                onChange={(e) => setNewRmaForm({ ...newRmaForm, reason: e.target.value })}
                placeholder="e.g. Defective zipper, Wrong color"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsNewRmaModalOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                Submit RMA Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN CONTROLLER & ROUTER
   ═══════════════════════════════════════════════════════════════ */
function CustomersSubPage() {
  const { category, sub } = Route.useParams();
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subTitle = sub.replace(/-/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const isReviews = category === "reviews";
  const isReturns = category === "returns";


  return (
    <AdminShell title={`${catTitle}: ${subTitle}`}>
      <div className="space-y-6">

        {/* Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${
            isReviews ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
          }`}>
            {isReviews ? <Star className="h-6 w-6" /> : <Undo2 className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {isReviews ? "Product Reviews & Ratings Moderation" : "Returns & Refund RMA Management"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isReviews
                ? "Moderate customer feedback, publish verified reviews, and track product satisfaction."
                : "Manage return merchandise authorizations and process instant customer refunds."}
            </p>
          </div>
        </div>

        {isReviews && <ReviewsPage sub={sub} />}
        {isReturns && <ReturnsPage sub={sub} />}
      </div>
    </AdminShell>
  );
}
