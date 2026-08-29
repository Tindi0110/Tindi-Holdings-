import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { CustomerRfmGrid } from "@/components/admin/CustomerRfmGrid";
import { InventoryAbcMatrix } from "@/components/admin/InventoryAbcMatrix";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Activity,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Timer,
  Building2,
  PieChart as PieIcon,
  Percent,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getSalesAnalytics,
  getHourlySalesHeatmap,
  getCustomerAnalyticsDetailed,
  getCustomerRfmSegmentation,
  getProductAnalytics,
  getInventoryAbcMatrix,
  getBranchAnalyticsDetailed,
  getRevenueAnalytics,
  getGrossMarginAnalytics,
  getConversionAnalytics,
} from "@/lib/analytics.functions";
import { getDashboardMetrics, getSystemActivity } from "@/lib/admin.functions";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/analytics/$sub")({
  head: () => ({
    meta: [{ title: "Enterprise Analytics — Tindi Holdings Ltd" }, { name: "robots", content: "noindex" }],
  }),
  component: AnalyticsPage,
});

const TABS = [
  { key: "sales", label: "Sales & Rush" },
  { key: "customers", label: "Customers & RFM" },
  { key: "products", label: "Products & ABC" },
  { key: "branches", label: "Branches" },
  { key: "revenue", label: "Revenue & Margins" },
  { key: "conversion", label: "Conversion" },
  { key: "performance", label: "Telemetry" },
];

