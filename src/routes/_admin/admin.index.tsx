import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getDashboardMetrics, listAdminOrders } from "@/lib/admin.functions";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [{ title: "Admin — Tindi Holdings Limited" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminDashboard,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

import { useState, useEffect } from "react";

function AdminDashboard() {
  const [greeting, setGreeting] = useState("Good day, Administrator");

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning, Administrator");
    else if (hours < 17) setGreeting("Good afternoon, Administrator");
    else setGreeting("Good evening, Administrator");
  }, []);

  const { data: metricsData } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });
  const { data: orders } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
  });

  const metrics = [
    {
      label: "Total Revenue",
      value: `KES ${(metricsData?.totalRevenue ?? 0).toLocaleString("en-KE")}`,
      icon: DollarSign,
      gradient: "from-primary to-primary/80",
      bg: "from-primary/5 to-primary/10",
      text: "text-primary",
      trend: "+14.2%",
      up: true,
    },
    {
      label: "Total Orders",
      value: String(metricsData?.ordersCount ?? 0),
      icon: ShoppingCart,
      gradient: "from-success to-success/80",
      bg: "from-success/5 to-success/10",
      text: "text-success",
      trend: "+8.4%",
      up: true,
    },
    {
      label: "Customers",
      value: String(metricsData?.customersCount ?? 0),
      icon: Users,
      gradient: "from-primary to-primary/80",
      bg: "from-primary/5 to-primary/10",
      text: "text-primary",
      trend: "+22.1%",
      up: true,
    },
    {
      label: "Active SKUs",
      value: String(metricsData?.productsCount ?? 0),
      icon: Package,
      gradient: "from-conversion to-conversion/80",
      bg: "from-conversion/5 to-conversion/10",
      text: "text-conversion",
      trend: "+2.5%",
      up: true,
    },
    {
      label: "Pending Orders",
      value: String(metricsData?.pendingCount ?? 0),
      icon: Clock,
      gradient: "from-warning to-warning/80",
      bg: "from-warning/5 to-warning/10",
      text: "text-warning",
      trend: "-5.0%",
      up: false,
    },
    {
      label: "Low Stock Items",
      value: String(metricsData?.lowStockCount ?? 0),
      icon: AlertTriangle,
      gradient: "from-error to-error/80",
      bg: "from-error/5 to-error/10",
      text: "text-error",
      trend: "Critical",
      up: false,
    },
  ];

  return (
    <AdminShell title="Dashboard">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Welcome banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-lg"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-[11px] font-black tracking-[0.2em] uppercase opacity-80">
                   Innovation • Synergy • Scale
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{greeting}</h2>
              <p className="text-sm text-white/80 mt-1">Tindi Holdings Administrative Portal — All operational nodes synced and active</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">Live</span>
            </div>
          </div>
        </motion.div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map((mt) => (
            <motion.div
              key={mt.label}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.01 }}
              className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-200 relative overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-30 bg-gradient-to-br ${mt.bg}`} />
              <div className="relative">
                <div className="flex justify-between items-start mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mt.gradient} grid place-items-center shadow-sm`}>
                    <mt.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 text-right">
                    {mt.up ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : mt.trend.startsWith("-") ? (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    ) : null}
                    <span className={`text-[10px] font-black ${mt.up ? "text-emerald-500" : mt.trend.startsWith("-") ? "text-rose-500" : "text-rose-600"}`}>
                      {mt.trend}
                    </span>
                  </div>
                </div>
                <div className={`text-2xl font-black tracking-tight ${mt.text}`}>{mt.value}</div>
                <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  {mt.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main content grid */}
        <div className="grid xl:grid-cols-12 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-6">
            {/* Sales chart */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Revenue Trend</p>
                  <h3 className="text-xl font-black mt-0.5 tracking-tight">Sales Overview</h3>
                </div>
                <div className="flex gap-1.5">
                  {["1D", "7D", "30D"].map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                        t === "7D"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metricsData?.salesSeries ?? []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="d"
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                      fontWeight="700"
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      dx={-6}
                      fontWeight="700"
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "10px 14px",
                      }}
                      itemStyle={{ color: "var(--color-primary)" }}
                      labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      fill="url(#colorRev)"
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Orders table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Live Channel</p>
                  <h3 className="text-lg font-black mt-0.5 tracking-tight">Recent Orders</h3>
                </div>
                <Link
                  to="/admin/orders"
                  className="h-9 px-4 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5 hover:bg-primary hover:text-white transition-all"
                >
                  View All <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Order #", "Customer", "Date", "Amount", "Status"].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                    <tbody className="divide-y divide-border">
                    {(orders ?? []).slice(0, 7).map((o) => (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-3.5 font-bold text-primary">#{o.order_number}</td>
                        <td className="px-6 py-3.5 font-medium text-foreground">{o.shipping_name ?? "—"}</td>
                        <td className="px-6 py-3.5 text-muted-foreground text-xs">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5 font-bold">KES {Number(o.total).toLocaleString("en-KE")}</td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(orders ?? []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-6">
            {/* Low stock panel */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-error/10 grid place-items-center">
                  <Activity className="h-4 w-4 text-error" />
                </div>
                <div>
                  <p className="text-xs font-bold text-error uppercase tracking-widest">Inventory Risk</p>
                  <h4 className="text-base font-black tracking-tight">Depletion Alerts</h4>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(metricsData?.lowStock ?? []).length === 0 ? (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <div className="h-12 w-12 rounded-full bg-success/10 grid place-items-center">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">All stock healthy</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No low-stock warnings.</p>
                    </div>
                  </div>
                ) : (
                  (metricsData?.lowStock ?? []).map((p) => (
                    <div className="flex items-center justify-between p-3 bg-error/5 rounded-xl border border-error/10">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-error/10 grid place-items-center text-error font-black text-xs">
                          !
                        </div>
                        <span className="font-semibold text-xs text-foreground truncate max-w-[130px]">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-error font-black text-xs">{p.stock} left</span>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full h-10 mt-4 rounded-xl bg-muted border border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-section transition-colors">
                Generate Restock Log
              </button>
            </div>

            {/* System health card */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white blur-2xl" />
              </div>
              <div className="relative">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  System Status
                </span>
                <h4 className="text-xl font-black mt-1 tracking-tight">All Systems Go</h4>
                <p className="text-sm text-white/90 mt-2 leading-relaxed">
                  All Tindi Holdings Limited nodes are synced and operating at peak performance.
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    { label: "Database", value: "99.99%" },
                    { label: "API Gateway", value: "99.98%" },
                    { label: "CDN", value: "100%" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-white/90">{item.label}</span>
                        <span className="font-black">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.value }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-white rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/admin/analytics/performance" as any
                  className="mt-5 flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors border border-white/20"
                >
                  View Infrastructure <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Products", to: "/admin/products", icon: Package },
                  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
                  { label: "Customers", to: "/admin/customers/all", icon: Users },
                  { label: "Analytics", to: "/admin/analytics/sales", icon: TrendingUp },
                ].map((link) => (
                  <Link
                    key={link.label}
                    to={link.to as never}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted hover:bg-primary/5 hover:text-primary text-muted-foreground transition-all text-center"
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-[11px] font-bold">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AdminShell>
  );
}
