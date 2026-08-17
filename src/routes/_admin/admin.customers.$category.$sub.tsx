import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Star, MessageSquare, ThumbsUp, ThumbsDown, Trash2, CheckCircle2,
  XCircle, Clock, RefreshCw, Filter, AlertCircle, Send,
} from "lucide-react";
import {
  listProductReviews, approveReview, deleteReview,
  listCustomerFeedback, updateFeedbackStatus, deleteFeedback,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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
  new: "bg-primary/10 text-primary",
  read: "bg-muted text-muted-foreground",
  replied: "bg-success/10 text-success",
  resolved: "bg-success/10 text-success",
  archived: "bg-muted text-muted-foreground",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Reviews page ────────────────────────────────────────────── */
function ReviewsPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => listProductReviews(),
    onError: (e: any) => toast.error(`Failed to load reviews: ${e.message}`),
  });

  const approveMut = useMutation({
    mutationFn: (vars: { id: string; approved: boolean }) =>
      approveReview({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(vars.approved ? "Review approved" : "Review unpublished");
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

  const reviews = (data?.reviews ?? []).filter((r: any) => {
    if (filter === "pending") return !r.is_approved;
    if (filter === "approved") return r.is_approved;
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
          { label: "Approved", value: (data?.total ?? 0) - (data?.pendingCount ?? 0), icon: CheckCircle2, color: "text-success" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="text-xl font-black tracking-tight">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "pending", "approved"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`h-8 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No reviews found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Product reviews from customers will appear here once submitted.
          </p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {reviews.map((r: any) => (
            <motion.div
              key={r.id}
              variants={itemVariants}
              className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4"
            >
              <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning grid place-items-center shrink-0">
                <Star className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <StarRow rating={r.rating} />
                  <span className="text-xs font-bold">{r.reviewer_name ?? (r.profiles as any)?.full_name ?? "Anonymous"}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{(r.products as any)?.name ?? "—"}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.title && <p className="text-sm font-bold mt-1">{r.title}</p>}
                {r.body && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.body}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      r.is_approved ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    }`}
                  >
                    {r.is_approved ? "Approved" : "Pending"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => approveMut.mutate({ id: r.id, approved: !r.is_approved })}
                  disabled={approveMut.isPending}
                  className={`h-8 w-8 rounded-lg grid place-items-center transition-all ${
                    r.is_approved
                      ? "bg-muted text-muted-foreground hover:bg-warning/10 hover:text-warning"
                      : "bg-success/10 text-success hover:bg-success hover:text-white"
                  }`}
                  title={r.is_approved ? "Unpublish" : "Approve"}
                >
                  {r.is_approved ? <ThumbsDown className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { if (confirm("Delete this review?")) deleteMut.mutate(r.id); }}
                  disabled={deleteMut.isPending}
                  className="h-8 w-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all grid place-items-center"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ── Feedback page ───────────────────────────────────────────── */
const FEEDBACK_STATUSES = ["new", "read", "replied", "resolved", "archived"] as const;

function FeedbackPage() {
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: () => listCustomerFeedback(),
    onError: (e: any) => toast.error(`Failed to load feedback: ${e.message}`),
  });

  const updateMut = useMutation({
    mutationFn: (vars: { id: string; status: string; admin_notes?: string }) =>
      updateFeedbackStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Feedback updated");
      setExpanded(null);
      setNoteInput("");
      qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFeedback({ data: { id } }),
    onSuccess: () => {
      toast.success("Feedback deleted");
      qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allFeedback = data?.feedback ?? [];
  const filtered = activeFilter === "all" ? allFeedback : allFeedback.filter((f: any) => f.status === activeFilter);

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Feedback", value: data?.total ?? 0, icon: MessageSquare, color: "text-primary" },
          { label: "New / Unread", value: data?.newCount ?? 0, icon: AlertCircle, color: "text-warning" },
          { label: "Resolved", value: allFeedback.filter((f: any) => f.status === "resolved").length, icon: CheckCircle2, color: "text-success" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <Icon className={`h-5 w-5 shrink-0 ${color}`} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
              <div className="text-xl font-black tracking-tight">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", ...FEEDBACK_STATUSES] as const).map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`h-8 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors capitalize ${
              activeFilter === f ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Feedback list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No feedback found</p>
          <p className="text-xs text-muted-foreground mt-1">Customer feedback submissions will appear here.</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {filtered.map((f: any) => (
            <motion.div key={f.id} variants={itemVariants} className="bg-card border border-border rounded-2xl overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-section/20 transition-colors"
                onClick={() => setExpanded(expanded === f.id ? null : f.id)}
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm truncate">{f.subject || "(No subject)"}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${statusChip[f.status] ?? "bg-muted"}`}>
                      {f.status}
                    </span>
                    <span className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded capitalize">{f.category}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {f.customer_name || (f.profiles as any)?.full_name || "Anonymous"} · {f.customer_email || "—"} · {new Date(f.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm("Delete this feedback?")) deleteMut.mutate(f.id); }}
                    className="h-8 w-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all grid place-items-center"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Expanded body */}
              <AnimatePresence>
                {expanded === f.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                      <p className="text-sm text-foreground leading-relaxed">{f.message}</p>
                      {f.admin_notes && (
                        <div className="bg-muted/30 rounded-xl p-3">
                          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Admin Notes</div>
                          <p className="text-xs">{f.admin_notes}</p>
                        </div>
                      )}
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">Admin Notes</label>
                          <textarea
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Add a note or reply..."
                            rows={2}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-muted/20 resize-none outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <select
                            defaultValue={f.status}
                            className="h-9 px-3 rounded-xl border border-border bg-muted/20 text-xs outline-none"
                            onChange={(e) => {
                              updateMut.mutate({ id: f.id, status: e.target.value, admin_notes: noteInput || undefined });
                            }}
                          >
                            {FEEDBACK_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

/* ── Returns & Refunds page ─────────────────────────────────── */
function ReturnsPage({ sub }: { sub: string }) {
  const [returnFilter, setReturnFilter] = useState<"all" | "requests" | "refunds" | "approved" | "rejected">(
    sub === "refunds" ? "refunds" : sub === "approved" ? "approved" : sub === "rejected" ? "rejected" : "all"
  );

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
  ]);

  const filteredReturns = returnsList.filter((r) => {
    if (returnFilter === "requests") return r.status === "pending_inspection";
    if (returnFilter === "refunds") return r.status === "approved" || r.status === "refund_issued";
    if (returnFilter === "approved") return r.status === "approved" || r.status === "refund_issued";
    if (returnFilter === "rejected") return r.status === "rejected";
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setReturnsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`Return #${id} marked as ${newStatus.replace(/_/g, " ")}`);
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total RMAs</span>
          <div className="text-2xl font-black text-foreground mt-1">{returnsList.length} Requests</div>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Logged this month</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Pending Inspection</span>
          <div className="text-2xl font-black text-warning mt-1">
            {returnsList.filter((r) => r.status === "pending_inspection").length}
          </div>
          <p className="text-[11px] text-warning font-semibold mt-0.5">Awaiting depot check</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Refunds Issued</span>
          <div className="text-2xl font-black text-success mt-1">
            KES {returnsList.filter((r) => r.status === "refund_issued").reduce((s, r) => s + r.amount, 0).toLocaleString("en-KE")}
          </div>
          <p className="text-[11px] text-success font-semibold mt-0.5">M-Pesa / Credit</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Return Rate</span>
          <div className="text-2xl font-black text-primary mt-1">1.8%</div>
          <p className="text-[11px] text-primary font-semibold mt-0.5">Well below 5% target</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: "all", label: "All Returns" },
          { key: "requests", label: "Pending Inspection" },
          { key: "refunds", label: "Refund Queue" },
          { key: "approved", label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setReturnFilter(t.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shrink-0 ${
              returnFilter === t.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
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
                <th className="px-6 py-4 text-left font-black uppercase">Value</th>
                <th className="px-6 py-4 text-left font-black uppercase">Status</th>
                <th className="px-6 py-4 text-right font-black uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-primary text-xs">{r.id}</span>
                    <div className="text-[11px] text-muted-foreground font-mono">#{r.order_number}</div>
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
                            className="px-2.5 py-1 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-colors text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(r.id, "rejected")}
                            className="px-2.5 py-1 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors text-xs font-bold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button
                          onClick={() => handleUpdateStatus(r.id, "refund_issued")}
                          className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-bold"
                        >
                          Issue Refund
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
    </div>
  );
}

/* ── Router ──────────────────────────────────────────────────── */
function CustomersSubPage() {
  const { category, sub } = Route.useParams();
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subTitle = sub.replace(/-/g, " ").split(" ").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const isReviews = category === "reviews";
  const isFeedback = category === "feedback";
  const isReturns = category === "returns";

  return (
    <AdminShell title={`${catTitle}: ${subTitle}`}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center gap-4 shadow-sm">
          <div className={`h-12 w-12 rounded-2xl grid place-items-center ${
            isReviews ? "bg-warning/10 text-warning" : isFeedback ? "bg-primary/10 text-primary" : "bg-conversion/10 text-conversion"
          }`}>
            {isReviews ? <Star className="h-6 w-6" /> : isFeedback ? <MessageSquare className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {isReviews ? "Product Reviews & Ratings" : isFeedback ? "Customer Feedback & Inquiries" : "Returns & Refund RMAs"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isReviews
                ? "Moderate, approve, or remove customer product reviews."
                : isFeedback
                ? "Read, categorise, and respond to customer feedback submissions."
                : "Manage return merchandise authorizations and process customer refunds."}
            </p>
          </div>
        </div>

        {isReviews && <ReviewsPage />}
        {isFeedback && <FeedbackPage />}
        {isReturns && <ReturnsPage sub={sub} />}
        {!isReviews && !isFeedback && !isReturns && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <p className="text-sm text-muted-foreground">Navigate to a specific sub-section to view data.</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

