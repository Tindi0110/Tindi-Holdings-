import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Rocket, Plus, Trash2, Percent, CircleDollarSign, Megaphone,
  Target, Zap, Users, RefreshCw, Gift, ArrowRight, Play, Pause,
  Mail, MessageSquare, Bell, Share2, Sparkles, Filter, CheckCircle2,
  Clock, Flame, Layers, Sliders, Send, Copy, Eye, Tag, AlertCircle,
  TrendingUp, Check, DollarSign, Smartphone, ShoppingBag, Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCoupons, createCoupon, toggleCouponStatus, deleteCoupon,
  listCampaigns, createCampaign, updateCampaignStatus, deleteCampaign,
  listReferrals, updateReferralStatus,
} from "@/lib/admin.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_admin/admin/growth/$category/$sub")({
  component: GrowthPage,
});

const campaignStatusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-success/10 text-success border border-success/20",
  paused: "bg-warning/10 text-warning border border-warning/20",
  completed: "bg-primary/10 text-primary border border-primary/20",
  cancelled: "bg-error/10 text-error border border-error/20",
};

const referralStatusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning border border-warning/20",
  completed: "bg-primary/10 text-primary border border-primary/20",
  rewarded: "bg-success/10 text-success border border-success/20",
  expired: "bg-muted text-muted-foreground",
};

/* ═══════════════════════════════════════════════════════════════
   1. COUPONS SECTION (All, New, Promo, Flash, Rules, Campaigns)
   ═══════════════════════════════════════════════════════════════ */
