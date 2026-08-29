import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Star,
  CheckCircle,
  Trash2,
  Plus,
  Search,
  RefreshCw,
  MessageSquare,
  Flag,
  Shield,
  Send,
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listProductReviews,
  approveReview,
  deleteReview,
  createAdminReview,
  replyToReview,
  flagReview,
  bulkApproveReviews,
  listReturns,
  createReturn,
  updateReturnStatus,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_admin/admin/customers/$category/$sub")({
  component: CustomersSubPage,
});

// ─── Star Row ────────────────────────────────────────────────────────────────
function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-border"}`}
        />
      ))}
    </div>
  );
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_inspection: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    inspecting: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    approved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    refund_issued: "bg-primary/10 text-primary border-primary/20",
    exchange_sent: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    closed: "bg-muted text-muted-foreground border-border",
  };
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {label}
    </span>
  );
}

// ─── Compute SLA days ────────────────────────────────────────────────────────
function slaDays(createdAt: string): { days: number; label: string; color: string } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days <= 1) return { days, label: "< 1 day", color: "text-emerald-600" };
  if (days <= 3) return { days, label: `${days} days`, color: "text-amber-600" };
  return { days, label: `${days} days`, color: "text-red-500" };
}

// ══════════════════════════════════════════════════════════════════════════════
// REVIEWS PAGE
// ══════════════════════════════════════════════════════════════════════════════
function ReviewsPage({ sub }: { sub: string }) {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    reviewerName: "",
    rating: 5,
    title: "",
    body: "",
    productId: "",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => listProductReviews(),
  });

  // Compute real analytics from DB data
  const allReviews = data?.reviews ?? [];
  const realAvg =
    allReviews.length > 0
      ? (allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : "0.0";
  const starDist = [5, 4, 3, 2, 1].map((star) => {
    const count = allReviews.filter((r: any) => r.rating === star).length;
    const pct = allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0;
    return { star, count, pct };
  });

  // Sub-tab filtering
  const filtered = allReviews
    .filter((r: any) => {
      if (sub === "pending") return !r.is_approved;
      if (sub === "approved") return r.is_approved && !(r as any).is_flagged;
      if (sub === "reported") return !!(r as any).is_flagged || r.rating <= 1;
      return true; // "all"
    })
    .filter((r: any) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (r.reviewer_name ?? "").toLowerCase().includes(q) ||
        (r.title ?? "").toLowerCase().includes(q) ||
        (r.body ?? "").toLowerCase().includes(q) ||
        ((r.products as any)?.name ?? "").toLowerCase().includes(q)
      );
    });

  const pendingIds = allReviews.filter((r: any) => !r.is_approved).map((r: any) => r.id);

  const approve = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      approveReview({ data: { id, approved } }),
    onSuccess: () => {
      toast.success("Review status updated");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendReply = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      replyToReview({ data: { id, admin_reply: text } }),
    onSuccess: () => {
      toast.success("Reply saved");
      setReplyingId(null);
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const flag = useMutation({
    mutationFn: ({ id, flagged }: { id: string; flagged: boolean }) =>
      flagReview({ data: { id, is_flagged: flagged } }),
    onSuccess: () => {
      toast.success("Flag updated");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkApprove = useMutation({
    mutationFn: () => bulkApproveReviews({ data: { ids: pendingIds } }),
    onSuccess: (res: any) => {
      toast.success(`Approved ${res.count} reviews`);
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createRev = useMutation({
    mutationFn: () =>
      createAdminReview({
        data: {
          reviewerName: newReview.reviewerName,
          rating: newReview.rating,
          title: newReview.title,
          body: newReview.body,
          productId: newReview.productId || undefined,
          isApproved: true,
        },
      }),
    onSuccess: () => {
      toast.success("Review created");
      setCreateOpen(false);
      setNewReview({ reviewerName: "", rating: 5, title: "", body: "", productId: "" });
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell title="Reviews Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
              <Star className="h-6 w-6 fill-amber-500" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Product Reviews
              </div>
              <h2 className="text-xl font-black tracking-tight">Review Moderation Center</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            {sub === "pending" && pendingIds.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkApprove.mutate()}
                disabled={bulkApprove.isPending}
                className="rounded-xl text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500 hover:text-white"
              >
                <CheckCircle className="h-3.5 w-3.5" /> Approve All ({pendingIds.length})
              </Button>
            )}
            <Button
              onClick={() => setCreateOpen(true)}
              className="rounded-xl h-9 px-4 font-black text-xs uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Review
            </Button>
          </div>
        </div>

        {/* KPI Strip — REAL COMPUTED DATA */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Average Rating",
              value: `${realAvg} / 5`,
              sub: `from ${allReviews.length} reviews`,
              color: "text-amber-500",
            },
            {
              label: "5-Star Reviews",
              value: `${starDist[0]?.pct ?? 0}%`,
              sub: `${starDist[0]?.count ?? 0} five-star reviews`,
              color: "text-emerald-600",
            },
            {
              label: "Pending Approval",
              value: String(data?.pendingCount ?? 0),
              sub: "awaiting moderation",
              color: "text-primary",
            },
            {
              label: "Total Reviews",
              value: String(data?.total ?? 0),
              sub: "all-time across all products",
              color: "text-foreground",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics sub-view */}
        {sub === "analytics" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-wider mb-5">
              Rating Distribution — Real Data
            </h3>
            <div className="space-y-3">
              {starDist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-14 shrink-0">
                    <span className="text-xs font-black">{star}</span>
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-16 text-right text-xs font-bold text-muted-foreground">
                    {count} ({pct}%)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {sub !== "analytics" && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search reviews by reviewer, title, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Reviews List */}
        {sub !== "analytics" && (
          <div className="space-y-3">
            {isLoading && (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" />
                Loading reviews...
              </div>
            )}

            {filtered.map((r: any) => {
              const hasUserProfile = !!r.profiles;
              const adminReply = (r as any).admin_reply;
              const isFlagged = !!(r as any).is_flagged;
              return (
                <div
                  key={r.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 font-black grid place-items-center text-sm shrink-0">
                        {(r.reviewer_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-foreground">
                            {r.reviewer_name || "Anonymous"}
                          </span>
                          {hasUserProfile ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              ✓ Verified Buyer
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                              Unverified
                            </span>
                          )}
                          {isFlagged && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                              ⚑ Flagged
                            </span>
                          )}
                          {r.is_approved ? (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Published
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRow rating={r.rating} />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString("en-KE", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {(r.products as any)?.name && (
                            <>
                              <span className="text-muted-foreground text-[10px]">·</span>
                              <Link
                                to="/admin/products"
                                className="text-[10px] text-primary font-bold hover:underline flex items-center gap-0.5"
                              >
                                <Package className="h-2.5 w-2.5" />
                                {(r.products as any).name}
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setReplyingId(replyingId === r.id ? null : r.id);
                          setReplyText(adminReply || "");
                        }}
                        className="h-8 px-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-black transition-all flex items-center gap-1"
                        title="Reply"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => flag.mutate({ id: r.id, flagged: !isFlagged })}
                        className={`h-8 px-2.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${isFlagged ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" : "bg-muted text-muted-foreground hover:bg-red-500/10 hover:text-red-500"}`}
                        title="Flag"
                      >
                        <Flag className="h-3.5 w-3.5" />
                      </button>
                      {!r.is_approved ? (
                        <button
                          onClick={() => approve.mutate({ id: r.id, approved: true })}
                          className="h-8 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-xs font-black transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => approve.mutate({ id: r.id, approved: false })}
                          className="h-8 px-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 text-xs font-black transition-all flex items-center gap-1"
                          title="Unpublish"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("Delete this review permanently?")) remove.mutate(r.id);
                        }}
                        className="h-8 px-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black transition-all flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Review content */}
                  {r.title && <div className="font-black text-sm text-foreground">{r.title}</div>}
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>

                  {/* Existing admin reply */}
                  {adminReply && replyingId !== r.id && (
                    <div className="ml-4 p-3 bg-primary/5 border-l-2 border-primary rounded-r-xl">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Shield className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                          Admin Response
                        </span>
                      </div>
                      <p className="text-xs text-foreground">{adminReply}</p>
                    </div>
                  )}

                  {/* Reply inline form */}
                  {replyingId === r.id && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        {adminReply ? "Update Admin Response" : "Write Admin Response"}
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a public response to this review..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => sendReply.mutate({ id: r.id, text: replyText })}
                          disabled={sendReply.isPending || !replyText.trim()}
                          className="rounded-xl text-xs font-black"
                        >
                          <Send className="h-3.5 w-3.5 mr-1" />
                          {sendReply.isPending ? "Saving…" : "Publish Reply"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingId(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {!isLoading && filtered.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-black text-sm">No reviews in this view</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sub === "pending"
                    ? "No reviews awaiting moderation."
                    : sub === "reported"
                      ? "No flagged or reported reviews."
                      : "Reviews will appear here."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Review Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Add Customer Review</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manually log a review on behalf of a customer.
            </p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newReview.reviewerName.trim() || !newReview.body.trim())
                return toast.error("Name and review body required");
              createRev.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Reviewer Name *
              </label>
              <input
                required
                value={newReview.reviewerName}
                onChange={(e) => setNewReview({ ...newReview, reviewerName: e.target.value })}
                placeholder="e.g. Jane Wanjiku"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Star Rating
                </label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Review Title
                </label>
                <input
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Optional headline"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Review Body *
              </label>
              <textarea
                required
                rows={3}
                value={newReview.body}
                onChange={(e) => setNewReview({ ...newReview, body: e.target.value })}
                placeholder="Full review text..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <DialogFooter className="gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl text-xs font-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRev.isPending}
                className="rounded-xl font-black px-6 text-xs uppercase tracking-wider"
              >
                {createRev.isPending ? "Creating…" : "Create Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RETURNS PAGE — Now wired to real Supabase `returns` table
// ══════════════════════════════════════════════════════════════════════════════
function ReturnsPage({ sub }: { sub: string }) {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolveRefund, setResolveRefund] = useState("M-Pesa");
  const [newReturn, setNewReturn] = useState({
    customer_name: "",
    product_name: "",
    order_number: "",
    amount: 0,
    reason: "Defective Product",
    resolution_type: "refund",
    refund_method: "M-Pesa",
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "returns"],
    queryFn: () => listReturns(),
  });

  const allReturns: any[] = data?.returns ?? [];

  const filtered = allReturns.filter((r) => {
    const matchSub =
      sub === "pending"
        ? r.status === "pending_inspection"
        : sub === "approved"
          ? r.status === "approved" || r.status === "inspecting"
          : sub === "resolved"
            ? r.status === "refund_issued" || r.status === "exchange_sent" || r.status === "closed"
            : true;
    if (!matchSub) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (r.customer_name ?? "").toLowerCase().includes(q) ||
      (r.product_name ?? "").toLowerCase().includes(q) ||
      (r.rma_number ?? "").toLowerCase().includes(q)
    );
  });

  const updateStatus = useMutation({
    mutationFn: (vars: {
      id: string;
      status: string;
      staff_notes?: string;
      refund_method?: string;
    }) => updateReturnStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Return status updated");
      setResolveId(null);
      setResolveNotes("");
      qc.invalidateQueries({ queryKey: ["admin", "returns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const logReturn = useMutation({
    mutationFn: () => createReturn({ data: newReturn }),
    onSuccess: () => {
      toast.success("Return logged successfully");
      setLogOpen(false);
      setNewReturn({
        customer_name: "",
        product_name: "",
        order_number: "",
        amount: 0,
        reason: "Defective Product",
        resolution_type: "refund",
        refund_method: "M-Pesa",
      });
      qc.invalidateQueries({ queryKey: ["admin", "returns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reasonOptions = [
    "Defective Product",
    "Wrong Item Delivered",
    "Size/Fit Issue",
    "Changed Mind",
    "Product Damaged in Transit",
    "Not As Described",
    "Duplicate Order",
    "Other",
  ];
  const refundMethods = ["M-Pesa", "Cash", "Store Credit", "Bank Transfer", "Card Reversal"];

  // Compute real analytics from DB
  const pending = allReturns.filter((r) => r.status === "pending_inspection").length;
  const resolved = allReturns.filter(
    (r) => r.status === "refund_issued" || r.status === "exchange_sent" || r.status === "closed",
  ).length;
  const reasonMap: Record<string, number> = {};
  allReturns.forEach((r) => {
    reasonMap[r.reason || "Other"] = (reasonMap[r.reason || "Other"] || 0) + 1;
  });
  const topReason = Object.entries(reasonMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <AdminShell title="Returns & RMA Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Returns / RMA
              </div>
              <h2 className="text-xl font-black tracking-tight">Returns Management Center</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              onClick={() => setLogOpen(true)}
              className="rounded-xl h-9 px-4 font-black text-xs uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Log Return
            </Button>
          </div>
        </div>

        {/* KPI Strip — REAL DATA FROM DB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total RMAs",
              value: String(data?.total ?? 0),
              sub: "all-time return requests",
              color: "text-foreground",
            },
            {
              label: "Pending",
              value: String(pending),
              sub: "awaiting inspection",
              color: "text-amber-600",
            },
            {
              label: "Refunded (KES)",
              value: `KES ${Number(data?.totalRefunded ?? 0).toLocaleString("en-KE")}`,
              sub: "total refund disbursements",
              color: "text-red-500",
            },
            {
              label: "Avg Resolution",
              value: `${data?.avgResolutionDays ?? 0} day${data?.avgResolutionDays !== 1 ? "s" : ""}`,
              sub: "average turnaround time",
              color: "text-emerald-600",
            },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
              <div className={`text-xl font-black mt-0.5 ${s.color}`}>{s.value}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Analytics sub-view */}
        {sub === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4">
                Return Reason Breakdown
              </h3>
              {Object.keys(reasonMap).length === 0 ? (
                <p className="text-xs text-muted-foreground">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(reasonMap)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => (
                      <div key={reason} className="flex items-center gap-3">
                        <div className="flex-1 text-xs font-bold truncate">{reason}</div>
                        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.round((count / allReturns.length) * 100)}%` }}
                          />
                        </div>
                        <div className="w-8 text-right text-xs font-bold">{count}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4">Quick Stats</h3>
              <div className="space-y-4">
                {[
                  { label: "Pending Inspection", value: String(pending), color: "text-amber-600" },
                  {
                    label: "Resolved / Closed",
                    value: String(resolved),
                    color: "text-emerald-600",
                  },
                  { label: "Top Return Reason", value: topReason, color: "text-foreground" },
                  {
                    label: "Total Refunded",
                    value: `KES ${Number(data?.totalRefunded ?? 0).toLocaleString("en-KE")}`,
                    color: "text-red-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between items-center border-b border-border pb-3"
                  >
                    <span className="text-xs font-bold text-muted-foreground">{s.label}</span>
                    <span className={`text-xs font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        {sub !== "analytics" && (
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search by customer, product, or RMA number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Returns List */}
        {sub !== "analytics" && (
          <div className="space-y-3">
            {isLoading && (
              <div className="bg-card border border-border rounded-2xl p-10 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" />
                Loading returns from database...
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <RotateCcw className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-black text-sm">No returns in this view</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {allReturns.length === 0
                    ? "No returns have been logged yet. The returns table may need to be created in Supabase."
                    : `No ${sub} returns match your search.`}
                </p>
                {allReturns.length === 0 && (
                  <Button
                    onClick={() => setLogOpen(true)}
                    className="mt-4 rounded-xl text-xs font-black"
                    size="sm"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Log First Return
                  </Button>
                )}
              </div>
            )}

            {filtered.map((r: any) => {
              const sla = slaDays(r.created_at);
              const isExpanded = expandedId === r.id;
              return (
                <div
                  key={r.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Summary row */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center shrink-0">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-foreground">
                            {r.customer_name}
                          </span>
                          <StatusChip status={r.status} />
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-muted/40 ${sla.color}`}
                          >
                            <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                            Open: {sla.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-mono font-bold">{r.rma_number}</span>
                          {r.order_number && <> · Order #{r.order_number}</>}· {r.product_name}·{" "}
                          <span className="font-bold text-foreground">
                            KES {Number(r.amount).toLocaleString("en-KE")}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Reason: <span className="font-bold text-foreground">{r.reason}</span>
                          {r.refund_method && (
                            <>
                              {" "}
                              · Method: <span className="font-bold">{r.refund_method}</span>
                            </>
                          )}
                          {r.resolution_type && (
                            <>
                              {" "}
                              · Type:{" "}
                              <span className="font-bold capitalize">{r.resolution_type}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {/* Status action buttons */}
                      {r.status === "pending_inspection" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: r.id, status: "approved" })}
                          className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-xs font-black transition-all"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                          Approve
                        </button>
                      )}
                      {(r.status === "approved" || r.status === "inspecting") && (
                        <button
                          onClick={() => {
                            setResolveId(r.id);
                            setResolveRefund(r.refund_method || "M-Pesa");
                            setResolveNotes("");
                          }}
                          className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-black transition-all"
                        >
                          <Send className="h-3.5 w-3.5 inline mr-1" />
                          Issue Refund
                        </button>
                      )}
                      {r.status === "pending_inspection" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: r.id, status: "rejected" })}
                          className="h-8 px-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white text-xs font-black transition-all"
                        >
                          <X className="h-3.5 w-3.5 inline mr-1" />
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        className="h-8 w-8 grid place-items-center rounded-lg bg-muted hover:bg-muted/60 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/10 p-5 space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        {[
                          { label: "RMA Number", value: r.rma_number },
                          { label: "Order Number", value: r.order_number || "—" },
                          {
                            label: "Submitted",
                            value: new Date(r.created_at).toLocaleDateString("en-KE", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }),
                          },
                          {
                            label: "Last Updated",
                            value: r.updated_at
                              ? new Date(r.updated_at).toLocaleDateString("en-KE", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "—",
                          },
                        ].map((d) => (
                          <div
                            key={d.label}
                            className="bg-card border border-border rounded-xl p-3"
                          >
                            <div className="text-[10px] font-black uppercase text-muted-foreground">
                              {d.label}
                            </div>
                            <div className="font-bold text-foreground mt-0.5">{d.value}</div>
                          </div>
                        ))}
                      </div>
                      {r.staff_notes && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="text-[10px] font-black uppercase text-primary mb-1">
                            Staff Resolution Notes
                          </div>
                          <p className="text-xs text-foreground">{r.staff_notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issue Refund inline form */}
                  {resolveId === r.id && (
                    <div className="border-t border-border bg-muted/10 p-5 space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-primary">
                        Resolve: Issue Refund / Exchange
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">
                            Refund Method
                          </label>
                          <select
                            value={resolveRefund}
                            onChange={(e) => setResolveRefund(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            {refundMethods.map((m) => (
                              <option key={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-muted-foreground">
                            Resolution Notes
                          </label>
                          <input
                            value={resolveNotes}
                            onChange={(e) => setResolveNotes(e.target.value)}
                            placeholder="e.g. M-Pesa ref: QWE12345"
                            className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            updateStatus.mutate({
                              id: r.id,
                              status: "refund_issued",
                              staff_notes: resolveNotes,
                              refund_method: resolveRefund,
                            })
                          }
                          disabled={updateStatus.isPending}
                          className="rounded-xl text-xs font-black"
                        >
                          {updateStatus.isPending ? "Processing…" : "Confirm Refund Issued"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatus.mutate({
                              id: r.id,
                              status: "exchange_sent",
                              staff_notes: resolveNotes,
                            })
                          }
                          disabled={updateStatus.isPending}
                          className="rounded-xl text-xs font-black"
                        >
                          Exchange Sent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResolveId(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Return Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-lg bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Log New Return / RMA</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record a customer return request. An RMA number will be auto-generated.
            </p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newReturn.customer_name.trim() || !newReturn.product_name.trim())
                return toast.error("Customer and product name required");
              logReturn.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Customer Name *
                </label>
                <input
                  required
                  value={newReturn.customer_name}
                  onChange={(e) => setNewReturn({ ...newReturn, customer_name: e.target.value })}
                  placeholder="e.g. Jane Wanjiku"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Order Number
                </label>
                <input
                  value={newReturn.order_number}
                  onChange={(e) => setNewReturn({ ...newReturn, order_number: e.target.value })}
                  placeholder="e.g. ORD-001234"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Product Name *
              </label>
              <input
                required
                value={newReturn.product_name}
                onChange={(e) => setNewReturn({ ...newReturn, product_name: e.target.value })}
                placeholder="e.g. Blue Running Shoes Size 42"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Refund Amount (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newReturn.amount}
                  onChange={(e) => setNewReturn({ ...newReturn, amount: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Refund Method
                </label>
                <select
                  value={newReturn.refund_method}
                  onChange={(e) => setNewReturn({ ...newReturn, refund_method: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {refundMethods.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Return Reason
                </label>
                <select
                  value={newReturn.reason}
                  onChange={(e) => setNewReturn({ ...newReturn, reason: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {reasonOptions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Resolution Type
                </label>
                <select
                  value={newReturn.resolution_type}
                  onChange={(e) => setNewReturn({ ...newReturn, resolution_type: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="refund">Refund</option>
                  <option value="exchange">Exchange / Replacement</option>
                  <option value="store_credit">Store Credit</option>
                </select>
              </div>
            </div>
            <DialogFooter className="gap-2 border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLogOpen(false)}
                className="rounded-xl text-xs font-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={logReturn.isPending}
                className="rounded-xl font-black px-6 text-xs uppercase tracking-wider"
              >
                {logReturn.isPending ? "Logging…" : "Log Return"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN CONTROLLER
// ══════════════════════════════════════════════════════════════════════════════
function CustomersSubPage() {
  const { category, sub } = Route.useParams();
  const isReviews = category === "reviews";
  const isReturns = category === "returns";
  if (isReviews) return <ReviewsPage sub={sub} />;
  if (isReturns) return <ReturnsPage sub={sub} />;
  return (
    <AdminShell title={`${category} / ${sub}`}>
      <div className="flex items-center justify-center h-64 text-muted-foreground text-xs font-bold">
        Unknown section: {category}/{sub}
      </div>
    </AdminShell>
  );
}
