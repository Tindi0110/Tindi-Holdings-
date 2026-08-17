import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  TrendingUp, TrendingDown, Users, Package, DollarSign,
  Activity, ShoppingCart, BarChart3, RefreshCw, ArrowUpRight,
  ShieldCheck, Zap, Clock, CheckCircle, XCircle, Timer,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getSalesAnalytics,
  getCustomerAnalyticsDetailed,
  getProductAnalytics,
  getBranchAnalyticsDetailed,
  getRevenueAnalytics,
  getConversionAnalytics,
} from "@/lib/analytics.functions";
import { getDashboardMetrics, getSystemActivity } from "@/lib/admin.functions";
import { motion } from "motion/react";

export const Route = createFileRoute("/_admin/admin/analytics/$sub")({
  component: AnalyticsPage,
});

const TABS = [
  { key: "sales", label: "Sales" },
  { key: "customers", label: "Customers" },
  { key: "products", label: "Products" },
  { key: "branches", label: "Branches" },
  { key: "revenue", label: "Revenue" },
  { key: "conversion", label: "Conversion" },
  { key: "performance", label: "Performance" },
];

function KPI({
  label, value, sub, icon: Icon, trend, color = "primary",
}: {
  label: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }>;
  trend?: number; color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    conversion: "bg-conversion/10 text-conversion",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4"
    >
      <div className={`h-11 w-11 rounded-xl grid place-items-center ${colorMap[color] ?? colorMap.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-2xl font-black tracking-tight mt-1">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend >= 0 ? "text-success" : "text-error"}`}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {Math.abs(trend).toFixed(1)}% vs last period
          </div>
        )}
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
  return <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-section whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3.5 text-sm whitespace-nowrap ${className}`}>{children}</td>;
}

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

/* ─── Sales Tab ─────────────────────────────────────────── */
function SalesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "sales"],
    queryFn: () => getSalesAnalytics(),
  });
  if (isLoading) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Revenue" value={`KES ${(data?.currentRevenue ?? 0).toLocaleString("en-KE")}`} icon={DollarSign} trend={data?.revenueGrowth} color="primary" sub="Last 30 days" />
        <KPI label="Total Orders" value={String(data?.currentOrderCount ?? 0)} icon={ShoppingCart} color="success" sub="Last 30 days" />
        <KPI label="Avg Order Value" value={`KES ${(data?.avgOrderValue ?? 0).toLocaleString("en-KE")}`} icon={TrendingUp} color="conversion" />
        <KPI label="Prev Period Revenue" value={`KES ${(data?.prevRevenue ?? 0).toLocaleString("en-KE")}`} icon={BarChart3} color="warning" sub="Days 31–60" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">Daily Revenue (14 Days)</h3>
        <div className="h-56">
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
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `KES ${v.toLocaleString("en-KE")}`} />
              <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString("en-KE")}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Payment Methods</h3>
          {data?.paymentMethods?.map((pm) => (
            <div key={pm.method} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-sm font-medium capitalize">{pm.method}</span>
              <span className="font-black text-primary">{pm.count}</span>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Order Status Breakdown</h3>
          {data?.statusBreakdown?.map((s) => (
            <div key={s.status} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[s.status] ?? "bg-muted text-muted-foreground"}`}>{s.status}</span>
              <span className="font-black">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider">Recent Orders</div>
        <TableWrap>
          <thead>
            <tr>
              <Th>Order #</Th><Th>Customer</Th><Th>Status</Th><Th>Payment</Th><Th>Amount</Th><Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.recentOrders?.map((o: any) => (
              <tr key={o.id} className="hover:bg-section/30 transition-colors">
                <Td><span className="font-mono font-bold text-xs">{o.order_number}</span></Td>
                <Td>{o.shipping_name || "—"}</Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[o.status] ?? "bg-muted"}`}>{o.status}</span></Td>
                <Td className="capitalize text-muted-foreground">{o.payment_method}</Td>
                <Td><span className="font-black">KES {Number(o.total).toLocaleString("en-KE")}</span></Td>
                <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Customers Tab ─────────────────────────────────────── */
function CustomersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "customers"],
    queryFn: () => getCustomerAnalyticsDetailed(),
  });
  if (isLoading) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Customers" value={String(data?.totalCustomers ?? 0)} icon={Users} color="primary" />
        <KPI label="New This Month" value={String(data?.newThisMonth ?? 0)} icon={TrendingUp} color="success" />
        <KPI label="Customers w/ Orders" value={String(data?.customersWithOrders ?? 0)} icon={ShoppingCart} color="conversion" />
        <KPI label="Total Orders" value={String(data?.totalOrders ?? 0)} icon={BarChart3} color="warning" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">Customer Growth (Monthly)</h3>
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

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider">Recent Customers</div>
        <TableWrap>
          <thead>
            <tr><Th>Name</Th><Th>Username</Th><Th>Branch</Th><Th>Joined</Th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.recentCustomers?.map((c: any) => (
              <tr key={c.id} className="hover:bg-section/30">
                <Td><span className="font-semibold">{c.full_name || "—"}</span></Td>
                <Td className="text-muted-foreground">@{c.username || "—"}</Td>
                <Td className="text-muted-foreground">{(c.branches as any)?.name ?? "—"}</Td>
                <Td className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Products Tab ─────────────────────────────────────── */
function ProductsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "products"],
    queryFn: () => getProductAnalytics(),
  });
  if (isLoading) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Products" value={String(data?.totalProducts ?? 0)} icon={Package} color="primary" />
        <KPI label="Active" value={String(data?.activeProducts ?? 0)} icon={Activity} color="success" />
        <KPI label="Low Stock" value={String(data?.lowStockCount ?? 0)} icon={TrendingDown} color="warning" />
        <KPI label="Out of Stock" value={String(data?.outOfStock ?? 0)} icon={RefreshCw} color="conversion" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Category Breakdown</h3>
          {data?.categoryBreakdown?.map((c) => (
            <div key={c.category} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-sm font-semibold">{c.category}</span>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{c.count} products</span>
                <span className="font-black text-foreground">${c.revenue.toFixed(0)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-4">Low Stock Alerts</h3>
          {data?.lowStock?.length === 0 && <p className="text-sm text-muted-foreground">No low-stock products.</p>}
          {data?.lowStock?.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-sm font-semibold truncate max-w-[60%]">{p.name}</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded ${(p.stock ?? 0) === 0 ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}>{p.stock ?? 0} left</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider">Top Sellers</div>
        <TableWrap>
          <thead>
            <tr><Th>#</Th><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Units Sold</Th><Th>Revenue</Th><Th>Stock</Th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.topSellers?.map((p: any, i: number) => (
              <tr key={p.id} className="hover:bg-section/30">
                <Td className="font-black text-muted-foreground">{i + 1}</Td>
                <Td><span className="font-semibold">{p.name}</span></Td>
                <Td className="text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                <Td className="font-bold">KES {Number(p.price).toLocaleString("en-KE")}</Td>
                <Td className="font-black text-primary">{p.unitsSold}</Td>
                <Td className="font-black text-success">${p.revenueGenerated.toFixed(2)}</Td>
                <Td><span className={`text-xs font-bold ${(p.stock ?? 0) < 10 ? "text-error" : "text-success"}`}>{p.stock ?? 0}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Branches Tab ─────────────────────────────────────── */
function BranchesTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "branches"],
    queryFn: () => getBranchAnalyticsDetailed(),
  });
  if (isLoading) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KPI label="Total Branches" value={String(data?.branches?.length ?? 0)} icon={Activity} color="primary" />
        <KPI label="Total Revenue" value={`KES ${(data?.totalRevenue ?? 0).toLocaleString("en-KE")}`} icon={DollarSign} color="success" />
        <KPI label="Total Orders" value={String(data?.totalOrders ?? 0)} icon={ShoppingCart} color="conversion" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider">Branch Performance</div>
        <TableWrap>
          <thead>
            <tr><Th>Branch</Th><Th>Address</Th><Th>Orders</Th><Th>Revenue</Th><Th>Staff</Th><Th>Completion</Th><Th>Status</Th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.branches?.map((b: any) => (
              <tr key={b.id} className="hover:bg-section/30">
                <Td><span className="font-black">{b.name}</span></Td>
                <Td className="text-muted-foreground text-xs">{b.address || "—"}</Td>
                <Td className="font-bold text-primary">{b.orders}</Td>
                <Td className="font-black">KES {b.revenue.toLocaleString("en-KE")}</Td>
                <Td>{b.staffCount}</Td>
                <Td><span className="font-bold text-success">{b.conversionRate}%</span></Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{b.is_active ? "Active" : "Inactive"}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Revenue Tab ──────────────────────────────────────── */
function RevenueTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "revenue"],
    queryFn: () => getRevenueAnalytics(),
  });
  if (isLoading) return <Loader />;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Revenue" value={`KES ${(data?.totalRevenue ?? 0).toLocaleString("en-KE")}`} icon={DollarSign} color="primary" />
        <KPI label="Paid Revenue" value={`KES ${(data?.paidRevenue ?? 0).toLocaleString("en-KE")}`} icon={TrendingUp} color="success" />
        <KPI label="Avg Monthly" value={`KES ${(data?.avgMonthlyRevenue ?? 0).toLocaleString("en-KE")}`} icon={BarChart3} color="conversion" />
        <KPI label="Total Orders" value={String(data?.totalOrders ?? 0)} icon={ShoppingCart} color="warning" />
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-black text-sm uppercase tracking-wider mb-4">Monthly Revenue (12 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.monthlySeries ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `KES ${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString("en-KE")}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── Conversion Tab ───────────────────────────────────── */
function ConversionTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics", "conversion"],
    queryFn: () => getConversionAnalytics(),
  });
  if (isLoading) return <Loader />;
  const stats = [
    { label: "Total Orders", value: String(data?.totalOrders ?? 0), color: "primary", icon: ShoppingCart },
    { label: "Completed", value: String(data?.completedOrders ?? 0), color: "success", icon: TrendingUp },
    { label: "Cancelled", value: String(data?.cancelledOrders ?? 0), color: "conversion", icon: TrendingDown },
    { label: "Pending", value: String(data?.pendingOrders ?? 0), color: "warning", icon: Activity },
  ] as const;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => <KPI key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.color} />)}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Order Completion Rate", value: `${data?.completionRate ?? 0}%`, color: "text-success" },
          { label: "Cancellation Rate", value: `${data?.cancellationRate ?? 0}%`, color: "text-error" },
          { label: "Payment Capture Rate", value: `${data?.paymentRate ?? 0}%`, color: "text-primary" },
        ].map((m) => (
          <div key={m.label} className="bg-card border border-border rounded-2xl p-6 text-center">
            <div className={`text-4xl font-black ${m.color}`}>{m.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Total Customers</div>
          <div className="text-3xl font-black">{data?.totalCustomers ?? 0}</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">Avg Orders / Customer</div>
          <div className="text-3xl font-black">{data?.ordersPerCustomer ?? "0.00"}</div>
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

function PerformanceTab() {
  const { data: metrics, isLoading: mLoading } = useQuery({
    queryKey: ["admin", "dashboard", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });
  const { data: convData, isLoading: cLoading } = useQuery({
    queryKey: ["analytics", "conversion"],
    queryFn: () => getConversionAnalytics(),
  });
  const { data: activity, isLoading: aLoading } = useQuery({
    queryKey: ["admin", "system", "activity"],
    queryFn: () => getSystemActivity(),
  });

  const isLoading = mLoading || cLoading || aLoading;
  if (isLoading) return <Loader />;

  const totalOrders = convData?.totalOrders ?? 0;
  const completedOrders = convData?.completedOrders ?? 0;
  const cancelledOrders = convData?.cancelledOrders ?? 0;
  const pendingOrders = convData?.pendingOrders ?? 0;
  const completionRate = convData?.completionRate ?? 0;
  const cancellationRate = convData?.cancellationRate ?? 0;
  const paymentRate = convData?.paymentRate ?? 0;

  // Build pie chart data from order statuses
  const pieData = [
    { name: "Completed", value: completedOrders, color: "var(--color-success)" },
    { name: "Pending", value: pendingOrders, color: "var(--color-warning)" },
    { name: "Cancelled", value: cancelledOrders, color: "var(--color-error)" },
    { name: "Other", value: Math.max(0, totalOrders - completedOrders - pendingOrders - cancelledOrders), color: "var(--color-primary)" },
  ].filter((d) => d.value > 0);

  // Build recent activity bar series
  const activityByType: Record<string, number> = {};
  (activity ?? []).forEach((a: any) => {
    const t = a.type ?? "event";
    activityByType[t] = (activityByType[t] ?? 0) + 1;
  });
  const activitySeries = Object.entries(activityByType).map(([type, count]) => ({ type, count }));

  return (
    <div className="space-y-6">
      {/* Live Performance KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Orders" value={String(totalOrders)} icon={ShoppingCart} color="primary" />
        <KPI label="Completion Rate" value={`${completionRate}%`} icon={CheckCircle} color="success" />
        <KPI label="Cancellation Rate" value={`${cancellationRate}%`} icon={XCircle} color="warning" />
        <KPI label="Payment Rate" value={`${paymentRate}%`} icon={Zap} color="conversion" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Order Status Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-1">Order Status Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution of all orders by current status</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} orders`]} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health KPIs */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-1">Platform Health</h3>
          <p className="text-xs text-muted-foreground mb-4">Live database counters from Supabase</p>
          <div className="space-y-3">
            {[
              { label: "Total Registered Customers", value: metrics?.customersCount?.toLocaleString() ?? "—", icon: Users, color: "text-primary" },
              { label: "Active Products in Catalog", value: metrics?.productsCount?.toLocaleString() ?? "—", icon: Package, color: "text-success" },
              { label: "Total Orders Processed", value: metrics?.ordersCount?.toLocaleString() ?? "—", icon: ShoppingCart, color: "text-conversion" },
              { label: "Orders Pending Review", value: metrics?.pendingCount?.toLocaleString() ?? "—", icon: Timer, color: "text-warning" },
              { label: "Revenue (KES)", value: `KES ${Number(metrics?.revenue ?? 0).toLocaleString("en-KE")}`, icon: DollarSign, color: "text-success" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                </div>
                <span className="text-sm font-black text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Type Breakdown */}
      {activitySeries.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-black text-sm uppercase tracking-wider mb-1">Recent Activity by Type</h3>
          <p className="text-xs text-muted-foreground mb-4">Count of recent system events grouped by type</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySeries} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Events" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent System Events Log */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          Live System Event Log
        </div>
        <div className="divide-y divide-border max-h-72 overflow-y-auto">
          {(activity ?? []).slice(0, 30).map((a: any, i: number) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-section/20">
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
          {(activity ?? []).length === 0 && (
            <div className="px-5 py-10 text-center text-xs text-muted-foreground">No recent system events found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  sales: SalesTab,
  customers: CustomersTab,
  products: ProductsTab,
  branches: BranchesTab,
  revenue: RevenueTab,
  conversion: ConversionTab,
  performance: PerformanceTab,
};

function AnalyticsPage() {
  const { sub } = Route.useParams();
  const navigate = useNavigate();
  const TabContent = TAB_COMPONENTS[sub] ?? SalesTab;
  const title = TABS.find((t) => t.key === sub)?.label ?? sub;

  return (
    <AdminShell title={`Analytics — ${title}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight">{title} Analytics</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Live data from your Supabase database.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Live
            </span>
          </div>
        </div>
        <TabContent />
      </div>
    </AdminShell>
  );
}
