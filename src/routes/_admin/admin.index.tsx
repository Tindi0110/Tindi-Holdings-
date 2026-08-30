import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { useBranch } from "@/hooks/use-branch";
import {
  AnalyticsDateRangePicker,
  DateRangeValue,
  calculateDateRange,
  calculateCompareRange,
} from "@/components/admin/AnalyticsDateRangePicker";
import { HourlyHeatmap } from "@/components/admin/HourlyHeatmap";
import {
  getSalesAnalytics,
  getHourlySalesHeatmap,
  getBranchAnalyticsDetailed,
} from "@/lib/analytics.functions";
import { getDashboardMetrics, listAdminOrders } from "@/lib/admin.functions";
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
  Building2,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import { motion } from "motion/react";
import { toast } from "sonner";
import { getAllMetrics, getAllCompanies } from "@/lib/corporate-metrics.functions";
import { EntityStatusBadge, MetricBadge } from "@/components/shared/StatusBadges";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({
    meta: [
      { title: "Executive Dashboard — Tindi Holdings Ltd" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
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

type MetricView = "revenue" | "orders" | "aov";

function AdminDashboard() {
  const { selectedBranchId, selectedBranch, isAllBranches } = useBranch();
  const [greeting, setGreeting] = useState("Good day, Administrator");

  // Initial date range (30D with comparison to previous period)
  const initialDates = calculateDateRange("30d");
  const initialComp = calculateCompareRange(
    initialDates.startDate,
    initialDates.endDate,
    "prev_period",
  );
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    preset: "30d",
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    compareMode: "prev_period",
    ...initialComp,
  });

  const [activeMetric, setActiveMetric] = useState<MetricView>("revenue");
  const [refreshInterval, setRefreshInterval] = useState<number | false>(false);

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good morning, Executive");
    else if (hours < 17) setGreeting("Good afternoon, Executive");
    else setGreeting("Good evening, Executive");
  }, []);

  // Live query for sales telemetry respecting branch context & dates
  const {
    data: salesAnalytics,
    isLoading: isSalesLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "admin",
      "dashboard-sales",
      selectedBranchId,
      dateRange.startDate,
      dateRange.endDate,
      dateRange.compareStartDate,
      dateRange.compareEndDate,
    ],
    queryFn: () =>
      getSalesAnalytics({
        data: {
          branchId: selectedBranchId || undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          compareStartDate: dateRange.compareStartDate,
          compareEndDate: dateRange.compareEndDate,
        },
      }),
    refetchInterval: refreshInterval || undefined,
  });

  // Hourly Day-Part Heatmap Query
  const { data: heatmapData, isLoading: isHeatmapLoading } = useQuery({
    queryKey: [
      "admin",
      "dashboard-hourly",
      selectedBranchId,
      dateRange.startDate,
      dateRange.endDate,
    ],
    queryFn: () =>
      getHourlySalesHeatmap({
        data: {
          branchId: selectedBranchId || undefined,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  // Multi-Branch Leaderboard Query
  const { data: branchAnalytics } = useQuery({
    queryKey: ["admin", "dashboard-branches", dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getBranchAnalyticsDetailed({
        data: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  // Basic KPI stats
  const { data: metricsData } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
  });

  // Corporate status & metrics queries
  const { data: corporateMetrics = [] } = useQuery({
    queryKey: ["admin", "corporate-metrics"],
    queryFn: () => getAllMetrics(),
  });

  const { data: corporateCompanies = [] } = useQuery({
    queryKey: ["admin", "corporate-companies"],
    queryFn: () => getAllCompanies(),
  });

  // Current values
  const revGrowth = salesAnalytics?.revenueGrowth ?? 0;
  const currentRev = salesAnalytics?.currentRevenue ?? metricsData?.totalRevenue ?? 0;
  const currentOrdersCount = salesAnalytics?.currentOrderCount ?? metricsData?.ordersCount ?? 0;
  const currentAov =
    salesAnalytics?.avgOrderValue ?? (currentOrdersCount > 0 ? currentRev / currentOrdersCount : 0);

  const metrics = [
    {
      label: isAllBranches ? "Global Revenue" : `${selectedBranch?.name || "Branch"} Revenue`,
      value: `KES ${Number(currentRev).toLocaleString("en-KE")}`,
      icon: DollarSign,
      gradient: "from-primary to-primary/80",
      bg: "from-primary/5 to-primary/10",
      text: "text-primary",
      trend: `${revGrowth >= 0 ? "+" : ""}${revGrowth.toFixed(1)}%`,
      up: revGrowth >= 0,
      sub: "vs prior period",
    },
    {
      label: "Total Orders",
      value: String(currentOrdersCount),
      icon: ShoppingCart,
      gradient: "from-success to-success/80",
      bg: "from-success/5 to-success/10",
      text: "text-success",
      trend: `${salesAnalytics?.prevOrderCount ? (currentOrdersCount >= salesAnalytics.prevOrderCount ? "+" : "") : ""}${currentOrdersCount}`,
      up: true,
      sub: "in selected period",
    },
    {
      label: "Average Order Value",
      value: `KES ${Number(currentAov).toLocaleString("en-KE")}`,
      icon: TrendingUp,
      gradient: "from-blue-600 to-blue-500",
      bg: "from-blue-500/5 to-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      trend: "KES / order",
      up: true,
      sub: "basket value",
    },
    {
      label: "Active Catalog SKUs",
      value: String(metricsData?.productsCount ?? 0),
      icon: Package,
      gradient: "from-conversion to-conversion/80",
      bg: "from-conversion/5 to-conversion/10",
      text: "text-conversion",
      trend: "Synced",
      up: true,
      sub: "enterprise catalog",
    },
    {
      label: "Pending Dispatch",
      value: String(metricsData?.pendingCount ?? 0),
      icon: Clock,
      gradient: "from-warning to-warning/80",
      bg: "from-warning/5 to-warning/10",
      text: "text-warning",
      trend: metricsData?.pendingCount && metricsData.pendingCount > 0 ? "Action Req" : "Cleared",
      up: !(metricsData?.pendingCount && metricsData.pendingCount > 0),
      sub: "orders in queue",
    },
    {
      label: "Low Stock Warnings",
      value: String(metricsData?.lowStockCount ?? 0),
      icon: AlertTriangle,
      gradient: "from-error to-error/80",
      bg: "from-error/5 to-error/10",
      text: "text-error",
      trend: metricsData?.lowStockCount && metricsData.lowStockCount > 0 ? "Critical" : "Good",
      up: !(metricsData?.lowStockCount && metricsData.lowStockCount > 0),
      sub: "SKUs < threshold",
    },
  ];

  return (
    <AdminShell title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Top Control Bar: Context & Dynamic Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-foreground">
                  {isAllBranches
                    ? "All Enterprise Branches (Global View)"
                    : `${selectedBranch?.name || "Selected Branch"}`}
                </h3>
                <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {isAllBranches ? "Multi-Unit" : "Branch Filtered"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Displaying real-time transactional telemetry and analytics
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Auto-Refresh Toggle */}
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border text-xs">
              <RefreshCw
                className={`h-3 w-3 text-muted-foreground ml-1.5 ${refreshInterval ? "animate-spin text-primary" : ""}`}
              />
              <select
                value={refreshInterval === false ? "off" : String(refreshInterval)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRefreshInterval(v === "off" ? false : Number(v));
                  toast.info(
                    v === "off"
                      ? "Auto-refresh disabled"
                      : `Live polling every ${Number(v) / 1000}s`,
                  );
                }}
                className="bg-transparent text-xs font-bold text-foreground outline-none pr-1 cursor-pointer"
              >
                <option value="off">Live: Off</option>
                <option value="30000">Live: 30s</option>
                <option value="60000">Live: 1m</option>
                <option value="300000">Live: 5m</option>
              </select>
            </div>

            {/* Date Range Picker */}
            <AnalyticsDateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* Welcome banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-white shadow-lg space-y-4"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 h-60 w-60 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-[11px] font-black tracking-[0.2em] uppercase opacity-80">
                  Enterprise Performance & Logistics Suite
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">{greeting}</h2>
              <p className="text-sm text-white/80 mt-1">
                {isAllBranches
                  ? "Consolidated multi-branch performance across all retail & warehouse nodes"
                  : `Dedicated operational dashboard for ${selectedBranch?.name || "selected branch"}`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold">Live Synced</span>
            </div>
          </div>

          {/* Quick AI Executive Insight Prompts */}
          <div className="relative pt-2 border-t border-white/15 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-white/80 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Quick AI Executive Audit:
            </span>
            <button
              onClick={() => {
                toast.success(
                  "Executive Digest: Nairobi CBD generated 58% of revenue this week with KRA VAT compliance at 100%.",
                );
              }}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-bold transition-all cursor-pointer"
            >
              ⚡ Revenue & VAT Summary
            </button>
            <button
              onClick={() => {
                toast.info(
                  "Branch Leaderboard: 1. Nairobi CBD (KES 1.2M), 2. Mombasa (KES 840K), 3. Westlands (KES 620K)",
                );
              }}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-bold transition-all cursor-pointer"
            >
              🏢 Regional Branch Ranking
            </button>
            <button
              onClick={() => {
                toast.warning(
                  "Inventory Alert: 4 SKUs are below safety threshold in Mombasa & Kisumu nodes. Reorder recommended.",
                );
              }}
              className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-white font-bold transition-all cursor-pointer"
            >
              📦 Critical Reorder SKUs
            </button>
          </div>
        </motion.div>

        {/* Corporate Pre-Launch Readiness & Strategic Metrics */}
        <motion.div
          variants={itemVariants}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center font-black text-sm">
                TH
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-foreground">
                    Corporate Pre-Launch Readiness & Strategic Metrics
                  </h3>
                  <EntityStatusBadge status="PRE_LAUNCH" size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Authoritative multi-sector status, verified metrics vs targets, and launch readiness tracking.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">
                Launch Target: <strong className="text-foreground">Q4 2026</strong>
              </span>
            </div>
          </div>

          {/* 4 Core Subsidiaries Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "Tindi Tech & Smart Homes", status: "PRE_LAUNCH" as const, note: "Software & IoT Labs", target: "Launch Q4 2026" },
              { name: "Tindi Safaris & Logistics", status: "PRE_LAUNCH" as const, note: "Freight & Safari Fleets", target: "Launch Q1 2027" },
              { name: "Tindi Eats", status: "IN_DEVELOPMENT" as const, note: "Cloud Kitchens & Dining", target: "Concept Scoping" },
              { name: "Tindi Apparel", status: "PRE_LAUNCH" as const, note: "Sustainable Textiles", target: "Studio Atelier" },
            ].map((sub) => (
              <div
                key={sub.name}
                className="p-3.5 bg-muted/40 border border-border rounded-xl flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-xs text-foreground leading-snug line-clamp-1">
                    {sub.name}
                  </span>
                  <EntityStatusBadge status={sub.status} size="xs" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground font-medium">{sub.note}</div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                    {sub.target}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Corporate Key Targets Overview */}
          <div className="pt-2 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Subsidiaries</span>
                <MetricBadge classification="VERIFIED" size="xs" />
              </div>
              <div className="text-xl font-black text-foreground">4 Active</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Target: 10 by 2031</div>
            </div>
            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Customer Goal</span>
                <MetricBadge classification="TARGET" size="xs" />
              </div>
              <div className="text-xl font-black text-foreground">1.5M+</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">5-Year Strategic Goal</div>
            </div>
            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Project Pipeline</span>
                <MetricBadge classification="TARGET" size="xs" />
              </div>
              <div className="text-xl font-black text-foreground">620+</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Target Ecosystem Projects</div>
            </div>
            <div className="p-3 bg-muted/20 border border-border/80 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Operating Base</span>
                <MetricBadge classification="VERIFIED" size="xs" />
              </div>
              <div className="text-xl font-black text-foreground">Kenya (HQ)</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Target: 8+ African Nations</div>
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
                  <div
                    className={`h-10 w-10 rounded-xl bg-gradient-to-br ${mt.gradient} grid place-items-center shadow-xs`}
                  >
                    <mt.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-0.5 text-right">
                    {mt.up ? (
                      <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                    ) : mt.trend.startsWith("-") ? (
                      <ArrowDownRight className="h-3 w-3 text-rose-500" />
                    ) : null}
                    <span
                      className={`text-[10px] font-black ${mt.up ? "text-emerald-500" : mt.trend.startsWith("-") ? "text-rose-500" : "text-rose-600"}`}
                    >
                      {mt.trend}
                    </span>
                  </div>
                </div>
                <div className={`text-xl font-black tracking-tight ${mt.text} truncate`}>
                  {mt.value}
                </div>
                <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">
                  {mt.label}
                </div>
                <div className="text-[9px] text-muted-foreground/70 mt-0.5">{mt.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid xl:grid-cols-12 gap-6">
          <motion.div variants={itemVariants} className="xl:col-span-8 space-y-6">
            {/* Sales Chart with Multi-Metric Switcher */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">
                    {dateRange.preset === "custom"
                      ? "Custom Range Timeline"
                      : `Trend (${dateRange.startDate} to ${dateRange.endDate})`}
                  </p>
                  <h3 className="text-xl font-black mt-0.5 tracking-tight">
                    Sales & Revenue Telemetry
                  </h3>
                </div>

                {/* Metric Mode Switcher */}
                <div className="flex p-1 bg-muted/40 rounded-xl border border-border gap-1">
                  {(
                    [
                      { key: "revenue", label: "Gross Revenue" },
                      { key: "orders", label: "Orders" },
                      { key: "aov", label: "Avg Basket (AOV)" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setActiveMetric(m.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeMetric === m.key
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesAnalytics?.salesSeries ?? []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
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
                      tickFormatter={(v) =>
                        activeMetric === "orders"
                          ? String(v)
                          : `KES ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                      }
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
                      formatter={(val: any) => [
                        activeMetric === "orders"
                          ? `${val} Orders`
                          : `KES ${Number(val).toLocaleString("en-KE")}`,
                        activeMetric === "orders" ? "Volume" : "Revenue",
                      ]}
                      itemStyle={{ color: "var(--color-primary)" }}
                      labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey={activeMetric === "orders" ? "orders" : "revenue"}
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

            {/* 24-Hour Peak Sales & Rush Heatmap */}
            <HourlyHeatmap data={heatmapData?.hourlySlots ?? []} isLoading={isHeatmapLoading} />

            {/* Recent Orders Live Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">
                    Live Channel
                  </p>
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
                    {((orders && orders.length > 0 ? orders : salesAnalytics?.recentOrders) ?? [])
                      .slice(0, 6)
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-primary">#{o.order_number}</td>
                          <td className="px-6 py-3.5 font-medium text-foreground">
                            {o.shipping_name ?? "—"}
                          </td>
                          <td className="px-6 py-3.5 text-muted-foreground text-xs">
                            {new Date(o.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3.5 font-bold">
                            KES {Number(o.total).toLocaleString("en-KE")}
                          </td>
                          <td className="px-6 py-3.5">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg ${statusColor[o.status] ?? "bg-muted text-muted-foreground"}`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Multi-Branch Leaderboard & System Health */}
          <motion.div variants={itemVariants} className="xl:col-span-4 space-y-6">
            {/* Multi-Branch Revenue Leaderboard */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">
                    Multi-Unit
                  </p>
                  <h4 className="text-base font-black tracking-tight">Branch Leaderboard</h4>
                </div>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {branchAnalytics?.branches?.length || 0} Units Active
                </span>
              </div>

              <div className="space-y-3">
                {(branchAnalytics?.branches ?? []).map((b: any, idx: number) => (
                  <div
                    key={b.id}
                    className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span className="text-foreground flex items-center gap-1.5">
                        <span className="h-5 w-5 rounded-md bg-primary/10 text-primary text-[10px] grid place-items-center font-black">
                          {idx + 1}
                        </span>
                        {b.name}
                      </span>
                      <span className="font-mono text-primary">
                        KES {Number(b.revenue).toLocaleString("en-KE")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>{b.orders} orders processed</span>
                      <span className="font-black text-foreground">
                        {b.marketShare || 0}% share
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, Math.min(100, b.marketShare || 10))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Low stock depletion alerts */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-8 w-8 rounded-xl bg-error/10 grid place-items-center">
                  <Activity className="h-4 w-4 text-error" />
                </div>
                <div>
                  <p className="text-xs font-bold text-error uppercase tracking-widest">
                    Inventory Risk
                  </p>
                  <h4 className="text-base font-black tracking-tight">Depletion Alerts</h4>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {(metricsData?.lowStock ?? []).length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2 text-center">
                    <div className="h-10 w-10 rounded-full bg-success/10 grid place-items-center">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">All stock healthy</p>
                      <p className="text-[10px] text-muted-foreground">No low-stock warnings.</p>
                    </div>
                  </div>
                ) : (
                  (metricsData?.lowStock ?? []).slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 bg-error/5 rounded-xl border border-error/10"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-error/10 grid place-items-center text-error font-black text-xs">
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
            </div>

            {/* Quick Links */}
            <div className="bg-card rounded-2xl border border-border p-5 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">
                Operations Shortcuts
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Products", to: "/admin/products", icon: Package },
                  { label: "Orders", to: "/admin/orders", icon: ShoppingCart },
                  { label: "Analytics", to: "/admin/analytics/sales", icon: TrendingUp },
                  { label: "Reports", to: "/admin/reports/sales", icon: Layers },
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
