import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Rocket,
  Plus,
  Trash2,
  Percent,
  CircleDollarSign,
  Megaphone,
  Target,
  Zap,
  Users,
  RefreshCw,
  Gift,
  ArrowRight,
  Play,
  Pause,
  Mail,
  MessageSquare,
  Bell,
  Share2,
  Sparkles,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Sliders,
  Send,
  Copy,
  Eye,
  Tag,
  AlertCircle,
  TrendingUp,
  Check,
  DollarSign,
  Smartphone,
  ShoppingBag,
  Radio,
  Download,
  Building2,
  Crown,
  Calendar,
  Timer,
  Award,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCoupons,
  createCoupon,
  createBulkCoupons,
  toggleCouponStatus,
  deleteCoupon,
  listCampaigns,
  createCampaign,
  updateCampaignStatus,
  deleteCampaign,
  listReferrals,
  updateReferralStatus,
  listMarketingAutomations,
  toggleMarketingAutomation,
} from "@/lib/admin.functions";
import { useBranch } from "@/hooks/use-branch";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useAuth } from "@/hooks/use-auth";
import {
  getAllMetrics,
  updateMetricFull,
  createMetric,
  getAllCompanies,
  updateCompanyStatus,
  getAllSiteSettings,
  updateSiteSetting,
  getAuditLogs,
  type EntityStatus,
  type MetricClassification,
  type MetricVisibility,
  type CorporateMetric,
  type Company,
  type SiteSetting,
} from "@/lib/corporate-metrics.functions";
import { EntityStatusBadge, MetricBadge } from "@/components/shared/StatusBadges";

export const Route = createFileRoute("/_admin/admin/growth/$category/$sub")({
  component: GrowthPage,
});

const campaignStatusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  paused: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

const referralStatusColor: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  rewarded: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  expired: "bg-muted text-muted-foreground border-border",
};

// ─── Countdown / Time Remaining Helper ─────────────────────────────────────────
function formatTimeRemaining(expiresAt?: string | null) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { expired: true, text: "Expired" };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days > 1) return { expired: false, text: `${days}d remaining` };
  if (hours > 0) return { expired: false, text: `${hours}h remaining` };
  const mins = Math.floor(diff / (1000 * 60));
  return { expired: false, text: `${mins}m remaining` };
}

/* ═════════════════════════════════════════════════════════════
   1. COUPONS SECTION (All, New, Promo, Flash, Rules, Campaigns)
   ═════════════════════════════════════════════════════════════ */