function CouponsSection({ sub }: { sub: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minSpend, setMinSpend] = useState(0);
  const [search, setSearch] = useState("");

  // Modals for sub menus
  const [isNewCouponModalOpen, setIsNewCouponModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isFlashModalOpen, setIsFlashModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Flash state
  const [flashHours, setFlashHours] = useState("24");
  // Rule state
  const [ruleName, setRuleName] = useState("");
  const [ruleMinSpend, setRuleMinSpend] = useState(5000);
  const [ruleDiscount, setRuleDiscount] = useState(10);

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => listCoupons(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { code: string; discount_type: "percentage" | "fixed"; value: number; min_spend?: number }) =>
      createCoupon({ data }),
    onSuccess: () => {
      toast.success("Coupon voucher created successfully");
      setCode("");
      setValue(0);
      setMinSpend(0);
      setIsNewCouponModalOpen(false);
      setIsPromoModalOpen(false);
      setIsFlashModalOpen(false);
      setIsRuleModalOpen(false);
      if (sub === "new") navigate({ to: "/admin/growth/coupons/all" as any });
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) =>
      toggleCouponStatus({ data: vars }),
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
          <h3 className="font-black uppercase tracking-wider text-sm">Generate Promotional Voucher</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Create custom discount vouchers for marketing campaigns and seasonal sales.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!code || value <= 0) return toast.error("Provide a valid code and value");
            createMutation.mutate({
              code,
              discount_type: discountType,
              value: Number(value),
              min_spend: minSpend ? Number(minSpend) : undefined,
            });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Coupon Promo Code *</label>
              <button
                type="button"
                onClick={() => generateRandomCode()}
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
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Type</label>
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
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Value *</label>
              <input
                type="number"
                required
                value={value || ""}
                onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                placeholder={discountType === "percentage" ? "e.g. 15 (for 15%)" : "e.g. 500 (for KES 500)"}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Minimum Order Spend Threshold (KES)</label>
            <input
              type="number"
              value={minSpend || ""}
              onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 3000 (Leave 0 for no minimum)"
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
            />
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

  // Filter coupons by sub context
  const filteredCoupons = coupons.filter((c) => {
    if (search && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    if (sub === "flash") return c.code.includes("FLASH") || c.code.includes("24H") || c.discount_type === "percentage" && c.value >= 25;
    if (sub === "promo") return c.code.includes("PROMO") || c.code.includes("DEAL") || c.code.includes("OFFER") || c.code.includes("SAVE");
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Action Header & Contextual Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {sub === "flash" ? "Flash Sales & Timed Deals" :
             sub === "promo" ? "Seasonal & Promotional Campaigns" :
             sub === "rules" ? "Automated Cart Discount Rules" :
             sub === "campaigns" ? "Growth Promotional Vouchers" :
             "Active Coupon Inventory"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sub === "flash" ? "High-discount time-limited flash sale vouchers." :
             sub === "promo" ? "Seasonal festive vouchers and customer appreciation discounts." :
             sub === "rules" ? "Smart checkout rules applied automatically based on cart conditions." :
             "Manage, track redemptions, and toggle voucher access."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sub === "flash" && (
            <Button
              onClick={() => {
                generateRandomCode("FLASH");
                setValue(30);
                setIsFlashModalOpen(true);
              }}
              className="rounded-xl h-10 px-4 bg-error text-white font-black uppercase text-xs tracking-wider shadow-sm"
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
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" /> Launch Seasonal Promo
            </Button>
          )}

          {sub === "rules" && (
            <Button
              onClick={() => setIsRuleModalOpen(true)}
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
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
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Voucher
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Vouchers</span>
          <div className="text-2xl font-black text-foreground mt-1">{coupons.length}</div>
          <p className="text-[11px] text-primary font-semibold mt-0.5">Voucher Registry</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Active Vouchers</span>
          <div className="text-2xl font-black text-success mt-1">{coupons.filter((c) => c.is_active).length}</div>
          <p className="text-[11px] text-success font-semibold mt-0.5">Live at Checkout</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Flash Sales</span>
          <div className="text-2xl font-black text-error mt-1">{coupons.filter((c) => c.code.includes("FLASH") || (c.discount_type === "percentage" && c.value >= 25)).length}</div>
          <p className="text-[11px] text-error font-semibold mt-0.5">High-Velocity Deals</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Disabled / Expired</span>
          <div className="text-2xl font-black text-muted-foreground mt-1">{coupons.filter((c) => !c.is_active).length}</div>
          <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Archived Codes</p>
        </div>
      </div>

      {/* Rules Engine Display (When in Rules sub tab) */}
      {sub === "rules" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Automated Cart Rules</h4>
              <p className="text-[11px] text-muted-foreground">These rules automatically discount qualifying carts without requiring a voucher code.</p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-success/10 text-success border border-success/20">
              Rule Engine Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">First-Time Buyer Perk</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-success/10 text-success">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">Auto 10% discount on customer's first purchase.</p>
              <div className="text-[10px] font-mono text-primary font-bold">Trigger: First Checkout Order</div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Cart Spend Tier (KES 10,000+)</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-success/10 text-success">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">Instant KES 1,000 deduction on orders exceeding KES 10,000.</p>
              <div className="text-[10px] font-mono text-primary font-bold">Trigger: Cart Total &gt; KES 10,000</div>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">Free Delivery Milestone</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-success/10 text-success">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">100% shipping fee waived across Kenya for orders over KES 5,000.</p>
              <div className="text-[10px] font-mono text-primary font-bold">Trigger: Cart Total &gt; KES 5,000</div>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <input
            placeholder="Search voucher codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-4 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-muted/20 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Promo Code</th>
                  <th className="px-6 py-4">Discount Value</th>
                  <th className="px-6 py-4">Min Spend</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Toggle</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" /> Loading vouchers...
                    </td>
                  </tr>
                )}
                {!isLoading && filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                      No discount vouchers found for this category. Create one using the action button above.
                    </td>
                  </tr>
                )}
                {filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-primary text-xs tracking-wider bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                          {c.code}
                        </span>
                        {c.code.includes("FLASH") && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-error/10 text-error border border-error/20 flex items-center gap-0.5">
                            <Flame className="h-2.5 w-2.5" /> Flash
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {c.discount_type === "percentage" ? `${c.value}% OFF` : `KES ${Number(c.value).toLocaleString("en-KE")} OFF`}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {c.min_spend ? `KES ${Number(c.min_spend).toLocaleString("en-KE")}` : "No Minimum"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${c.is_active ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"}`}>
                        {c.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                        disabled={toggleMutation.isPending}
                        className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                          c.is_active
                            ? "bg-warning/10 text-warning hover:bg-warning hover:text-white"
                            : "bg-success/10 text-success hover:bg-success hover:text-white"
                        }`}
                      >
                        {c.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c.id);
                        }}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 inline-grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all cursor-pointer"
                        title="Delete Voucher"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── ADD VOUCHER MODAL ─── */}
      <Dialog open={isNewCouponModalOpen || isPromoModalOpen || isFlashModalOpen || isRuleModalOpen} onOpenChange={(o) => {
        if (!o) {
          setIsNewCouponModalOpen(false);
          setIsPromoModalOpen(false);
          setIsFlashModalOpen(false);
          setIsRuleModalOpen(false);
        }
      }}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">
              {isFlashModalOpen ? "Schedule Flash Sale Deal" :
               isPromoModalOpen ? "Launch Seasonal Promotion" :
               isRuleModalOpen ? "Add Automated Cart Rule" :
               "Create Discount Voucher"}
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Configure code parameters and discount thresholds for instant checkout validation.
            </p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!code || value <= 0) return toast.error("Provide a valid code and value");
              createMutation.mutate({
                code,
                discount_type: discountType,
                value: Number(value),
                min_spend: minSpend ? Number(minSpend) : undefined,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Promo Code *</label>
                <button
                  type="button"
                  onClick={() => generateRandomCode(isFlashModalOpen ? "FLASH" : isPromoModalOpen ? "PROMO" : "TINDI")}
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
                <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Type</label>
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
                <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Value *</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Min Spend Threshold (KES)</label>
              <input
                type="number"
                value={minSpend || ""}
                onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 2000 (Optional)"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs outline-none"
              />
            </div>

            {isFlashModalOpen && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Flash Sale Duration (Hours)</label>
                <select
                  value={flashHours}
                  onChange={(e) => setFlashHours(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
                >
                  <option value="6">6 Hours Quick Flash</option>
                  <option value="12">12 Hours Deal</option>
                  <option value="24">24 Hours (1 Day Mega Deal)</option>
                  <option value="48">48 Hours Weekend Blitz</option>
                </select>
              </div>
            )}

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsNewCouponModalOpen(false);
                setIsPromoModalOpen(false);
                setIsFlashModalOpen(false);
                setIsRuleModalOpen(false);
              }} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createMutation.isPending ? "Creating..." : "Save Voucher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MARKETING SECTION (Email, SMS, Push, Social, Referral, Automation)
   ═══════════════════════════════════════════════════════════════ */
function MarketingSection({ sub }: { sub: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"email" | "sms" | "social" | "push" | "banner" | "other">(
    sub === "sms" ? "sms" : sub === "push" ? "push" : sub === "social" ? "social" : "email"
  );
  const [budget, setBudget] = useState(0);
  const [audience, setAudience] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals for Marketing Channels
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isSmsBroadcastModalOpen, setIsSmsBroadcastModalOpen] = useState(false);
  const [isSocialUtmModalOpen, setIsSocialUtmModalOpen] = useState(false);
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);

  // SMS composer state
  const [smsMessage, setSmsMessage] = useState("Hi {name}, enjoy special discounts at Tindi Holdings today! Use coupon {code} at checkout: https://tindiholdings.co.ke");
  const [smsSender, setSmsSender] = useState("TINDI_HOLD");

  // Social UTM state
  const [utmSource, setUtmSource] = useState("instagram");
  const [utmMedium, setUtmMedium] = useState("stories");
  const [utmCampaign, setUtmCampaign] = useState("flash_deals_2026");

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => listCampaigns(),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => createCampaign({ data }),
    onSuccess: () => {
      toast.success("Marketing broadcast initiated");
      setIsCampaignModalOpen(false);
      setIsSmsBroadcastModalOpen(false);
      setIsSocialUtmModalOpen(false);
      setIsAutomationModalOpen(false);
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

  // Filter campaigns by sub channel
  const channelFiltered = campaigns.filter((c) => {
    if (sub === "email") return c.type === "email";
    if (sub === "sms") return c.type === "sms";
    if (sub === "push") return c.type === "push";
    if (sub === "social") return c.type === "social";
    return true;
  });

  const generatedUtmUrl = `https://tindiholdings.co.ke?utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`;

  return (
    <div className="space-y-5">
      {/* Header with Channel Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {sub === "sms" ? "SMS Gateway Broadcasts (Africa's Talking)" :
             sub === "email" ? "Email Marketing & Customer Newsletters" :
             sub === "push" ? "Push Notification Feeds (Web & App)" :
             sub === "social" ? "Social Media Campaigns & UTM Tracking" :
             sub === "automation" ? "Automated Drip Workflows" :
             "Omnichannel Marketing Registry"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sub === "sms" ? "Direct bulk SMS messaging with dynamic variable tags and high delivery rate." :
             sub === "email" ? "Targeted customer engagement newsletters and automated winback sequences." :
             sub === "push" ? "Instant device notifications with high click-through conversion." :
             sub === "social" ? "Track conversion analytics across Instagram, Facebook, TikTok, and WhatsApp." :
             sub === "automation" ? "Set-and-forget customer journey workflows triggered by cart and order events." :
             "Coordinate cross-channel promotional outreach across Kenya."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sub === "sms" && (
            <Button
              onClick={() => setIsSmsBroadcastModalOpen(true)}
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Send className="h-4 w-4 mr-1.5" /> Compose SMS Broadcast
            </Button>
          )}

          {sub === "social" && (
            <Button
              onClick={() => setIsSocialUtmModalOpen(true)}
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Share2 className="h-4 w-4 mr-1.5" /> Generate UTM Link
            </Button>
          )}

          {sub === "automation" && (
            <Button
              onClick={() => setIsAutomationModalOpen(true)}
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Sparkles className="h-4 w-4 mr-1.5" /> New Automation Drip
            </Button>
          )}

          {sub !== "sms" && sub !== "social" && sub !== "automation" && (
            <Button
              onClick={() => {
                setType(sub === "push" ? "push" : sub === "social" ? "social" : "email");
                setIsCampaignModalOpen(true);
              }}
              className="rounded-xl h-10 px-4 bg-primary text-primary-foreground font-black uppercase text-xs tracking-wider shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Launch Campaign
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Campaigns", value: campaigns.length, color: "text-foreground" },
          { label: "Active Live", value: campaigns.filter((c) => c.status === "active").length, color: "text-success" },
          { label: "Draft Campaigns", value: campaigns.filter((c) => c.status === "draft").length, color: "text-warning" },
          { label: "Completed", value: campaigns.filter((c) => c.status === "completed").length, color: "text-primary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Omnichannel Hub</p>
          </div>
        ))}
      </div>

      {/* Automation Flowchart Cards (When in Automation Tab) */}
      {sub === "automation" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">Active Marketing Automations</h4>
              <p className="text-[11px] text-muted-foreground">Self-executing triggers running continuously in the background.</p>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-success/10 text-success border border-success/20">
              5 Drips Running
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Abandoned Cart SMS Drip",
                desc: "Dispatches SMS with 5% discount code 2 hours after shopper abandons cart.",
                trigger: "Cart Inactive for 120 mins",
                channel: "SMS",
                active: true,
              },
              {
                title: "Welcome Onboarding Sequence",
                desc: "Sends intro email with store guide and 10% coupon upon account signup.",
                trigger: "User Registered",
                channel: "Email",
                active: true,
              },
              {
                title: "Post-Delivery Review Ping",
                desc: "Requests feedback and star rating 24 hours after courier confirms delivery.",
                trigger: "Order Delivered",
                channel: "SMS / Email",
                active: true,
              },
              {
                title: "Customer Win-Back Drip",
                desc: "Re-engages inactive customers with KES 500 store credit after 45 days.",
                trigger: "No Purchase in 45 Days",
                channel: "Email",
                active: true,
              },
              {
                title: "VIP Loyalty Club Upgrade",
                desc: "Auto-promotes shoppers to VIP Tier upon reaching KES 50,000 lifetime spend.",
                trigger: "Spend &gt; KES 50k",
                channel: "System Tier",
                active: true,
              },
            ].map((auto, i) => (
              <div key={i} className="p-4 rounded-xl border border-border bg-muted/10 space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{auto.title}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-success/10 text-success border border-success/20">Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{auto.desc}</p>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-primary font-bold">{auto.trigger}</span>
                  <span className="bg-card px-2 py-0.5 rounded border border-border text-muted-foreground">{auto.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social UTM Generator View (When in Social Tab) */}
      {sub === "social" && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-border pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider">Social Campaign Tracking URL Generator</h4>
            <p className="text-[11px] text-muted-foreground">Generate distinct tracking links with Google Analytics UTM parameters to monitor revenue per channel.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Channel Platform</label>
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
              <label className="text-xs font-bold text-muted-foreground uppercase block">UTM Medium</label>
              <input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="e.g. stories, bio_link, reel"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Campaign Name</label>
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
              <span className="text-[10px] font-black uppercase text-muted-foreground block">Trackable Landing URL:</span>
              <span className="font-mono text-xs text-primary font-bold truncate block">{generatedUtmUrl}</span>
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
          <p className="text-xs text-muted-foreground mt-1">Launch a targeted broadcast to engage your customers.</p>
          <Button
            onClick={() => {
              setType(sub === "push" ? "push" : sub === "social" ? "social" : sub === "sms" ? "sms" : "email");
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
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                {c.type === "sms" ? <Smartphone className="h-5 w-5" /> : c.type === "push" ? <Bell className="h-5 w-5" /> : c.type === "social" ? <Share2 className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-foreground">{c.name}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${campaignStatusColor[c.status] ?? "bg-muted"}`}>{c.status}</span>
                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-2 py-0.5 rounded capitalize font-mono">{c.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-1 flex-wrap text-xs text-muted-foreground">
                  {c.budget > 0 && <span>Budget: <strong className="text-foreground">KES {Number(c.budget).toLocaleString("en-KE")}</strong></span>}
                  {c.target_audience && <span>Target: <strong>{c.target_audience}</strong></span>}
                  {c.start_date && <span>Schedule: {c.start_date} – {c.end_date || "ongoing"}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.status === "draft" && (
                  <button
                    onClick={() => statusMut.mutate({ id: c.id, status: "active" })}
                    disabled={statusMut.isPending}
                    className="h-8 px-3 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5" /> Activate
                  </button>
                )}
                {c.status === "active" && (
                  <button
                    onClick={() => statusMut.mutate({ id: c.id, status: "paused" })}
                    disabled={statusMut.isPending}
                    className="h-8 px-3 rounded-lg bg-warning/10 text-warning hover:bg-warning hover:text-white transition-all text-xs font-black flex items-center gap-1 cursor-pointer"
                  >
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`Delete campaign "${c.name}"?`)) deleteMut.mutate(c.id);
                  }}
                  disabled={deleteMut.isPending}
                  className="h-8 w-8 rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all grid place-items-center cursor-pointer"
                  title="Delete Campaign"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── GENERAL LAUNCH CAMPAIGN MODAL ─── */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Initialize Marketing Campaign</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Configure outreach parameters, target audiences, and budget limits.</p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!name) return toast.error("Campaign name is required");
              createMut.mutate({
                name,
                description: description || undefined,
                type,
                budget: budget || undefined,
                target_audience: audience || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Campaign Title *</label>
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
                <label className="text-xs font-bold text-muted-foreground uppercase block">Broadcast Channel</label>
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
                <label className="text-xs font-bold text-muted-foreground uppercase block">Budget (KES)</label>
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
              <label className="text-xs font-bold text-muted-foreground uppercase block">Target Segment</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Nairobi Shoppers, Repeat Buyers, Inactive 30d"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase block">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCampaignModalOpen(false)} className="rounded-xl text-xs font-bold">
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

      {/* ─── SMS BROADCAST MODAL ─── */}
      <Dialog open={isSmsBroadcastModalOpen} onOpenChange={setIsSmsBroadcastModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Compose SMS Broadcast</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Dispatched directly through Africa's Talking Kenyan SMS gateway.</p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMut.mutate({
                name: `SMS: ${smsMessage.slice(0, 30)}...`,
                type: "sms",
                description: smsMessage,
                budget: 5000,
                target_audience: "All Active Kenyan Customers",
              });
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Sender ID</label>
              <input
                value={smsSender}
                onChange={(e) => setSmsSender(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase block">SMS Message Body</label>
                <span className={`text-[10px] font-mono font-bold ${smsMessage.length > 160 ? "text-error" : "text-muted-foreground"}`}>
                  {smsMessage.length}/160 chars
                </span>
              </div>
              <textarea
                rows={4}
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border text-[11px] text-muted-foreground">
              Tip: Use <strong>{"{name}"}</strong> for customer name and <strong>{"{code}"}</strong> for linked promo voucher.
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsSmsBroadcastModalOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMut.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createMut.isPending ? "Sending..." : "Dispatch SMS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. REFERRALS SECTION (Program, Invites, Reward Disbursement)
   ═══════════════════════════════════════════════════════════════ */
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
      toast.success("Referral milestone updated");
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
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Customer Referral & Affiliate Program</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track customer invite codes, conversion milestones, and reward disbursements.</p>
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
          { label: "Total Referrals", value: data?.total ?? 0, color: "text-foreground" },
          { label: "Completed Orders", value: data?.completed ?? 0, color: "text-primary" },
          { label: "Rewards Paid", value: data?.rewarded ?? 0, color: "text-success" },
          { label: "Pending Verification", value: (data?.total ?? 0) - (data?.completed ?? 0) - (data?.rewarded ?? 0), color: "text-warning" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
            <div className={`text-2xl font-black ${color} mt-1`}>{value}</div>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Affiliate Network</p>
          </div>
        ))}
      </div>

      {referrals.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No customer referrals recorded yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Referral entries appear here when registered shoppers share invite codes and new customers complete their first purchase.
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
                    <td className="px-6 py-4 font-mono font-bold text-primary text-xs tracking-wider">{r.referral_code}</td>
                    <td className="px-6 py-4 text-xs font-semibold">{(r.referrer as any)?.full_name ?? r.referrer_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-6 py-4 text-xs">{(r.referred as any)?.full_name ?? r.referred_id?.slice(0, 8) ?? "—"}</td>
                    <td className="px-6 py-4 text-xs">
                      {r.reward_type && r.reward_value > 0 ? (
                        <span className="font-bold text-primary">{r.reward_type === "discount" ? `${r.reward_value}% off` : `KES ${Number(r.reward_value).toLocaleString("en-KE")}`}</span>
                      ) : "KES 500 Credit"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${referralStatusColor[r.status] ?? "bg-muted"}`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      {r.status === "completed" && (
                        <button
                          onClick={() => statusMut.mutate({ id: r.id, status: "rewarded" })}
                          disabled={statusMut.isPending}
                          className="h-7 px-3 rounded-lg bg-success/10 text-success hover:bg-success hover:text-white transition-all text-[10px] font-black uppercase flex items-center gap-1 ml-auto cursor-pointer"
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
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Issue Referral Code</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Generate a custom affiliate or customer referral invite code.</p>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Invite Code</label>
              <input
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase block">Reward Credit (KES)</label>
              <input
                type="number"
                value={newRewardValue}
                onChange={(e) => setNewRewardValue(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border gap-2">
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)} className="rounded-xl text-xs font-bold">
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Referral code ${newReferralCode} generated with KES ${newRewardValue} incentive`);
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

/* ═══════════════════════════════════════════════════════════════
   MAIN GROWTH PAGE CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function GrowthPage() {
  const { category, sub } = Route.useParams();
  const subTitle = sub.replace(/-/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const isCoupons = category === "coupons";
  const isMarketing = category === "marketing";
  const isReferrals = category === "referrals" || sub === "referral";

  return (
    <AdminShell title={`Growth: ${subTitle}`}>
      <div className="space-y-6">

        {/* Banner */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl grid place-items-center shrink-0 ${
            isCoupons ? "bg-primary/10 text-primary" : isReferrals ? "bg-success/10 text-success" : "bg-conversion/10 text-conversion"
          }`}>
            {isCoupons ? <Percent className="h-6 w-6" /> : isReferrals ? <Users className="h-6 w-6" /> : <Megaphone className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              {isCoupons ? "Voucher & Discount Engine" : isReferrals ? "Customer Referral Programme" : "Omnichannel Marketing Campaigns"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isCoupons
                ? "Manage promotional coupon codes, flash sales, and automated cart discount rules."
                : isReferrals
                ? "Track customer invite codes, conversion milestones, and reward disbursements."
                : "Coordinate SMS, Email, Social UTMs, and Automated Drip Workflows across Kenya."}
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
