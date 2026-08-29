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
   MAIN GROWTH PAGE CONTROLLER
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

  return (
    <AdminShell title={`Growth: ${subTitle}`}>
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div
            className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${
              isCoupons
                ? "bg-primary/10 text-primary"
                : isReferrals
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-purple-500/10 text-purple-600"
            }`}
          >
            {isCoupons ? (
              <Percent className="h-6 w-6" />
            ) : isReferrals ? (
              <Users className="h-6 w-6" />
            ) : (
              <Megaphone className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-primary">
              Enterprise Growth Suite
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
              {isCoupons
                ? "Voucher & Discount Promotion Engine"
                : isReferrals
                  ? "Customer Referral & Affiliate Network"
                  : "Omnichannel Marketing Campaigns"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isCoupons
                ? "Manage promotional coupon codes, quotas, scheduled flash deals, automated cart discount rules, and bulk batch generation."
                : isReferrals
                  ? "Track customer invite codes, conversion milestones, and automated reward disbursements."
                  : "Coordinate SMS broadcasts (Africa's Talking), Email newsletters, Social UTM tracking, and Automated Drip Workflows across Kenya."}
            </p>
          </div>
        </div>

        {/* Content Router */}
        {isCoupons && <CouponsSection sub={sub} />}
        {isMarketing && !isReferrals && <MarketingSection sub={sub} />}
        {isReferrals && <ReferralsSection />}
      </div>
    </AdminShell>
  );
}
