import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Rocket, Plus, Trash2, Percent, CircleDollarSign, Megaphone,
  Target, Zap, Users, RefreshCw, Gift, ArrowRight, Play, Pause,
  Mail, MessageSquare, Bell, Share2, Sparkles, Filter, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listCoupons, createCoupon, deleteCoupon,
  listCampaigns, createCampaign, updateCampaignStatus, deleteCampaign,
  listReferrals, updateReferralStatus,
} from "@/lib/admin.functions";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/growth/$category/$sub")({
  component: GrowthPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

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

/* ─────────────── COUPONS SECTION ───────────────────────── */
function CouponsSection({ sub }: { sub: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minSpend, setMinSpend] = useState(0);
  const [search, setSearch] = useState("");

  const { data: coupons = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => listCoupons(),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCoupon({
        data: {
          code,
          discount_type: discountType,
          value: Number(value),
          min_spend: minSpend ? Number(minSpend) : undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Coupon created successfully");
      setCode("");
      setValue(0);
      setMinSpend(0);
      navigate({ to: "/admin/growth/coupons/all" as any });
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

  if (sub === "new") {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 max-w-xl shadow-sm">
        <h3 className="font-black uppercase tracking-wider text-sm mb-4">Generate Discount Voucher</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!code || value <= 0) return toast.error("Provide a valid code and value");
            createMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Coupon Promo Code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
              placeholder="e.g. TINDI2026"
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
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
                <option value="fixed">Fixed Amount (KES)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Value</label>
              <input
                type="number"
                required
                value={value || ""}
                onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                placeholder="e.g. 15"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Minimum Order Threshold (Optional)</label>
            <input
              type="number"
              value={minSpend || ""}
              onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 3000 (in KES)"
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2 justify-end border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/growth/coupons/all" as any })}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-xl bg-primary text-primary-foreground font-black px-6 uppercase text-xs tracking-wider"
            >
              {createMutation.isPending ? "Creating…" : "Save Coupon"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {sub === "flash" ? "Flash Sale Discounts" : sub === "promo" ? "Promotional Codes" : sub === "rules" ? "Discount Rule Engine" : "Active Coupon Inventory"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Automated discount validation at checkout.</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/admin/growth/coupons/new" as any })}
          className="rounded-xl h-9 px-4 bg-primary shadow-sm font-black uppercase text-xs tracking-wider"
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Coupon
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <div className="text-2xl font-black">{coupons.length}</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">Total Codes</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <div className="text-2xl font-black text-success">{coupons.filter((c) => c.is_active).length}</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">Active Vouchers</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
          <div className="text-2xl font-black text-muted-foreground">{coupons.filter((c) => !c.is_active).length}</div>
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">Expired / Inactive</div>
        </div>
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
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" /> Loading vouchers...
                  </td>
                </tr>
              )}
              {!isLoading && filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                    No active discount coupons found. Create your first voucher above.
                  </td>
                </tr>
              )}
              {filteredCoupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-mono font-black text-primary text-xs tracking-wider">{c.code}</td>
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
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete coupon "${c.code}"?`)) deleteMutation.mutate(c.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 inline-grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all cursor-pointer"
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
  );
}

/* ─────────────── MARKETING & CAMPAIGNS ─────────────────── */
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

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: () => listCampaigns(),
  });

  const createMut = useMutation({
    mutationFn: () =>
      createCampaign({
        data: {
          name,
          description: description || undefined,
          type,
          budget: budget || undefined,
          target_audience: audience || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Campaign created");
      navigate({ to: `/admin/growth/marketing/${sub === "new" ? "email" : sub}` as any });
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

  if (sub === "new") {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 max-w-xl shadow-sm">
        <h3 className="font-black uppercase tracking-wider text-sm mb-4">Initialize Marketing Campaign</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name) return toast.error("Campaign name required");
            createMut.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Campaign Title *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kenya Jamhuri Day Mega Offer"
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Brief Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Campaign objective and customer target..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-sm outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Broadcast Channel</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold outline-none"
              >
                {["email", "sms", "social", "push", "banner", "other"].map((t) => (
                  <option key={t} value={t} className="capitalize">{t.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Budget (KES)</label>
              <input
                type="number"
                value={budget || ""}
                onChange={(e) => setBudget(Number(e.target.value))}
                placeholder="e.g. 50000"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Target Segment</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. VIP Shoppers, Nairobi residents, etc."
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2 justify-end border-t border-border mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/admin/growth/marketing/email" as any })}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMut.isPending}
              className="rounded-xl bg-primary text-primary-foreground font-black px-6 uppercase text-xs tracking-wider"
            >
              {createMut.isPending ? "Creating…" : "Launch Campaign"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Filter campaigns by sub channel if specific channel selected
  const channelFiltered = campaigns.filter((c) => {
    if (sub === "email") return c.type === "email";
    if (sub === "sms") return c.type === "sms";
    if (sub === "push") return c.type === "push";
    if (sub === "social") return c.type === "social";
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
            {sub === "sms" ? "SMS Gateway Campaigns (Africa's Talking)" : sub === "email" ? "Email Marketing Broadcasts" : sub === "push" ? "Push Notification Feeds" : sub === "social" ? "Social Media Campaigns" : "Omnichannel Campaign Registry"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Automated outreach and ROI performance telemetry.</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/admin/growth/marketing/new" as any })}
          className="rounded-xl h-9 px-4 bg-primary shadow-sm font-black uppercase text-xs tracking-wider"
        >
          <Plus className="h-4 w-4 mr-1.5" /> New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: campaigns.length, color: "" },
          { label: "Active", value: campaigns.filter((c) => c.status === "active").length, color: "text-success" },
          { label: "Draft", value: campaigns.filter((c) => c.status === "draft").length, color: "text-muted-foreground" },
          { label: "Completed", value: campaigns.filter((c) => c.status === "completed").length, color: "text-primary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {channelFiltered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No campaigns in this channel</p>
          <p className="text-xs text-muted-foreground mt-1">Launch a targeted broadcast to engage your customers.</p>
          <Button onClick={() => navigate({ to: "/admin/growth/marketing/new" as any })} className="mt-4 rounded-xl text-xs font-bold uppercase tracking-wider">
            <Plus className="h-4 w-4 mr-2" /> Launch Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {channelFiltered.map((c: any) => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <Megaphone className="h-5 w-5" />
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
                  {c.start_date && <span>Duration: {c.start_date} – {c.end_date || "ongoing"}</span>}
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
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── REFERRALS SECTION ─────────────────────── */
function ReferralsSection() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "referrals"],
    queryFn: () => listReferrals(),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: string }) => updateReferralStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Referral updated");
      qc.invalidateQueries({ queryKey: ["admin", "referrals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader />;
  const referrals = data?.referrals ?? [];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals", value: data?.total ?? 0, color: "" },
          { label: "Completed", value: data?.completed ?? 0, color: "text-primary" },
          { label: "Rewarded", value: data?.rewarded ?? 0, color: "text-success" },
          { label: "Pending", value: (data?.total ?? 0) - (data?.completed ?? 0) - (data?.rewarded ?? 0), color: "text-warning" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 text-center shadow-sm">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {referrals.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-bold text-sm">No referrals logged yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Referral entries will appear here when customers share invite codes and new users sign up.
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
    </div>
  );
}

/* ─────────────── MAIN GROWTH PAGE ROUTER ───────────────── */
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
          <div className={`h-12 w-12 rounded-2xl grid place-items-center ${
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
                ? "Manage promotional coupon codes, flash sales, and discount rules."
                : isReferrals
                ? "Track customer invite codes, conversion milestones, and reward disbursements."
                : "Coordinate SMS, Email, Social, and Push broadcasts across Kenya."}
            </p>
          </div>
        </div>

        {/* Content Tabs */}
        {isCoupons && <CouponsSection sub={sub} />}
        {isMarketing && !isReferrals && <MarketingSection sub={sub} />}
        {isReferrals && <ReferralsSection />}
      </div>
    </AdminShell>
  );
}