function KPI({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color = "primary",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    conversion: "bg-conversion/10 text-conversion",
    blue: "bg-blue-500/10 text-blue-500",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl grid place-items-center ${colorMap[color] ?? colorMap.primary}`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend >= 0 ? "text-success" : "text-error"}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-black tracking-tight mt-0.5 text-foreground truncate">{value}</div>
        {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </motion.div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/30 whitespace-nowrap">
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3.5 text-xs whitespace-nowrap ${className}`}>{children}</td>;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

/* ─── Sales Tab ─── */
function SalesTab({ branchId, dateRange }: { branchId?: string; dateRange: DateRangeValue }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "sales", branchId, dateRange.startDate, dateRange.endDate, dateRange.compareStartDate],
    queryFn: () =>
      getSalesAnalytics({
        data: {
          branchId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          compareStartDate: dateRange.compareStartDate,
          compareEndDate: dateRange.compareEndDate,
        },
      }),
  });

  const { data: heatmapData, isLoading: hmLoading } = useQuery({
    queryKey: ["analytics", "hourly", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getHourlySalesHeatmap({
        data: {
          branchId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          label="Total Revenue"
          value={`KES ${(data?.currentRevenue ?? 0).toLocaleString("en-KE")}`}
          icon={DollarSign}
          trend={data?.revenueGrowth}
          color="primary"
          sub="In selected range"
        />
        <KPI
          label="Total Orders"
          value={String(data?.currentOrderCount ?? 0)}
          icon={ShoppingCart}
          color="success"
          sub="Volume processed"
        />
        <KPI
          label="Avg Order Value"
          value={`KES ${(data?.avgOrderValue ?? 0).toLocaleString("en-KE")}`}
          icon={TrendingUp}
          color="conversion"
          sub="Average basket size"
        />
        <KPI
          label="Prior Period Revenue"
          value={`KES ${(data?.prevRevenue ?? 0).toLocaleString("en-KE")}`}
          icon={BarChart3}
          color="warning"
          sub="Comparison baseline"
        />
      </div>

      {/* Daily Revenue Chart */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">Daily Sales Velocity</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.salesSeries ?? []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `KES ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              />
              <Tooltip formatter={(v: number) => [`KES ${Number(v).toLocaleString("en-KE")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#revGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24-Hour Day-Part Heatmap */}
      <HourlyHeatmap data={heatmapData?.hourlySlots ?? []} isLoading={hmLoading} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Payment Method Distribution</h3>
          {data?.paymentMethods?.map((pm) => (
            <div key={pm.method} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-xs font-bold capitalize">{pm.method}</span>
              <span className="font-black text-primary text-xs">{pm.count} orders</span>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Fulfillment Status Breakdown</h3>
          {data?.statusBreakdown?.map((s) => (
            <div key={s.status} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[s.status] ?? "bg-muted text-muted-foreground"}`}>
                {s.status}
              </span>
              <span className="font-black text-xs">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Customers & RFM Tab ─── */
function CustomersTab({ branchId, dateRange }: { branchId?: string; dateRange: DateRangeValue }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "customers", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () => getCustomerAnalyticsDetailed({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });

  const { data: rfmData, isLoading: rfmLoading } = useQuery({
    queryKey: ["analytics", "rfm", branchId],
    queryFn: () => getCustomerRfmSegmentation({ data: { branchId } }),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Customers" value={String(data?.totalCustomers ?? 0)} icon={Users} color="primary" />
        <KPI label="New Registrations" value={String(data?.newThisMonth ?? 0)} icon={TrendingUp} color="success" sub="This month" />
        <KPI label="Active Buyers" value={String(data?.customersWithOrders ?? 0)} icon={ShoppingCart} color="conversion" />
        <KPI label="Total Orders" value={String(data?.totalOrders ?? 0)} icon={BarChart3} color="warning" />
      </div>

      {/* RFM Customer Segmentation Matrix */}
      <CustomerRfmGrid segments={rfmData?.segments ?? []} isLoading={rfmLoading} />

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">Customer Acquisition (Monthly)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlyGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Products & ABC Matrix Tab ─── */
function ProductsTab({ branchId, dateRange }: { branchId?: string; dateRange: DateRangeValue }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "products", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () => getProductAnalytics({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });

  const { data: abcData, isLoading: abcLoading } = useQuery({
    queryKey: ["analytics", "abc-matrix", branchId],
    queryFn: () => getInventoryAbcMatrix({ data: { branchId } }),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Catalog SKUs" value={String(data?.totalProducts ?? 0)} icon={Package} color="primary" />
        <KPI label="Active for Sale" value={String(data?.activeProducts ?? 0)} icon={Activity} color="success" />
        <KPI label="Low Stock Alerts" value={String(data?.lowStockCount ?? 0)} icon={TrendingDown} color="warning" />
        <KPI label="Out of Stock" value={String(data?.outOfStock ?? 0)} icon={RefreshCw} color="conversion" />
      </div>

      {/* ABC Velocity Matrix */}
      <InventoryAbcMatrix items={abcData?.items ?? []} isLoading={abcLoading} />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Category Revenue Contribution</h3>
          {data?.categoryBreakdown?.map((c) => (
            <div key={c.category} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-xs font-semibold">{c.category}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{c.count} items</span>
                <span className="font-black text-foreground">KES {c.revenue.toLocaleString("en-KE")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Top 5 Best Sellers</h3>
          {data?.topSellers?.slice(0, 5).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <div>
                <div className="font-bold text-xs text-foreground truncate max-w-[200px]">{p.name}</div>
                <div className="text-[10px] text-muted-foreground">{p.unitsSold} units sold</div>
              </div>
              <span className="font-black text-primary text-xs">
                KES {Number(p.revenueGenerated).toLocaleString("en-KE")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Branches Tab ─── */
function BranchesTab({ dateRange }: { dateRange: DateRangeValue }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "branches", dateRange.startDate, dateRange.endDate],
    queryFn: () => getBranchAnalyticsDetailed({ data: { startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });
  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Total Branches" value={String(data?.branches?.length ?? 0)} icon={Building2} color="primary" />
        <KPI label="Combined Revenue" value={`KES ${(data?.totalRevenue ?? 0).toLocaleString("en-KE")}`} icon={DollarSign} color="success" />
        <KPI label="Total Transactions" value={String(data?.totalOrders ?? 0)} icon={ShoppingCart} color="conversion" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider">
          Multi-Unit Location Performance
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Branch</Th>
              <Th>Address</Th>
              <Th>Orders</Th>
              <Th>Revenue (KES)</Th>
              <Th>Market Share</Th>
              <Th>Staff</Th>
              <Th>Fulfillment %</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.branches?.map((b: any) => (
              <tr key={b.id} className="hover:bg-muted/10">
                <Td><span className="font-black">{b.name}</span></Td>
                <Td className="text-muted-foreground text-xs">{b.address || "—"}</Td>
                <Td className="font-bold text-primary">{b.orders}</Td>
                <Td className="font-black">KES {Number(b.revenue).toLocaleString("en-KE")}</Td>
                <Td><span className="font-bold text-foreground">{b.marketShare}%</span></Td>
                <Td>{b.staffCount}</Td>
                <Td><span className="font-bold text-success">{b.conversionRate}%</span></Td>
                <Td>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {b.is_active ? "Active" : "Inactive"}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Revenue & Margins Tab ─── */
function RevenueTab({ branchId, dateRange }: { branchId?: string; dateRange: DateRangeValue }) {
  const { data: revData, isLoading: rLoading } = useQuery({
    queryKey: ["analytics", "revenue", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () => getRevenueAnalytics({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });

  const { data: marginData, isLoading: mLoading } = useQuery({
    queryKey: ["analytics", "margins", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () => getGrossMarginAnalytics({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });

  if (rLoading || mLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Gross Sales" value={`KES ${(marginData?.grossSales ?? 0).toLocaleString("en-KE")}`} icon={DollarSign} color="primary" />
        <KPI label="Estimated COGS" value={`KES ${(marginData?.cogs ?? 0).toLocaleString("en-KE")}`} icon={TrendingDown} color="warning" sub="Cost of goods" />
        <KPI label="Gross Profit" value={`KES ${(marginData?.grossProfit ?? 0).toLocaleString("en-KE")}`} icon={TrendingUp} color="success" sub="Sales minus COGS" />
        <KPI label="Gross Margin" value={`${marginData?.grossMarginPct ?? 0}%`} icon={Percent} color="conversion" sub="Profitability ratio" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">12-Month Revenue Horizon</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revData?.monthlySeries ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `KES ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`KES ${Number(v).toLocaleString("en-KE")}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Conversion Tab ─── */
function ConversionTab({ branchId, dateRange }: { branchId?: string; dateRange: DateRangeValue }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "conversion", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () => getConversionAnalytics({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }),
  });
  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Orders" value={String(data?.totalOrders ?? 0)} icon={ShoppingCart} color="primary" />
        <KPI label="Completed Orders" value={String(data?.completedOrders ?? 0)} icon={TrendingUp} color="success" />
        <KPI label="Cancelled Orders" value={String(data?.cancelledOrders ?? 0)} icon={TrendingDown} color="conversion" />
        <KPI label="Pending Review" value={String(data?.pendingOrders ?? 0)} icon={Activity} color="warning" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Order Completion Rate", value: `${data?.completionRate ?? 0}%`, color: "text-success" },
          { label: "Order Cancellation Rate", value: `${data?.cancellationRate ?? 0}%`, color: "text-error" },
          { label: "Payment Capture Rate", value: `${data?.paymentRate ?? 0}%`, color: "text-primary" },
        ].map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className={`text-4xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Performance / Telemetry Tab ─── */
function PerformanceTab({ branchId }: { branchId?: string }) {
  const { data: metrics, isLoading: mLoading } = useQuery({
    queryKey: ["admin", "dashboard", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });
  const { data: activity, isLoading: aLoading } = useQuery({
    queryKey: ["admin", "system", "activity"],
    queryFn: () => getSystemActivity(),
  });

  if (mLoading || aLoading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-1">Live Database Telemetry</h3>
        <p className="text-xs text-muted-foreground mb-4">Active operational counters from Supabase database</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Customers", value: metrics?.customersCount ?? 0, icon: Users, color: "text-primary" },
            { label: "Active Products", value: metrics?.productsCount ?? 0, icon: Package, color: "text-success" },
            { label: "Total Orders", value: metrics?.ordersCount ?? 0, icon: ShoppingCart, color: "text-conversion" },
            { label: "Pending Orders", value: metrics?.pendingCount ?? 0, icon: Timer, color: "text-warning" },
            { label: "Gross Revenue", value: `KES ${Number(metrics?.totalRevenue ?? 0).toLocaleString("en-KE")}`, icon: DollarSign, color: "text-success" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="p-4 bg-muted/20 rounded-xl border border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs font-bold text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-black text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live System Events Log */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Live System Audit Event Log
        </div>
        <div className="divide-y divide-border max-h-80 overflow-y-auto">
          {(activity ?? []).slice(0, 25).map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/10">
              <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{a.description ?? a.type ?? "System event"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</p>
              </div>
              <span className="text-[9px] font-black uppercase bg-muted px-2 py-0.5 rounded shrink-0">{a.type ?? "event"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

function AnalyticsPage() {
  const { sub } = Route.useParams();
  const navigate = useNavigate();
  const { selectedBranchId, selectedBranch, isAllBranches } = useBranch();

  const initialDates = calculateDateRange("30d");
  const initialComp = calculateCompareRange(initialDates.startDate, initialDates.endDate, "prev_period");
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    preset: "30d",
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    compareMode: "prev_period",
    ...initialComp,
  });

  const title = TABS.find((t) => t.key === sub)?.label ?? sub;

  return (
    <AdminShell title={`Analytics — ${title}`}>
      <div className="space-y-6">
        {/* Top Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">{title} Analytics</h2>
              <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {isAllBranches ? "Global View" : selectedBranch?.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live data aggregation across {isAllBranches ? "all enterprise branches" : selectedBranch?.name}
            </p>
          </div>

          <AnalyticsDateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ to: "/admin/analytics/$sub", params: { sub: t.key } })}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                sub === t.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {sub === "sales" && <SalesTab branchId={selectedBranchId || undefined} dateRange={dateRange} />}
        {sub === "customers" && <CustomersTab branchId={selectedBranchId || undefined} dateRange={dateRange} />}
        {sub === "products" && <ProductsTab branchId={selectedBranchId || undefined} dateRange={dateRange} />}
        {sub === "branches" && <BranchesTab dateRange={dateRange} />}
        {sub === "revenue" && <RevenueTab branchId={selectedBranchId || undefined} dateRange={dateRange} />}
        {sub === "conversion" && <ConversionTab branchId={selectedBranchId || undefined} dateRange={dateRange} />}
        {sub === "performance" && <PerformanceTab branchId={selectedBranchId || undefined} />}
      </div>
    </AdminShell>
  );
}