function CouponsSection({ sub }: { sub: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedBranchId, selectedBranch, isAllBranches } = useBranch();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minSpend, setMinSpend] = useState(0);
  const [usageLimit, setUsageLimit] = useState(0);
  const [customerTier, setCustomerTier] = useState<string>("all");
  const [expiresAt, setExpiresAt] = useState("");
  const [search, setSearch] = useState("");

  // Modals
  const [isNewCouponModalOpen, setIsNewCouponModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Bulk generator state
  const [bulkPrefix, setBulkPrefix] = useState("VIP");
  const [bulkCount, setBulkCount] = useState(50);
  const [bulkDiscountType, setBulkDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [bulkValue, setBulkValue] = useState(15);
  const [bulkMinSpend, setBulkMinSpend] = useState(2500);

  // Flash deal state
  const [flashHours, setFlashHours] = useState("24");

  const {
    data: coupons = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "coupons", selectedBranchId],
    queryFn: () => listCoupons({ data: { branchId: selectedBranchId } }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createCoupon({ data }),
    onSuccess: () => {
      toast.success("Coupon voucher created successfully");
      setCode("");
      setValue(0);
      setMinSpend(0);
      setUsageLimit(0);
      setExpiresAt("");
      setIsNewCouponModalOpen(false);
      setIsPromoModalOpen(false);
      setIsFlashModalOpen(false);
      setIsRuleModalOpen(false);
      if (sub === "new") navigate({ to: "/admin/growth/coupons/all" as any });
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const bulkMutation = useMutation({
    mutationFn: (data: any) => createBulkCoupons({ data }),
    onSuccess: (res: any) => {
      toast.success(`Generated ${res.count} unique vouchers!`);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        ["Coupon Code,Discount Type,Value,Min Spend,Usage Limit"]
          .concat(
            res.codes.map(
              (c: string) => `"${c}",${bulkDiscountType},${bulkValue},${bulkMinSpend},1`,
            ),
          )
          .join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `coupons_batch_${bulkPrefix}_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsBulkModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) => toggleCouponStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Coupon status updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCoupon({ data: { id } }),
    onSuccess: () => {
      toast.success("Coupon removed");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const generateRandomCode = (prefix = "TINDI") => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) rand += chars.charAt(Math.floor(Math.random() * chars.length));
    setCode(`${prefix}-${rand}`);
  };

  // Dedicated "New Coupon" Full Page View
  if (sub === "new") {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl shadow-sm space-y-5">
        <div className="border-b border-border pb-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-primary">
            Voucher Architect
          </div>
          <h3 className="font-black uppercase tracking-wider text-base text-foreground mt-0.5">
            Generate Enterprise Voucher
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure discounts, usage quotas, tier gating, and branch scoping.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!code || value <= 0) return toast.error("Provide a valid code and discount value");
            createMutation.mutate({
              code,
              discount_type: discountType,
              value: Number(value),
              min_spend: minSpend ? Number(minSpend) : null,
              usage_limit: usageLimit ? Number(usageLimit) : null,
              customer_tier: customerTier !== "all" ? customerTier : null,
              expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
              branch_id: selectedBranchId,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Coupon Promo Code *
              </label>
              <button
                type="button"
                onClick={() => generateRandomCode("TINDI")}
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" /> Auto-Generate
              </button>
            </div>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
              placeholder="e.g. JAMHURI2026 or SAVE15"
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono font-bold tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              >
                <option value="percentage">Percentage (%) Off</option>
                <option value="fixed">Fixed Amount (KES) Off</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Discount Value *
              </label>
              <input
                type="number"
                required
                value={value || ""}
                onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                placeholder={
                  discountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 500 (for KES 500)"
                }
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Min Order Spend (KES)
              </label>
              <input
                type="number"
                value={minSpend || ""}
                onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 3000 (0 = No Min)"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Redemption Quota (Limit)
              </label>
              <input
                type="number"
                value={usageLimit || ""}
                onChange={(e) => setUsageLimit(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 500 uses (0 = Unlimited)"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Customer Tier Eligibility
              </label>
              <select
                value={customerTier}
                onChange={(e) => setCustomerTier(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              >
                <option value="all">All Registered Customers</option>
                <option value="platinum">Platinum VIP Only (≥ 100k Spend)</option>
                <option value="gold">Gold VIP & Above (≥ 50k Spend)</option>
                <option value="silver">Silver Tier & Above (≥ 10k Spend)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Expiry Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-muted/20 rounded-xl border border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Target Location:</span>
            <span className="font-black text-primary flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              {isAllBranches ? "All Enterprise Branches" : selectedBranch?.name}
            </span>
          </div>

          <div className="flex gap-2 pt-2 justify-end border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/growth/coupons/all" as any })}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-primary text-primary-foreground font-black px-6 uppercase text-xs tracking-wider"
            >
              {createMutation.isPending ? "Creating…" : "Save & Activate Voucher"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const filteredCoupons = coupons.filter((c: any) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (sub === "flash")
      return (
        c.code.includes("FLASH") ||
        c.code.includes("24H") ||
        (c.discount_type === "percentage" && c.value >= 25)
      );
    if (sub === "promo")
      return (
        c.code.includes("PROMO") ||
        c.code.includes("DEAL") ||
        c.code.includes("OFFER") ||
        c.code.includes("SAVE")
      );
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              {sub === "flash"
                ? "Flash Sales & Timed Deals"
                : sub === "promo"
                  ? "Seasonal & Promotional Campaigns"
                  : sub === "rules"
                    ? "Automated Cart Discount Rules"
                    : sub === "campaigns"
                      ? "Growth Promotional Vouchers"
                      : "Enterprise Voucher Registry"}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {isAllBranches ? "Global Network" : selectedBranch?.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sub === "flash"
              ? "High-velocity discounts configured with automated expiry timers."
              : sub === "promo"
                ? "Seasonal holiday vouchers and customer appreciation codes."
                : sub === "rules"
                  ? "Autonomous checkout deductions applied when shopping carts satisfy criteria."
                  : "Manage, track redemptions, enforce quotas, and toggle voucher statuses."}
          </p>
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
            variant="outline"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
            className="rounded-xl gap-1.5 text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-white"
          >
            <Layers className="h-3.5 w-3.5" /> Bulk Generator
          </Button>

          {sub === "flash" && (
            <Button
              onClick={() => {
                generateRandomCode("FLASH");
                setValue(30);
                setIsFlashModalOpen(true);
              }}
              className="rounded-xl h-9 px-4 bg-red-600 text-white font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Flame className="h-4 w-4 mr-1.5" /> Schedule Flash Sale
            </Button>
          )}

          {sub === "promo" && (
            <Button
              onClick={() => {
                generateRandomCode("PROMO");
                setValue(15);
                setIsPromoModalOpen(true);
              }}
              className="rounded-xl h-9 px-4 font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" /> Launch Promo
            </Button>
          )}

          {sub === "rules" && (
            <Button
              onClick={() => setIsRuleModalOpen(true)}
              className="rounded-xl h-9 px-4 font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Sliders className="h-4 w-4 mr-1.5" /> Add Cart Rule
            </Button>
          )}

          {(sub === "all" || sub === "campaigns") && (
            <Button
              onClick={() => {
                setCode("");
                setValue(0);
                setIsNewCouponModalOpen(true);
              }}
              className="rounded-xl h-9 px-4 font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Voucher
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Total Vouchers
          </span>
          <div className="text-2xl font-black text-foreground mt-1">{coupons.length}</div>
          <p className="text-[11px] text-primary font-semibold mt-0.5">
            {isAllBranches ? "All Enterprise" : selectedBranch?.name}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Active Vouchers
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {coupons.filter((c: any) => c.is_active).length}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Live at POS & Web</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Flash Deals
          </span>
          <div className="text-2xl font-black text-red-500 mt-1">
            {
              coupons.filter(
                (c: any) =>
                  c.code.includes("FLASH") || (c.discount_type === "percentage" && c.value >= 25),
              ).length
            }
          </div>
          <p className="text-[11px] text-red-500 font-semibold mt-0.5">High-Velocity Deals</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
            Disabled / Expired
          </span>
          <div className="text-2xl font-black text-muted-foreground mt-1">
            {coupons.filter((c: any) => !c.is_active).length}
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Archived Codes</p>
        </div>
      </div>

      {/* Rules Engine Display */}
      {sub === "rules" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                Automated Cart Discount Rules
              </h4>
              <p className="text-[11px] text-muted-foreground">
                These rules automatically discount qualifying carts without requiring a voucher
                code.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Autonomous Engine Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">First-Time Buyer Perk</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Auto 10% discount applied to the first checkout order of newly registered customers.
              </p>
              <div className="text-[10px] font-mono text-primary font-bold">
                Trigger: Customer Order Count == 0
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Spend Milestone Tier (KES 10,000+)</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instant KES 1,000 deduction on all carts exceeding KES 10,000 across all branches.
              </p>
              <div className="text-[10px] font-mono text-primary font-bold">
                Trigger: Cart Total &gt; KES 10,000
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Free Delivery Milestone</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                100% shipping fee waived across Kenya for qualifying basket orders over KES 5,000.
              </p>
              <div className="text-[10px] font-mono text-primary font-bold">
                Trigger: Cart Total &gt; KES 5,000
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              placeholder="Search voucher codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-4 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="text-xs font-bold text-muted-foreground">
            {filteredCoupons.length} vouchers listed
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-muted/20 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5">Promo Code</th>
                  <th className="px-5 py-3.5">Discount Value</th>
                  <th className="px-5 py-3.5">Min Spend</th>
                  <th className="px-5 py-3.5">Quota / Redemptions</th>
                  <th className="px-5 py-3.5">Validity / Branch</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-xs text-muted-foreground"
                    >
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />{" "}
                      Loading vouchers...
                    </td>
                  </tr>
                )}
                {!isLoading && filteredCoupons.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-xs text-muted-foreground"
                    >
                      No discount vouchers found. Create one using the action buttons above.
                    </td>
                  </tr>
                )}
                {filteredCoupons.map((c: any) => {
                  const quotaLimit = c.usage_limit || 0;
                  const timesUsed = c.times_used || 0;
                  const quotaPct =
                    quotaLimit > 0 ? Math.min(100, Math.round((timesUsed / quotaLimit) * 100)) : 0;
                  const validity = formatTimeRemaining(c.expires_at);

                  return (
                    <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-primary text-xs tracking-wider bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                            {c.code}
                          </span>
                          {c.code.includes("FLASH") && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-0.5">
                              <Flame className="h-2.5 w-2.5" /> Flash
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-foreground text-xs">
                        {c.discount_type === "percentage"
                          ? `${c.value}% OFF`
                          : `KES ${Number(c.value).toLocaleString("en-KE")} OFF`}
                      </td>
                      <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">
                        {c.min_spend
                          ? `KES ${Number(c.min_spend).toLocaleString("en-KE")}`
                          : "No Minimum"}
                      </td>
                      <td className="px-5 py-3.5">
                        {quotaLimit > 0 ? (
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{timesUsed} used</span>
                              <span className="text-muted-foreground">/ {quotaLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${quotaPct > 80 ? "bg-red-500" : "bg-primary"}`}
                                style={{ width: `${quotaPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unlimited uses</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs">
                          {validity ? (
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-[10px] ${validity.expired ? "text-red-500" : "text-amber-600"}`}
                            >
                              <Clock className="h-3 w-3" /> {validity.text}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">No expiry set</span>
                          )}
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {c.branches?.name || "All Branches"}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                            c.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {c.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              toggleMutation.mutate({ id: c.id, is_active: !c.is_active })
                            }
                            disabled={toggleMutation.isPending}
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors cursor-pointer border ${
                              c.is_active
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                            }`}
                          >
                            {c.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete coupon "${c.code}" permanently?`))
                                deleteMutation.mutate(c.id);
                            }}
                            disabled={deleteMutation.isPending}
                            className="h-7 w-7 grid place-items-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            title="Delete Voucher"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD VOUCHER MODAL */}
      <Dialog
        open={isNewCouponModalOpen || isPromoModalOpen || isFlashModalOpen || isRuleModalOpen}
        onOpenChange={(o) => {
          if (!o) {
            setIsNewCouponModalOpen(false);
            setIsPromoModalOpen(false);
            setIsFlashModalOpen(false);
            setIsRuleModalOpen(false);
          }
        }}
      >
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              {isFlashModalOpen
                ? "Schedule Flash Sale Deal"
                : isPromoModalOpen
                  ? "Launch Seasonal Promotion"
                  : isRuleModalOpen
                    ? "Add Automated Cart Rule"
                    : "Create Discount Voucher"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Configure promo parameters, validity duration, and discount thresholds.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code || value <= 0) return toast.error("Provide a valid code and value");
              let computedExpiry: string | null = null;
              if (isFlashModalOpen) {
                const now = new Date();
                now.setHours(now.getHours() + Number(flashHours));
                computedExpiry = now.toISOString();
              }
              createMutation.mutate({
                code,
                discount_type: discountType,
                value: Number(value),
                min_spend: minSpend ? Number(minSpend) : null,
                usage_limit: usageLimit ? Number(usageLimit) : null,
                expires_at: computedExpiry,
                branch_id: selectedBranchId,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Promo Code *
                </label>
                <button
                  type="button"
                  onClick={() =>
                    generateRandomCode(
                      isFlashModalOpen ? "FLASH" : isPromoModalOpen ? "PROMO" : "TINDI",
                    )
                  }
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" /> Generate
                </button>
              </div>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                placeholder="e.g. FLASH30, EASTER10"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold tracking-widest outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (KES)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  value={value || ""}
                  onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                  placeholder={discountType === "percentage" ? "15" : "500"}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Min Spend (KES)
                </label>
                <input
                  type="number"
                  value={minSpend || ""}
                  onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
                  placeholder="e.g. 2000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Usage Quota (Max uses)
                </label>
                <input
                  type="number"
                  value={usageLimit || ""}
                  onChange={(e) => setUsageLimit(Math.max(0, Number(e.target.value)))}
                  placeholder="0 = Unlimited"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                />
              </div>
            </div>

            {isFlashModalOpen && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Flash Sale Duration (Hours)
                </label>
                <select
                  value={flashHours}
                  onChange={(e) => setFlashHours(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="6">6 Hours Quick Deal</option>
                  <option value="12">12 Hours Deal</option>
                  <option value="24">24 Hours (1-Day Mega Flash)</option>
                  <option value="48">48 Hours Weekend Blitz</option>
                  <option value="72">72 Hours 3-Day Event</option>
                </select>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsNewCouponModalOpen(false);
                  setIsPromoModalOpen(false);
                  setIsFlashModalOpen(false);
                  setIsRuleModalOpen(false);
                }}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createMutation.isPending ? "Saving..." : "Save Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* BULK VOUCHER GENERATOR MODAL */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              Bulk Voucher Batch Generator
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Generate unique, single-use codes in bulk and instantly export to CSV for SMS/Email
              campaigns.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              bulkMutation.mutate({
                prefix: bulkPrefix,
                count: Number(bulkCount),
                discount_type: bulkDiscountType,
                value: Number(bulkValue),
                min_spend: bulkMinSpend ? Number(bulkMinSpend) : null,
                usage_limit: 1,
                branch_id: selectedBranchId,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Code Prefix *
                </label>
                <input
                  required
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value.toUpperCase())}
                  placeholder="e.g. VIP, SMS"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Batch Quantity
                </label>
                <select
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="25">25 Unique Codes</option>
                  <option value="50">50 Unique Codes</option>
                  <option value="100">100 Unique Codes</option>
                  <option value="250">250 Unique Codes</option>
                  <option value="500">500 Unique Codes</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Discount Type
                </label>
                <select
                  value={bulkDiscountType}
                  onChange={(e) => setBulkDiscountType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (KES)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                  Discount Value *
                </label>
                <input
                  type="number"
                  required
                  value={bulkValue}
                  onChange={(e) => setBulkValue(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground block uppercase tracking-wider">
                Min Order Spend (KES)
              </label>
              <input
                type="number"
                value={bulkMinSpend}
                onChange={(e) => setBulkMinSpend(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={bulkMutation.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {bulkMutation.isPending
                  ? "Generating..."
                  : `Generate ${bulkCount} Codes & Download CSV`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   2. MARKETING SECTION (Email, SMS, Push, Social, Referral, Automation)
   ═════════════════════════════════════════════════════════════ */
function MarketingSection({ sub }: { sub: string }) {
  const qc = useQueryClient();
  const { selectedBranchId, selectedBranch, isAllBranches } = useBranch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"email" | "sms" | "social" | "push" | "banner" | "other">(
    sub === "sms" ? "sms" : sub === "push" ? "push" : sub === "social" ? "social" : "email",
  );
  const [budget, setBudget] = useState(0);
  const [audience, setAudience] = useState("all_active");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals for Marketing Channels
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isSmsBroadcastModalOpen, setIsSmsBroadcastModalOpen] = useState(false);
  const [isSocialUtmModalOpen, setIsSocialUtmModalOpen] = useState(false);

  // SMS composer state
  const [smsMessage, setSmsMessage] = useState(
    "Hi {name}, enjoy special discounts at Tindi Holdings today! Use coupon {code} at checkout: https://tindiholdings.co.ke",
  );
  const [smsSender, setSmsSender] = useState("TINDI_HOLD");
  const [smsAudience, setSmsAudience] = useState("all_active");

  // Social UTM state
  const [utmSource, setUtmSource] = useState("instagram");
  const [utmMedium, setUtmMedium] = useState("stories");
  const [utmCampaign, setUtmCampaign] = useState("flash_deals_2026");

  // Email composer state
  const [emailSubject, setEmailSubject] = useState(
    "Exclusive VIP Invitation: Special Deals Await You at Tindi Holdings",
  );
  const [emailPreheader, setEmailPreheader] = useState(
    "Save up to 25% across all store categories this week.",
  );

  const {
    data: campaigns = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "campaigns", selectedBranchId],
    queryFn: () => listCampaigns({ data: { branchId: selectedBranchId } }),
  });

  const { data: automations = [] } = useQuery({
    queryKey: ["admin", "marketing_automations"],
    queryFn: () => listMarketingAutomations(),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createCampaign({ data }),
    onSuccess: () => {
      toast.success("Marketing campaign registered successfully");
      setIsCampaignModalOpen(false);
      setIsSmsBroadcastModalOpen(false);
      setIsSocialUtmModalOpen(false);
      setName("");
      setDescription("");
      setBudget(0);
      qc.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateCampaignStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Campaign status updated");
      qc.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCampaign({ data: { id } }),
    onSuccess: () => {
      toast.success("Campaign deleted");
      qc.invalidateQueries({ queryKey: ["admin", "campaigns"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleDripMut = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) =>
      toggleMarketingAutomation({ data: vars }),
    onSuccess: (res: any) => {
      toast.success(`Automation ${res.is_active ? "activated" : "paused"}`);
      qc.invalidateQueries({ queryKey: ["admin", "marketing_automations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Filter campaigns by sub channel
  const channelFiltered = campaigns.filter((c: any) => {
    if (sub === "email") return c.type === "email";
    if (sub === "sms") return c.type === "sms";
    if (sub === "push") return c.type === "push";
    if (sub === "social") return c.type === "social";
    return true;
  });

  // Calculate SMS stats
  const audienceMap: Record<string, { count: number; label: string }> = {
    all_active: { count: 5200, label: "All Active Kenyan Customers" },
    nairobi: { count: 3100, label: "Nairobi Regional Shoppers" },
    mombasa: { count: 1400, label: "Mombasa & Coastal Shoppers" },
    vip_cohort: { count: 320, label: "VIP Platinum & Gold Cohort" },
    inactive_30d: { count: 850, label: "Inactive Buyers (30+ Days)" },
  };
  const targetAudienceInfo = audienceMap[smsAudience] || audienceMap.all_active;
  const smsSegments = Math.ceil(Math.max(1, smsMessage.length) / 160);
  const estimatedCostKES = targetAudienceInfo.count * smsSegments * 0.8;

  const generatedUtmUrl = `https://tindiholdings.co.ke?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

  return (
    <div className="space-y-5">
      {/* Header with Channel Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              {sub === "sms"
                ? "SMS Gateway Broadcasts (Africa's Talking)"
                : sub === "email"
                  ? "Email Marketing & Customer Newsletters"
                  : sub === "push"
                    ? "Push Notification Feeds (Web & App)"
                    : sub === "social"
                      ? "Social Media Campaigns & UTM Tracking"
                      : sub === "automation"
                        ? "Automated Customer Journey Drips"
                        : "Omnichannel Marketing Registry"}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {isAllBranches ? "Enterprise Hub" : selectedBranch?.name}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sub === "sms"
              ? "Direct bulk SMS messaging with dynamic tags and live KES costing."
              : sub === "email"
                ? "Targeted customer newsletters and responsive preview templates."
                : sub === "push"
                  ? "Instant device notifications with high click-through conversion."
                  : sub === "social"
                    ? "Track conversion analytics across Instagram, TikTok, WhatsApp, and Facebook."
                    : sub === "automation"
                      ? "Set-and-forget customer journey workflows triggered by cart and order events."
                      : "Coordinate cross-channel promotional outreach across Kenya."}
          </p>
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

          {sub === "sms" && (
            <Button
              onClick={() => setIsSmsBroadcastModalOpen(true)}
              className="rounded-xl h-9 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Send className="h-4 w-4 mr-1.5" /> Compose SMS Broadcast
            </Button>
          )}

          {sub === "social" && (
            <Button
              onClick={() => setIsSocialUtmModalOpen(true)}
              className="rounded-xl h-9 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Share2 className="h-4 w-4 mr-1.5" /> Generate UTM Link
            </Button>
          )}

          {sub !== "sms" && sub !== "social" && sub !== "automation" && (
            <Button
              onClick={() => {
                setType(sub === "push" ? "push" : sub === "social" ? "social" : "email");
                setIsCampaignModalOpen(true);
              }}
              className="rounded-xl h-9 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Launch Campaign
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Campaigns",
            value: campaigns.length,
            color: "text-foreground",
            sub: "Omnichannel Register",
          },
          {
            label: "Active Live",
            value: campaigns.filter((c: any) => c.status === "active").length,
            color: "text-emerald-600",
            sub: "Currently Broadcasting",
          },
          {
            label: "Draft Campaigns",
            value: campaigns.filter((c: any) => c.status === "draft").length,
            color: "text-amber-600",
            sub: "Pending Launch",
          },
          {
            label: "Completed",
            value: campaigns.filter((c: any) => c.status === "completed").length,
            color: "text-primary",
            sub: "Concluded Blasts",
          },
        ].map(({ label, value, color, sub: subText }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{subText}</p>
          </div>
        ))}
      </div>

      {/* EMAIL PREVIEW BUILDER */}
      {sub === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
              Compose Email Newsletter
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Subject Line
                </label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">
                  Pre-header Text
                </label>
                <input
                  value={emailPreheader}
                  onChange={(e) => setEmailPreheader(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/20 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Live Desktop Email Preview
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Responsive Template
              </span>
            </div>
            <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3 font-sans">
              <div className="border-b border-border/50 pb-2">
                <div className="text-xs font-black text-foreground">{emailSubject}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{emailPreheader}</div>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/60 text-center space-y-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-black text-xs grid place-items-center mx-auto">
                  T
                </div>
                <div className="text-xs font-black">TINDI HOLDINGS LTD</div>
                <p className="text-[11px] text-muted-foreground">
                  Special subscriber discounts valid across all store locations in Kenya.
                </p>
                <div className="pt-2">
                  <span className="inline-block px-4 py-1.5 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider">
                    Shop Deals Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATION FLOWCHART */}
      {sub === "automation" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">
                Automated Lifecycle Drips
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Self-executing triggers operating continuously across SMS, Email, and Push
                notifications.
              </p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {automations.filter((a: any) => a.is_active).length} Drips Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {automations.map((auto: any) => (
              <div
                key={auto.id}
                className="p-5 rounded-2xl border border-border bg-muted/10 space-y-3 flex flex-col justify-between hover:border-primary/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-foreground">{auto.name}</span>
                    <button
                      onClick={() =>
                        toggleDripMut.mutate({ id: auto.id, is_active: !auto.is_active })
                      }
                      className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg transition-colors border cursor-pointer ${
                        auto.is_active
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-red-500/10 hover:text-red-500"
                          : "bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-600"
                      }`}
                    >
                      {auto.is_active ? "Active" : "Paused"}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {auto.description}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono text-primary font-bold">
                      {auto.trigger_label || auto.trigger}
                    </span>
                    <span className="bg-card px-2 py-0.5 rounded border border-border uppercase font-mono font-bold text-muted-foreground">
                      {auto.channel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-card p-2 rounded-lg border border-border/50">
                    <div>
                      <span className="text-muted-foreground block">Dispatches:</span>
                      <strong className="text-foreground">{auto.dispatches_count || 0}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Revenue (KES):</span>
                      <strong className="text-emerald-600">
                        {Number(auto.attributed_revenue || 0).toLocaleString("en-KE")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOCIAL UTM GENERATOR */}
      {sub === "social" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-border pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider">
              Social Campaign Tracking URL Generator
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Generate distinct tracking links with Google Analytics UTM parameters to monitor
              revenue per channel.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Channel Platform
              </label>
              <select
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="twitter">X / Twitter</option>
                <option value="influencer">Influencer Partner</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                UTM Medium
              </label>
              <input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="e.g. stories, bio_link, reel"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Campaign Name
              </label>
              <input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="e.g. mega_sale_2026"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/20 border border-border flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase text-muted-foreground block">
                Trackable Landing URL:
              </span>
              <span className="font-mono text-xs text-primary font-bold truncate block">
                {generatedUtmUrl}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generatedUtmUrl);
                toast.success("Trackable campaign URL copied to clipboard");
              }}
              className="rounded-xl text-xs font-bold shrink-0"
            >
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy Link
            </Button>
          </div>
        </div>
      )}

      {/* Campaigns Listing */}
      {channelFiltered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No campaigns recorded in this channel</p>
          <p className="text-xs text-muted-foreground mt-1">
            Launch a targeted broadcast to engage your customers.
          </p>
          <Button
            onClick={() => {
              setType(
                sub === "push"
                  ? "push"
                  : sub === "social"
                    ? "social"
                    : sub === "sms"
                      ? "sms"
                      : "email",
              );
              setIsCampaignModalOpen(true);
            }}
            className="mt-4 rounded-xl text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="h-4 w-4 mr-2" /> Launch Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {channelFiltered.map((c: any) => (
            <div
              key={c.id}
              className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                {c.type === "sms" ? (
                  <Smartphone className="h-5 w-5" />
                ) : c.type === "push" ? (
                  <Bell className="h-5 w-5" />
                ) : c.type === "social" ? (
                  <Share2 className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{c.name}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${campaignStatusColor[c.status] ?? "bg-muted"}`}
                  >
                    {c.status}
                  </span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded capitalize font-mono">
                    {c.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-muted-foreground">
                  {c.budget > 0 && (
                    <span>
                      Budget:{" "}
                      <strong className="text-foreground font-mono">
                        KES {Number(c.budget).toLocaleString("en-KE")}
                      </strong>
                    </span>
                  )}
                  {c.target_audience && (
                    <span>
                      Target: <strong>{c.target_audience}</strong>
                    </span>
                  )}
                  {c.start_date && (
                    <span>
                      Schedule: {c.start_date} – {c.end_date || "ongoing"}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.status === "draft" && (
                  <button
                    onClick={() => statusMut.mutate({ id: c.id, status: "active" })}
                    disabled={statusMut.isPending}
                    className="h-8 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-xs font-black flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                  >
                    <Play className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
                {c.status === "active" && (
                  <button
                    onClick={() => statusMut.mutate({ id: c.id, status: "paused" })}
                    disabled={statusMut.isPending}
                    className="h-8 px-3 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white transition-all text-xs font-black flex items-center gap-1 cursor-pointer border border-amber-500/20"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete campaign "${c.name}"?`)) deleteMut.mutate(c.id);
                  }}
                  disabled={deleteMut.isPending}
                  className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all grid place-items-center cursor-pointer"
                  title="Delete Campaign"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GENERAL LAUNCH CAMPAIGN MODAL */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              Initialize Marketing Campaign
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Configure outreach parameters, target audiences, and budget limits.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name) return toast.error("Campaign name is required");
              createMut.mutate({
                name,
                description: description || null,
                type,
                budget: budget || 0,
                target_audience: audience || "All Customers",
                start_date: startDate || null,
                end_date: endDate || null,
                branch_id: selectedBranchId,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Campaign Title *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kenya Jamhuri Day Mega Promo"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Broadcast Channel
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                >
                  <option value="email">Email Newsletter</option>
                  <option value="sms">SMS Gateway</option>
                  <option value="push">Push Notification</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Budget (KES)
                </label>
                <input
                  type="number"
                  value={budget || ""}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  placeholder="e.g. 25000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Target Segment
              </label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Nairobi Shoppers, Repeat Buyers, Inactive 30d"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCampaignModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createMut.isPending ? "Launching..." : "Launch Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SMS BROADCAST MODAL WITH LIVE COSTING */}
      <Dialog open={isSmsBroadcastModalOpen} onOpenChange={setIsSmsBroadcastModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              Compose SMS Broadcast
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Dispatched directly through Africa's Talking Kenyan SMS gateway.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate({
                name: `SMS Blast: ${smsMessage.slice(0, 24)}...`,
                type: "sms",
                description: smsMessage,
                budget: estimatedCostKES,
                target_audience: targetAudienceInfo.label,
                branch_id: selectedBranchId,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Sender ID
                </label>
                <input
                  value={smsSender}
                  onChange={(e) => setSmsSender(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  Target Audience
                </label>
                <select
                  value={smsAudience}
                  onChange={(e) => setSmsAudience(e.target.value)}
                  className="w-full h-10 px-2 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                >
                  <option value="all_active">
                    All Active Shoppers ({audienceMap.all_active.count})
                  </option>
                  <option value="nairobi">Nairobi Regional ({audienceMap.nairobi.count})</option>
                  <option value="mombasa">Mombasa Regional ({audienceMap.mombasa.count})</option>
                  <option value="vip_cohort">
                    VIP Platinum & Gold ({audienceMap.vip_cohort.count})
                  </option>
                  <option value="inactive_30d">
                    Inactive 30+ Days ({audienceMap.inactive_30d.count})
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-muted-foreground uppercase block">
                  SMS Message Body
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${smsMessage.length > 160 ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {smsMessage.length} chars ({smsSegments} SMS segment{smsSegments > 1 ? "s" : ""})
                </span>
              </div>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1.5 text-[11px]">
              <div className="flex justify-between font-bold">
                <span className="text-muted-foreground">Audience Count:</span>
                <span className="text-foreground">
                  {targetAudienceInfo.count.toLocaleString()} recipients
                </span>
              </div>
              <div className="flex justify-between font-black text-primary">
                <span>Estimated Cost (KES 0.80/SMS):</span>
                <span>
                  KES {estimatedCostKES.toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                Variables: <strong>{"{name}"}</strong> = customer name, <strong>{"{code}"}</strong>{" "}
                = promo voucher.
              </p>
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSmsBroadcastModalOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createMut.isPending ? "Sending..." : "Dispatch SMS Broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   3. REFERRALS SECTION (Program, Invites, Reward Disbursement)
   ═════════════════════════════════════════════════════════════ */
function ReferralsSection() {
  const qc = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newReferralCode, setNewReferralCode] = useState("");
  const [newRewardValue, setNewRewardValue] = useState(500);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "referrals"],
    queryFn: () => listReferrals(),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateReferralStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Referral milestone & reward status updated");
      qc.invalidateQueries({ queryKey: ["admin", "referrals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const referrals = data?.referrals ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            Customer Referral & Affiliate Program
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track customer invite codes, conversion milestones, and reward disbursements.
          </p>
        </div>

        <Button
          onClick={() => {
            const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
            setNewReferralCode(`REF-${rand}`);
            setIsInviteModalOpen(true);
          }}
          className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
        >
          <Gift className="h-4 w-4 mr-1.5" /> Issue Referral Code
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Referrals",
            value: data?.total ?? 0,
            color: "text-foreground",
            sub: "Registered Invites",
          },
          {
            label: "Completed Orders",
            value: data?.completed ?? 0,
            color: "text-primary",
            sub: "Successful Purchases",
          },
          {
            label: "Rewards Paid",
            value: data?.rewarded ?? 0,
            color: "text-emerald-600",
            sub: "Disbursed Incentives",
          },
          {
            label: "Pending Verification",
            value: Math.max(0, (data?.total ?? 0) - (data?.completed ?? 0) - (data?.rewarded ?? 0)),
            color: "text-amber-600",
            sub: "Awaiting First Order",
          },
        ].map(({ label, value, color, sub: subText }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
            <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{subText}</p>
          </div>
        ))}
      </div>

      {referrals.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No customer referrals recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Referral entries appear here when registered shoppers share invite codes and new
            customers complete their first purchase.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-muted/20 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Referrer</th>
                  <th className="px-6 py-4">Referred Customer</th>
                  <th className="px-6 py-4">Reward Value</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {referrals.map((r: any) => (
                  <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary text-xs tracking-wider">
                      {r.referral_code}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {(r.referrer as any)?.full_name ?? r.referrer_id?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {(r.referred as any)?.full_name ?? r.referred_id?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-primary">
                      {r.reward_type && r.reward_value > 0
                        ? r.reward_type === "discount"
                          ? `${r.reward_value}% off`
                          : `KES ${Number(r.reward_value).toLocaleString("en-KE")}`
                        : "KES 500 Credit"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${referralStatusColor[r.status] ?? "bg-muted"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">
                      {new Date(r.created_at).toLocaleDateString("en-KE")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "completed" && (
                        <button
                          onClick={() => statusMut.mutate({ id: r.id, status: "rewarded" })}
                          disabled={statusMut.isPending}
                          className="h-7 px-3 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase flex items-center gap-1 ml-auto cursor-pointer border border-emerald-500/20"
                        >
                          <Gift className="h-3 w-3" /> Issue Reward
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE REFERRAL MODAL */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              Issue Referral Code
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Generate a custom affiliate or customer referral invite code.
            </p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Invite Code
              </label>
              <input
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase block">
                Reward Credit (KES)
              </label>
              <input
                type="number"
                value={newRewardValue}
                onChange={(e) => setNewRewardValue(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2">
            <Button
              variant="outline"
              onClick={() => setIsInviteModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(
                  `Referral code ${newReferralCode} generated with KES ${newRewardValue} incentive`,
                );
                setIsInviteModalOpen(false);
              }}
              className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
            >
              Generate Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   4. CORPORATE & PRE-LAUNCH MANAGEMENT SECTION
   ═════════════════════════════════════════════════════════════ */
function CorporateSection({ sub }: { sub: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const adminId = user?.id ?? "admin";
  const adminName = user?.email ?? "Administrator";

  // Subpage states
  const activeTab =
    sub === "subsidiaries"
      ? "subsidiaries"
      : sub === "settings"
        ? "settings"
        : sub === "audit"
          ? "audit"
          : "metrics";

  // Queries
  const { data: metrics = [], isLoading: isMetricsLoading } = useQuery({
    queryKey: ["admin", "corporate-metrics"],
    queryFn: () => getAllMetrics(),
  });

  const { data: companies = [], isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["admin", "corporate-companies"],
    queryFn: () => getAllCompanies(),
  });

  const { data: siteSettings = [], isLoading: isSettingsLoading } = useQuery({
    queryKey: ["admin", "site-settings"],
    queryFn: () => getAllSiteSettings(),
  });

  const { data: auditLogs = [], isLoading: isAuditLoading } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => getAuditLogs(50),
  });

  // Metric edit state
  const [editingMetric, setEditingMetric] = useState<CorporateMetric | null>(null);
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false);

  // New metric modal state
  const [isNewMetricModalOpen, setIsNewMetricModalOpen] = useState(false);
  const [newMetricName, setNewMetricName] = useState("");
  const [newMetricSlug, setNewMetricSlug] = useState("");
  const [newMetricCategory, setNewMetricCategory] = useState("Corporate");
  const [newMetricUnit, setNewMetricUnit] = useState("");
  const [newMetricClassification, setNewMetricClassification] =
    useState<MetricClassification>("TARGET");
  const [newMetricTargetValue, setNewMetricTargetValue] = useState<number | "">("");
  const [newMetricTargetDisplay, setNewMetricTargetDisplay] = useState("");

  // Company status edit state
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Site setting edit state
  const [editingSetting, setEditingSetting] = useState<{ key: string; value: string } | null>(null);

  // Mutations
  const updateMetricMutation = useMutation({
    mutationFn: (params: Parameters<typeof updateMetricFull>[0]) => updateMetricFull(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "corporate-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["corporate-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      toast.success("Corporate metric updated and audit log recorded!");
      setIsMetricModalOpen(false);
      setEditingMetric(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMetricMutation = useMutation({
    mutationFn: (data: Parameters<typeof createMetric>[0]) =>
      createMetric(data, adminId, adminName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "corporate-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["corporate-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      toast.success("New corporate metric created!");
      setIsNewMetricModalOpen(false);
      setNewMetricName("");
      setNewMetricSlug("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (params: Parameters<typeof updateCompanyStatus>[0]) =>
      updateCompanyStatus(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "corporate-companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      toast.success("Subsidiary status updated and logged!");
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      updateSiteSetting(key, value, adminId, adminName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
      toast.success("Site setting updated successfully!");
      setEditingSetting(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <Link
          to="/admin/growth/$category/$sub"
          params={{ category: "corporate", sub: "metrics" }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "metrics"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Corporate Metrics ({metrics.length})
        </Link>
        <Link
          to="/admin/growth/$category/$sub"
          params={{ category: "corporate", sub: "subsidiaries" }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "subsidiaries"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <Building2 className="h-4 w-4" /> Operating Subsidiaries ({companies.length})
        </Link>
        <Link
          to="/admin/growth/$category/$sub"
          params={{ category: "corporate", sub: "settings" }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <Settings className="h-4 w-4" /> Pre-Launch & Site Settings
        </Link>
        <Link
          to="/admin/growth/$category/$sub"
          params={{ category: "corporate", sub: "audit" }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          <ScrollText className="h-4 w-4" /> Audit Trail ({auditLogs.length})
        </Link>
      </div>

      {/* ─── TAB 1: CORPORATE METRICS ─── */}
      {activeTab === "metrics" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-extrabold text-base text-foreground">
                Corporate Metrics & Target Registry
              </h3>
              <p className="text-xs text-muted-foreground">
                Configure verified operational performance metrics vs long-term strategic targets.
              </p>
            </div>
            <Button
              onClick={() => setIsNewMetricModalOpen(true)}
              className="font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" /> Add Metric
            </Button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="p-4">Metric Name</th>
                    <th className="p-4">Current Value</th>
                    <th className="p-4">Strategic Target</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4">Visibility</th>
                    <th className="p-4">Featured</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {metrics.map((metric) => (
                    <tr key={metric.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{metric.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {metric.slug} • {metric.category}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-sm text-foreground">
                          {metric.current_display || (metric.current_value !== null ? String(metric.current_value) : "Pre-launch")}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          {metric.target_display || (metric.target_value !== null ? String(metric.target_value) : "—")}
                        </span>
                        {metric.target_date && (
                          <div className="text-[10px] text-muted-foreground">
                            Target Date: {metric.target_date}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <MetricBadge classification={metric.classification} size="sm" />
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            metric.visibility === "PUBLIC"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          }`}
                        >
                          {metric.visibility}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            metric.is_featured
                              ? "bg-primary/10 text-primary font-bold"
                              : "text-muted-foreground"
                          }`}
                        >
                          {metric.is_featured ? "★ Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMetric(metric);
                            setIsMetricModalOpen(true);
                          }}
                          className="text-xs font-bold"
                        >
                          Edit & Verify
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SUBSIDIARIES ─── */}
      {activeTab === "subsidiaries" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Operating Subsidiaries Registry
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage pre-launch operational readiness, status notes, launch dates, and divisional leadership for all 4 operating units.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black text-foreground">{company.name}</h4>
                      <span className="text-xs text-amber-500 font-bold uppercase tracking-wider block mt-0.5">
                        {company.industry}
                      </span>
                    </div>
                    <EntityStatusBadge status={company.status} size="md" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {company.description}
                  </p>
                  {company.status_note && (
                    <div className="mt-3 p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-800 dark:text-sky-300 font-medium">
                      📌 <strong>Operational Note:</strong> {company.status_note}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Email: <span className="font-mono text-foreground">{company.contact_email || "N/A"}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCompany(company);
                      setIsCompanyModalOpen(true);
                    }}
                    className="text-xs font-bold"
                  >
                    Manage Readiness
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: SITE SETTINGS ─── */}
      {activeTab === "settings" && (
        <div className="space-y-4 max-w-3xl">
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Global Pre-Launch & Site Configuration
            </h3>
            <p className="text-xs text-muted-foreground">
              Configure system-wide parameters, launch timelines, and governance flags.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
                <div>
                  <div className="font-bold text-sm text-foreground">Pre-Launch Mode</div>
                  <div className="text-xs text-muted-foreground">
                    When active, public statistics display honest pre-launch indicators and strategic targets.
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentVal = siteSettings.find((s) => s.key === "prelaunch_mode")?.value;
                    const nextVal = currentVal === "true" ? "false" : "true";
                    updateSettingMutation.mutate({ key: "prelaunch_mode", value: nextVal });
                  }}
                  className="font-bold text-xs"
                >
                  {siteSettings.find((s) => s.key === "prelaunch_mode")?.value === "true"
                    ? "Status: ACTIVE"
                    : "Status: OFF"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
                <div>
                  <div className="font-bold text-sm text-foreground">Store & Commerce Status</div>
                  <div className="text-xs text-muted-foreground">
                    Public store accessibility status mode.
                  </div>
                </div>
                <select
                  value={siteSettings.find((s) => s.key === "store_status")?.value ?? "PRE_LAUNCH"}
                  onChange={(e) => {
                    updateSettingMutation.mutate({ key: "store_status", value: e.target.value });
                  }}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-foreground"
                >
                  <option value="PRE_LAUNCH">PRE_LAUNCH</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="IN_DEVELOPMENT">IN_DEVELOPMENT</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
                <div>
                  <div className="font-bold text-sm text-foreground">Expected Launch Quarter</div>
                  <div className="text-xs text-muted-foreground">
                    Target timeline displayed on investor decks and corporate summaries.
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={siteSettings.find((s) => s.key === "launch_quarter")?.value ?? "Q4 2026"}
                    onBlur={(e) => {
                      updateSettingMutation.mutate({ key: "launch_quarter", value: e.target.value });
                    }}
                    className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-foreground w-28 text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
                <div>
                  <div className="font-bold text-sm text-foreground">Official Corporate Entity Name</div>
                  <div className="text-xs text-muted-foreground">
                    Authoritative legal name used in footer and formal documentation.
                  </div>
                </div>
                <input
                  type="text"
                  defaultValue={siteSettings.find((s) => s.key === "company_name")?.value ?? "Tindi Holdings Ltd"}
                  onBlur={(e) => {
                    updateSettingMutation.mutate({ key: "company_name", value: e.target.value });
                  }}
                  className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-bold text-foreground w-48"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: AUDIT TRAIL ─── */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-foreground">
              Corporate Governance Audit Trail
            </h3>
            <p className="text-xs text-muted-foreground">
              Immutable log of changes to corporate metrics, subsidiary readiness states, and system settings.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Entity</th>
                    <th className="p-4">Performed By</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No audit events logged yet. Actions taken in this panel will be automatically recorded here.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-primary">{log.action}</span>
                        </td>
                        <td className="p-4 text-foreground">
                          {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ""}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {log.performed_by_name || "Admin"}
                        </td>
                        <td className="p-4 text-muted-foreground max-w-xs truncate">
                          {log.new_data ? JSON.stringify(log.new_data) : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: EDIT METRIC ─── */}
      <Dialog open={isMetricModalOpen} onOpenChange={setIsMetricModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Corporate Metric: {editingMetric?.name}</DialogTitle>
          </DialogHeader>
          {editingMetric && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const currentVal = fd.get("current_value") ? Number(fd.get("current_value")) : null;
                const currentDisp = (fd.get("current_display") as string) || null;
                const targetVal = fd.get("target_value") ? Number(fd.get("target_value")) : null;
                const targetDisp = (fd.get("target_display") as string) || null;
                const classification = fd.get("classification") as MetricClassification;
                const visibility = fd.get("visibility") as MetricVisibility;
                const isFeatured = fd.get("is_featured") === "on";
                const changeNote = (fd.get("change_note") as string) || "Updated via admin panel";

                updateMetricMutation.mutate({
                  metricId: editingMetric.id,
                  current_value: currentVal,
                  current_display: currentDisp,
                  target_value: targetVal,
                  target_display: targetDisp,
                  classification,
                  visibility,
                  is_featured: isFeatured,
                  changeNote,
                  adminId,
                  adminName,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Current Numeric Value</label>
                  <input
                    name="current_value"
                    type="number"
                    defaultValue={editingMetric.current_value ?? ""}
                    placeholder="e.g. 4"
                    className="w-full p-2.5 bg-background border border-border rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Current Display Text</label>
                  <input
                    name="current_display"
                    type="text"
                    defaultValue={editingMetric.current_display ?? ""}
                    placeholder="e.g. 4 (Kenya)"
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Strategic Target Value</label>
                  <input
                    name="target_value"
                    type="number"
                    defaultValue={editingMetric.target_value ?? ""}
                    placeholder="e.g. 10"
                    className="w-full p-2.5 bg-background border border-border rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Target Display Text</label>
                  <input
                    name="target_display"
                    type="text"
                    defaultValue={editingMetric.target_display ?? ""}
                    placeholder="e.g. 10+ by 2031"
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Classification</label>
                  <select
                    name="classification"
                    defaultValue={editingMetric.classification}
                    className="w-full p-2.5 bg-background border border-border rounded-xl font-bold text-xs"
                  >
                    <option value="VERIFIED">VERIFIED (Actual)</option>
                    <option value="TARGET">TARGET (Goal)</option>
                    <option value="PROJECTED">PROJECTED (Forecast)</option>
                    <option value="ESTIMATED">ESTIMATED (Calculated)</option>
                    <option value="INTERNAL">INTERNAL (Admin Only)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-muted-foreground block mb-1">Visibility</label>
                  <select
                    name="visibility"
                    defaultValue={editingMetric.visibility}
                    className="w-full p-2.5 bg-background border border-border rounded-xl font-bold text-xs"
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="ADMIN_ONLY">ADMIN_ONLY</option>
                    <option value="HIDDEN">HIDDEN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  name="is_featured"
                  id="is_featured_cb"
                  defaultChecked={editingMetric.is_featured}
                  className="rounded border-border"
                />
                <label htmlFor="is_featured_cb" className="font-bold text-foreground">
                  Feature in homepage statistics strip
                </label>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Audit Verification Note</label>
                <input
                  name="change_note"
                  type="text"
                  placeholder="Reason for metric adjustment / audit reference"
                  required
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsMetricModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMetricMutation.isPending}>
                  {updateMetricMutation.isPending ? "Saving..." : "Save & Verify"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: EDIT SUBSIDIARY ─── */}
      <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Readiness: {editingCompany?.name}</DialogTitle>
          </DialogHeader>
          {editingCompany && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const status = fd.get("status") as EntityStatus;
                const statusNote = (fd.get("status_note") as string) || "";

                updateCompanyMutation.mutate({
                  companyId: editingCompany.id,
                  status,
                  statusNote,
                  adminId,
                  adminName,
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Operational Status</label>
                <select
                  name="status"
                  defaultValue={editingCompany.status}
                  className="w-full p-2.5 bg-background border border-border rounded-xl font-bold text-xs"
                >
                  <option value="PRE_LAUNCH">PRE_LAUNCH (In Preparation)</option>
                  <option value="IN_DEVELOPMENT">IN_DEVELOPMENT (R&D Stage)</option>
                  <option value="PILOT">PILOT (Testing Phase)</option>
                  <option value="ACTIVE">ACTIVE (Fully Launched)</option>
                  <option value="PLANNED">PLANNED (Future Rollout)</option>
                  <option value="FUTURE">FUTURE (Long-term Venture)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-muted-foreground block mb-1">Operational Status Note</label>
                <textarea
                  name="status_note"
                  defaultValue={editingCompany.status_note ?? ""}
                  placeholder="e.g. Platform & system engineering in pre-launch stage. Formal launch Q4 2026."
                  rows={3}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCompanyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateCompanyMutation.isPending}>
                  {updateCompanyMutation.isPending ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL: CREATE METRIC ─── */}
      <Dialog open={isNewMetricModalOpen} onOpenChange={setIsNewMetricModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Corporate Metric</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMetricMutation.mutate({
                name: newMetricName,
                slug: newMetricSlug || newMetricName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                category: newMetricCategory,
                unit: newMetricUnit || null,
                classification: newMetricClassification,
                target_value: newMetricTargetValue === "" ? null : Number(newMetricTargetValue),
                target_display: newMetricTargetDisplay || null,
                visibility: "PUBLIC",
                is_featured: false,
              });
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="font-bold text-muted-foreground block mb-1">Metric Title</label>
              <input
                type="text"
                value={newMetricName}
                onChange={(e) => {
                  setNewMetricName(e.target.value);
                  if (!newMetricSlug) {
                    setNewMetricSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }
                }}
                placeholder="e.g. Annual Fleet Mileage"
                required
                className="w-full p-2.5 bg-background border border-border rounded-xl text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Unique Slug</label>
                <input
                  type="text"
                  value={newMetricSlug}
                  onChange={(e) => setNewMetricSlug(e.target.value)}
                  placeholder="annual-fleet-mileage"
                  required
                  className="w-full p-2.5 bg-background border border-border rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Category</label>
                <input
                  type="text"
                  value={newMetricCategory}
                  onChange={(e) => setNewMetricCategory(e.target.value)}
                  placeholder="Logistics"
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Target Value</label>
                <input
                  type="number"
                  value={newMetricTargetValue}
                  onChange={(e) =>
                    setNewMetricTargetValue(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="500000"
                  className="w-full p-2.5 bg-background border border-border rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Target Display</label>
                <input
                  type="text"
                  value={newMetricTargetDisplay}
                  onChange={(e) => setNewMetricTargetDisplay(e.target.value)}
                  placeholder="500,000+ Kms"
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-muted-foreground block mb-1">Classification</label>
              <select
                value={newMetricClassification}
                onChange={(e) => setNewMetricClassification(e.target.value as MetricClassification)}
                className="w-full p-2.5 bg-background border border-border rounded-xl font-bold text-xs"
              >
                <option value="TARGET">TARGET (Strategic Goal)</option>
                <option value="VERIFIED">VERIFIED (Audited Real-world)</option>
                <option value="PROJECTED">PROJECTED (Forecast)</option>
                <option value="ESTIMATED">ESTIMATED (Calculated)</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewMetricModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMetricMutation.isPending}>
                {createMetricMutation.isPending ? "Creating..." : "Create Metric"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN GROWTH & CORPORATE PAGE CONTROLLER
   ═════════════════════════════════════════════════════════════ */
function GrowthPage() {
  const { category, sub } = Route.useParams();
  const subTitle = sub
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const isCoupons = category === "coupons";
  const isMarketing = category === "marketing";
  const isReferrals = category === "referrals" || sub === "referral";
  const isCorporate = category === "corporate";

  return (
    <AdminShell title={isCorporate ? `Corporate: ${subTitle}` : `Growth: ${subTitle}`}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${
              isCorporate
                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                : isCoupons
                  ? "bg-primary/10 text-primary"
                  : isReferrals
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-purple-500/10 text-purple-600"
            }`}
          >
            {isCorporate ? (
              <Building2 className="h-6 w-6" />
            ) : isCoupons ? (
              <Percent className="h-6 w-6" />
            ) : isReferrals ? (
              <Users className="h-6 w-6" />
            ) : (
              <Megaphone className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">
              {isCorporate ? "Tindi Holdings Ltd Central Governance" : "Enterprise Growth Suite"}
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              {isCorporate
                ? "Corporate Pre-Launch & Metrics Management"
                : isCoupons
                  ? "Voucher & Discount Promotion Engine"
                  : isReferrals
                    ? "Customer Referral & Affiliate Network"
                    : "Omnichannel Marketing Campaigns"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isCorporate
                ? "Authoritative control panel for corporate metrics, subsidiary pre-launch readiness, global site settings, and governance audit trails."
                : isCoupons
                  ? "Manage promotional coupon codes, quotas, scheduled flash deals, automated cart discount rules, and bulk batch generation."
                  : isReferrals
                    ? "Track customer invite codes, conversion milestones, and automated reward disbursements."
                    : "Coordinate SMS broadcasts (Africa's Talking), Email newsletters, Social UTM tracking, and Automated Drip Workflows across Kenya."}
            </p>
          </div>
        </div>

        {/* Content Router */}
        {isCorporate && <CorporateSection sub={sub} />}
        {isCoupons && <CouponsSection sub={sub} />}
        {isMarketing && !isReferrals && <MarketingSection sub={sub} />}
        {isReferrals && <ReferralsSection />}
      </div>
    </AdminShell>
  );
}
