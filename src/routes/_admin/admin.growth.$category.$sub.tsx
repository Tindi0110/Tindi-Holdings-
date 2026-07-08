import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { Sparkles, Megaphone, Target, Zap, Rocket, Plus, Trash2, Ticket, Percent, CircleDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listCoupons, createCoupon, deleteCoupon } from "@/lib/admin.functions";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/growth/$category/$sub")({
  component: GrowthPage,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function GrowthPage() {
  const { category, sub } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Coupon form states
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState(0);
  const [minSpend, setMinSpend] = useState(0);

  // Queries
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => listCoupons(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => createCoupon({
      data: {
        code,
        discount_type: discountType,
        value: Number(value),
        min_spend: minSpend ? Number(minSpend) : undefined,
      }
    }),
    onSuccess: () => {
      toast.success("Coupon code provisioned successfully");
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
      toast.success("Coupon removed from database");
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || value <= 0) return toast.error("Please provide a valid code and value");
    createMutation.mutate();
  };

  const isCoupons = category === "coupons";
  const catTitle = category.charAt(0).toUpperCase() + category.slice(1);
  const subTitle = sub.replace(/-/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <AdminShell title={`Velocity: ${subTitle}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header telemetry banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden bg-card border border-border p-8 rounded-3xl shadow-xl shadow-black/5"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Rocket className="h-48 w-48 -mr-6 -mt-6 -rotate-12" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                Strategic Expansion
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-none mb-3">
              Accelerate {subTitle} Sub-Sector Velocity
            </h2>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed opacity-70">
              Manage promotional codes and campaign signals that directly integrate with the checkout flow.
            </p>
            {isCoupons && sub !== "new" && (
              <div className="mt-6">
                <Button
                  onClick={() => navigate({ to: "/admin/growth/coupons/new" as any })}
                  className="rounded-xl h-10 px-5 bg-primary shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Coupon
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Coupons Management Section ── */}
        {isCoupons && (
          <motion.div variants={itemVariants} className="space-y-6">
            {sub === "all" && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">Coupons Database Registry</h3>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Min Spend</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {isLoading && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                            Querying coupons table...
                          </td>
                        </tr>
                      )}
                      {!isLoading && coupons.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                            No coupons found in the database.
                          </td>
                        </tr>
                      )}
                      {coupons.map((c) => (
                        <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-primary text-xs tracking-wider">{c.code}</td>
                          <td className="px-6 py-4 font-bold text-foreground">
                            {c.discount_type === "percentage" ? `${c.value}%` : `KES ${Number(c.value).toLocaleString()}`}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                            {c.min_spend ? `KES ${Number(c.min_spend).toLocaleString()}` : "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${c.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                              {c.is_active ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => { if (confirm(`Remove coupon code "${c.code}"?`)) deleteMutation.mutate(c.id); }}
                              disabled={deleteMutation.isPending}
                              className="h-8 w-8 inline-grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"
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
            )}

            {sub === "new" && (
              <div className="bg-card border border-border rounded-2xl p-6 max-w-xl shadow-xl shadow-black/5">
                <h3 className="font-black uppercase tracking-wider text-sm mb-4">Provision Promotion Code</h3>
                <form onSubmit={handleCreateCoupon} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Coupon Code</label>
                    <input
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                      placeholder="e.g. WELCOME20"
                      className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-mono tracking-widest focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (KES)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Value</label>
                      <input
                        type="number"
                        required
                        value={value}
                        onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">Minimum Spend (Optional)</label>
                    <input
                      type="number"
                      value={minSpend || ""}
                      onChange={(e) => setMinSpend(Math.max(0, Number(e.target.value)))}
                      className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-2 justify-end border-t border-border mt-6">
                    <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/growth/coupons/all" as any })} className="rounded-xl">Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending} className="rounded-xl bg-primary text-primary-foreground font-black px-6">Provision Coupon</Button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Fallback/Audit stats for non-coupon growth campaigns ── */}
        {!isCoupons && (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricBox title="Active Codes" value={String(coupons.length)} sub="Active Campaigns" icon={Megaphone} color="primary" />
              <MetricBox title="Discount Cap" value={coupons.length > 0 ? `KES ${Math.max(...coupons.map(c => c.value)).toLocaleString()}` : "KES 0"} sub="Highest Coupon Value" icon={Percent} color="conversion" />
              <MetricBox title="Growth Strategy" value="DB Active" sub="Coupon Telemetry Connected" icon={Zap} color="warning" />
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-black/5">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-2">Campaign Performance</h3>
              <h4 className="text-lg font-black tracking-tight mb-6">Omnichannel Marketing Telemetry</h4>
              <div className="p-6 bg-muted/10 border border-border rounded-2xl text-center space-y-4">
                <CircleDollarSign className="h-8 w-8 text-primary mx-auto" />
                <div>
                  <h5 className="font-bold text-sm">Marketing Automation Active</h5>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Coupons and promotions database tables are fully provisioned. Check the Coupons sub-menu to create, manage, and assign checkout discount codes.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AdminShell>
  );
}

interface MetricBoxProps {
  title: string;
  value: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "conversion" | "warning";
}

function MetricBox({ title, value, sub, icon: Icon, color }: MetricBoxProps) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    conversion: "bg-conversion/10 text-conversion",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all text-left"
    >
      <div className={`h-11 w-11 rounded-xl grid place-items-center mb-4 ${colors[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-[9px] font-black uppercase tracking-wider text-muted-foreground opacity-60">{title}</div>
      <div className="text-2xl font-black mt-1 tracking-tight">{value}</div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
        <div className="text-[9px] font-black uppercase tracking-wider text-success">{sub}</div>
      </div>
    </motion.div>
  );
}
