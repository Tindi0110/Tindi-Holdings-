import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { useBranch } from "@/hooks/use-branch";
import {
  AnalyticsDateRangePicker,
  DateRangeValue,
  calculateDateRange,
} from "@/components/admin/AnalyticsDateRangePicker";
import { CorporateReportModal } from "@/components/admin/CorporateReportModal";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Building2,
  RefreshCw,
  BarChart3,
  Printer,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  Send,
  Sparkles,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getBranchesReport,
  getFinancialReport,
  getKraTaxReconciliation,
} from "@/lib/analytics.functions";
import {
  getExecutiveDigestData,
  dispatchExecutiveDigest,
} from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/admin/reports/$sub")({
  head: () => ({
    meta: [{ title: "Enterprise Reports — Tindi Holdings Limited" }, { name: "robots", content: "noindex" }],
  }),
  component: ReportsPage,
});

const TABS = [
  { key: "sales", label: "Sales Report" },
  { key: "inventory", label: "Inventory Valuation" },
  { key: "customers", label: "Customer Registry" },
  { key: "branches", label: "Branch Performance" },
  { key: "financial", label: "Financial Ledger" },
  { key: "tax", label: "KRA eTIMS VAT" },
  { key: "exports", label: "Exports Hub" },
];

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

function kes(n: number) {
  return `KES ${Number(n).toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
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

function KPICard({
  label,
  value,
  icon: Icon,
  color = "primary",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    conversion: "bg-conversion/10 text-conversion",
    error: "bg-error/10 text-error",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl grid place-items-center shrink-0 ${colorMap[color] ?? colorMap.primary}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-xl font-black tracking-tight mt-0.5">{value}</div>
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

/* ─── Sales Report ─── */
function SalesReport({
  branchId,
  branchName,
  dateRange,
}: {
  branchId?: string;
  branchName: string;
  dateRange: DateRangeValue;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["report", "sales", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getSalesReport({
        data: {
          branchId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  if (isLoading) return <Loader />;

  const orders = data?.orders ?? [];
  const totalRev = data?.totalRevenue ?? 0;
  const completedRev = data?.completedRevenue ?? 0;

  const exportRows = orders.map((o: any) => ({
    order_number: o.order_number,
    customer: o.shipping_name || "Guest Customer",
    branch: (o.branches as any)?.name || branchName,
    status: o.status,
    payment_method: o.payment_method || "direct",
    total: `KES ${Number(o.total).toLocaleString("en-KE")}`,
    date: new Date(o.created_at).toLocaleDateString(),
  }));

  const columns = [
    { header: "Order #", key: "order_number" },
    { header: "Customer", key: "customer" },
    { header: "Branch Location", key: "branch" },
    { header: "Status", key: "status" },
    { header: "Payment Mode", key: "payment_method" },
    { header: "Order Total (KES)", key: "total", align: "right" as const },
    { header: "Date", key: "date" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Total Revenue" value={kes(totalRev)} icon={DollarSign} color="primary" />
        <KPICard label="Completed Revenue" value={kes(completedRev)} icon={TrendingUp} color="success" />
        <KPICard label="Total Transactions" value={String(orders.length)} icon={BarChart3} color="conversion" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Sales Transactions ({orders.length} Records)</span>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Corporate Print & Excel
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Order #</Th>
              <Th>Customer</Th>
              <Th>Branch</Th>
              <Th>Status</Th>
              <Th>Payment</Th>
              <Th>Total (KES)</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.slice(0, 100).map((o: any) => (
              <tr key={o.id} className="hover:bg-muted/10">
                <Td><span className="font-mono text-xs font-bold text-primary">#{o.order_number}</span></Td>
                <Td>{o.shipping_name || "—"}</Td>
                <Td className="text-muted-foreground">{(o.branches as any)?.name ?? branchName}</Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[o.status] ?? "bg-muted"}`}>{o.status}</span></Td>
                <Td className="capitalize text-muted-foreground">{o.payment_method}</Td>
                <Td><span className="font-black">{kes(Number(o.total))}</span></Td>
                <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <CorporateReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reportTitle="Official Sales & Revenue Report"
        branchName={branchName}
        dateRangeLabel={`${dateRange.startDate} to ${dateRange.endDate}`}
        summaryMetrics={[
          { label: "Total Revenue", value: kes(totalRev) },
          { label: "Completed Sales", value: kes(completedRev) },
          { label: "Transactions", value: String(orders.length) },
          { label: "Avg Basket", value: kes(orders.length > 0 ? totalRev / orders.length : 0) },
        ]}
        columns={columns}
        data={exportRows}
      />
    </div>
  );
}

/* ─── Inventory Valuation Report ─── */
function InventoryReport({ branchName }: { branchName: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["report", "inventory"], queryFn: () => getInventoryReport({ data: {} }) });
  if (isLoading) return <Loader />;

  const prods = data?.products ?? [];
  const exportRows = prods.map((p: any) => ({
    name: p.name,
    category: (p.categories as any)?.name ?? "General",
    price: `KES ${Number(p.price).toLocaleString("en-KE")}`,
    stock: p.stock ?? 0,
    stock_value: `KES ${(Number(p.price) * (p.stock ?? 0)).toLocaleString("en-KE")}`,
    status: p.is_active ? "Active" : "Inactive",
  }));

  const columns = [
    { header: "Product Name", key: "name" },
    { header: "Category", key: "category" },
    { header: "Unit Price", key: "price", align: "right" as const },
    { header: "Stock Units", key: "stock", align: "right" as const },
    { header: "Valuation (KES)", key: "stock_value", align: "right" as const },
    { header: "Status", key: "status" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Catalog SKUs" value={String(data?.totalProducts ?? 0)} icon={Package} color="primary" />
        <KPICard label="Out of Stock" value={String(data?.outOfStock ?? 0)} icon={TrendingDown} color="error" />
        <KPICard label="Low Stock Warnings" value={String(data?.lowStock ?? 0)} icon={TrendingDown} color="warning" />
        <KPICard label="Total Asset Valuation" value={kes(data?.totalStockValue ?? 0)} icon={DollarSign} color="success" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Product Inventory Valuation ({prods.length} SKUs)</span>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Corporate Print & Excel
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Category</Th>
              <Th>Unit Price</Th>
              <Th>Stock On Hand</Th>
              <Th>Total Valuation</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prods.slice(0, 100).map((p: any) => (
              <tr key={p.id} className="hover:bg-muted/10">
                <Td><span className="font-semibold text-foreground">{p.name}</span></Td>
                <Td className="text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                <Td className="font-bold">{kes(Number(p.price))}</Td>
                <Td>
                  <span className={`font-black text-xs ${(p.stock ?? 0) === 0 ? "text-error" : (p.stock ?? 0) < 10 ? "text-warning" : "text-success"}`}>
                    {p.stock ?? 0} units
                  </span>
                </Td>
                <Td className="font-bold">{kes(Number(p.price) * (p.stock ?? 0))}</Td>
                <Td>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <CorporateReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reportTitle="Inventory Valuation & Stock Audit"
        branchName={branchName}
        dateRangeLabel={`As of ${new Date().toLocaleDateString()}`}
        summaryMetrics={[
          { label: "Total SKUs", value: String(data?.totalProducts ?? 0) },
          { label: "Stock Valuation", value: kes(data?.totalStockValue ?? 0) },
          { label: "Out of Stock", value: String(data?.outOfStock ?? 0) },
          { label: "Low Stock Alert", value: String(data?.lowStock ?? 0) },
        ]}
        columns={columns}
        data={exportRows}
      />
    </div>
  );
}

/* ─── KRA eTIMS VAT Reconciliation Report ─── */
function KraTaxReport({
  branchId,
  branchName,
  dateRange,
}: {
  branchId?: string;
  branchName: string;
  dateRange: DateRangeValue;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["report", "kra-tax", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getKraTaxReconciliation({
        data: {
          branchId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  if (isLoading) return <Loader />;

  const items = data?.itemized ?? [];
  const exportRows = items.map((i: any) => ({
    order_number: i.orderNumber,
    branch: i.branch,
    date: i.date,
    gross: `KES ${Number(i.grossAmount).toLocaleString("en-KE")}`,
    net: `KES ${Number(i.netAmount).toLocaleString("en-KE")}`,
    vat: `KES ${Number(i.vatAmount).toLocaleString("en-KE")}`,
    cu_invoice: i.cuInvoiceNumber,
    cu_serial: i.cuSerialNumber,
  }));

  const columns = [
    { header: "Order #", key: "order_number" },
    { header: "Branch", key: "branch" },
    { header: "Date", key: "date" },
    { header: "Gross (KES)", key: "gross", align: "right" as const },
    { header: "Net Amount (KES)", key: "net", align: "right" as const },
    { header: "16% VAT (KES)", key: "vat", align: "right" as const },
    { header: "KRA CU Invoice #", key: "cu_invoice" },
    { header: "Control Unit Serial", key: "cu_serial" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Gross Taxable Sales" value={kes(data?.grossRevenue ?? 0)} icon={DollarSign} color="primary" />
        <KPICard label="16% Standard VAT Output" value={kes(data?.totalVat16 ?? 0)} icon={BarChart3} color="warning" />
        <KPICard label="Net Sales Base" value={kes(data?.netRevenue ?? 0)} icon={TrendingUp} color="success" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>KRA eTIMS Fiscal Invoicing Audit ({items.length} Invoices)</span>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Corporate Print & Excel
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Order #</Th>
              <Th>Branch</Th>
              <Th>Date</Th>
              <Th>Gross Total</Th>
              <Th>Net Amount</Th>
              <Th>16% VAT</Th>
              <Th>CU Invoice Number</Th>
              <Th>Control Unit Serial</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.slice(0, 100).map((it: any) => (
              <tr key={it.id} className="hover:bg-muted/10">
                <Td><span className="font-mono font-bold text-primary">#{it.orderNumber}</span></Td>
                <Td className="text-muted-foreground">{it.branch}</Td>
                <Td className="text-muted-foreground">{it.date}</Td>
                <Td className="font-bold">{kes(it.grossAmount)}</Td>
                <Td className="font-medium text-muted-foreground">{kes(it.netAmount)}</Td>
                <Td><span className="font-black text-amber-500">{kes(it.vatAmount)}</span></Td>
                <Td><span className="font-mono text-[11px] font-bold text-foreground">{it.cuInvoiceNumber}</span></Td>
                <Td><span className="font-mono text-[10px] text-muted-foreground">{it.cuSerialNumber}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <CorporateReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reportTitle="KRA eTIMS Fiscal Tax Reconciliation"
        branchName={branchName}
        dateRangeLabel={`${dateRange.startDate} to ${dateRange.endDate}`}
        summaryMetrics={[
          { label: "Gross Sales", value: kes(data?.grossRevenue ?? 0) },
          { label: "Net Base", value: kes(data?.netRevenue ?? 0) },
          { label: "16% VAT Output", value: kes(data?.totalVat16 ?? 0) },
          { label: "Fiscal Invoices", value: String(items.length) },
        ]}
        columns={columns}
        data={exportRows}
      />
    </div>
  );
}

/* ─── Customer Registry Report ─── */
function CustomersReport({ branchId, branchName }: { branchId?: string; branchName: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ["report", "customers", branchId], queryFn: () => getCustomersReport({ data: { branchId } }) });
  if (isLoading) return <Loader />;

  const custs = data?.customers ?? [];
  const exportRows = custs.map((c: any) => ({
    name: c.full_name || "Registered User",
    username: c.username || "—",
    branch: (c.branches as any)?.name ?? branchName,
    total_spend: `KES ${Number(c.totalSpend ?? 0).toLocaleString("en-KE")}`,
    orders: c.orderCount ?? 0,
    joined: new Date(c.created_at).toLocaleDateString(),
  }));

  const columns = [
    { header: "Customer Name", key: "name" },
    { header: "Username", key: "username" },
    { header: "Assigned Branch", key: "branch" },
    { header: "Total Spend (KES)", key: "total_spend", align: "right" as const },
    { header: "Orders", key: "orders", align: "center" as const },
    { header: "Joined Date", key: "joined" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Total Registered Customers" value={String(data?.total ?? 0)} icon={Users} color="primary" />
        <KPICard label="Active Branch Users" value={String(custs.length)} icon={TrendingUp} color="success" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Customer Registry Directory ({custs.length} Profiles)</span>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Corporate Print & Excel
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Username</Th>
              <Th>Branch</Th>
              <Th>Total Spend</Th>
              <Th>Orders</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {custs.slice(0, 100).map((c: any) => (
              <tr key={c.id} className="hover:bg-muted/10">
                <Td><span className="font-semibold text-foreground">{c.full_name || "—"}</span></Td>
                <Td className="text-muted-foreground">@{c.username || "—"}</Td>
                <Td className="text-muted-foreground">{(c.branches as any)?.name ?? branchName}</Td>
                <Td><span className="font-black text-success">{kes(c.totalSpend ?? 0)}</span></Td>
                <Td className="font-bold text-primary">{c.orderCount}</Td>
                <Td className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <CorporateReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reportTitle="Customer Registry Directory"
        branchName={branchName}
        dateRangeLabel={`Generated on ${new Date().toLocaleDateString()}`}
        summaryMetrics={[
          { label: "Total Customers", value: String(data?.total ?? 0) },
          { label: "Active Profiles", value: String(custs.length) },
          { label: "Total Spend (KES)", value: kes(custs.reduce((s, c: any) => s + (c.totalSpend || 0), 0)) },
        ]}
        columns={columns}
        data={exportRows}
      />
    </div>
  );
}

/* ─── Financial Report ─── */
function FinancialReport({
  branchId,
  branchName,
  dateRange,
}: {
  branchId?: string;
  branchName: string;
  dateRange: DateRangeValue;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["report", "financial", branchId, dateRange.startDate, dateRange.endDate],
    queryFn: () =>
      getFinancialReport({
        data: {
          branchId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      }),
  });

  if (isLoading) return <Loader />;

  const orders = data?.orders ?? [];
  const exportRows = orders.map((o: any) => ({
    order_number: o.order_number,
    payment_method: o.payment_method || "direct",
    payment_status: o.payment_status || "pending",
    order_status: o.status,
    total: `KES ${Number(o.total).toLocaleString("en-KE")}`,
    date: new Date(o.created_at).toLocaleDateString(),
  }));

  const columns = [
    { header: "Order #", key: "order_number" },
    { header: "Payment Method", key: "payment_method" },
    { header: "Payment Status", key: "payment_status" },
    { header: "Order Status", key: "order_status" },
    { header: "Amount (KES)", key: "total", align: "right" as const },
    { header: "Date", key: "date" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Gross Revenue" value={kes(data?.totalGross ?? 0)} icon={DollarSign} color="primary" />
        <KPICard label="Paid / Collected" value={kes(data?.paid ?? 0)} icon={TrendingUp} color="success" />
        <KPICard label="Outstanding Receivable" value={kes(data?.pending ?? 0)} icon={TrendingDown} color="warning" />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Financial Transactions Ledger ({orders.length} Records)</span>
          <Button
            onClick={() => setModalOpen(true)}
            size="sm"
            className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Corporate Print & Excel
          </Button>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th>Order #</Th>
              <Th>Payment Method</Th>
              <Th>Payment Status</Th>
              <Th>Order Status</Th>
              <Th>Amount</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.slice(0, 100).map((o: any) => (
              <tr key={o.id} className="hover:bg-muted/10">
                <Td><span className="font-mono text-xs font-bold text-primary">#{o.order_number}</span></Td>
                <Td className="capitalize text-muted-foreground">{o.payment_method || "—"}</Td>
                <Td>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${o.payment_status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {o.payment_status || "pending"}
                  </span>
                </Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[o.status] ?? "bg-muted"}`}>{o.status}</span></Td>
                <Td><span className="font-black">{kes(Number(o.total))}</span></Td>
                <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>

      <CorporateReportModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        reportTitle="Financial Ledger & Payment Reconciliation"
        branchName={branchName}
        dateRangeLabel={`${dateRange.startDate} to ${dateRange.endDate}`}
        summaryMetrics={[
          { label: "Gross Revenue", value: kes(data?.totalGross ?? 0) },
          { label: "Paid / Collected", value: kes(data?.paid ?? 0) },
          { label: "Outstanding", value: kes(data?.pending ?? 0) },
        ]}
        columns={columns}
        data={exportRows}
      />
    </div>
  );
}

/* ─── Exports Hub ─── */
function ExportsHub({
  branchId,
  branchName,
  dateRange,
}: {
  branchId?: string;
  branchName: string;
  dateRange: DateRangeValue;
}) {
  const { data: salesData } = useQuery({ queryKey: ["report", "sales", branchId, dateRange.startDate, dateRange.endDate], queryFn: () => getSalesReport({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }) });
  const { data: invData } = useQuery({ queryKey: ["report", "inventory"], queryFn: () => getInventoryReport({ data: {} }) });
  const { data: custData } = useQuery({ queryKey: ["report", "customers", branchId], queryFn: () => getCustomersReport({ data: { branchId } }) });
  const { data: finData } = useQuery({ queryKey: ["report", "financial", branchId, dateRange.startDate, dateRange.endDate], queryFn: () => getFinancialReport({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }) });
  const { data: kraData } = useQuery({ queryKey: ["report", "kra-tax", branchId, dateRange.startDate, dateRange.endDate], queryFn: () => getKraTaxReconciliation({ data: { branchId, startDate: dateRange.startDate, endDate: dateRange.endDate } }) });

  // Executive Digest Query & Mutation
  const { data: digestData, isLoading: digestLoading } = useQuery({
    queryKey: ["report", "executive_digest"],
    queryFn: () => getExecutiveDigestData(),
  });

  const sendDigestMut = useMutation({
    mutationFn: () => dispatchExecutiveDigest({ data: { recipientEmail: "directors@tindiholdings.co.ke" } }),
    onSuccess: (res: any) => {
      toast.success(res.message || "Monday Executive Digest dispatched to directors!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const hubs = [
    {
      id: "sales",
      label: "Sales & Revenue Ledger",
      description: "Full transaction ledger with status, branch, and KES totals",
      count: `${(salesData?.orders ?? []).length} Records`,
      onOpen: () => setActiveModal("sales"),
    },
    {
      id: "inventory",
      label: "Inventory Asset Valuation",
      description: "Complete product catalog with stock counts and valuation in KES",
      count: `${(invData?.products ?? []).length} SKUs`,
      onOpen: () => setActiveModal("inventory"),
    },
    {
      id: "customers",
      label: "Customer Registry Directory",
      description: "Customer accounts, registered branches, and lifetime spending",
      count: `${(custData?.customers ?? []).length} Users`,
      onOpen: () => setActiveModal("customers"),
    },
    {
      id: "financial",
      label: "Financial Transactions Ledger",
      description: "Payment status, settlement modes, and cash flow audit",
      count: `${(finData?.orders ?? []).length} Records`,
      onOpen: () => setActiveModal("financial"),
    },
    {
      id: "tax",
      label: "KRA eTIMS VAT Reconciliation",
      description: "Itemized 16% standard VAT breakdown matching Control Unit serials",
      count: `${(kraData?.itemized ?? []).length} Invoices`,
      onOpen: () => setActiveModal("tax"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── MONDAY MORNING EXECUTIVE DIGEST ENGINE ─── */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Executive Intelligence Cron</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {digestData?.status || "Active Cron"}
                </span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground mt-0.5">Automated Monday Morning Executive Digest</h3>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => sendDigestMut.mutate()}
            disabled={sendDigestMut.isPending}
            className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5 shadow-sm"
          >
            <Send className="h-3.5 w-3.5" />
            {sendDigestMut.isPending ? "Compiling PDF..." : "Dispatch Weekly Digest Now"}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-muted/15 rounded-xl border border-border">
            <span className="text-[10px] font-black uppercase text-muted-foreground block">Weekly Gross Revenue</span>
            <div className="text-lg font-black text-primary mt-0.5">{kes(digestData?.totalRevenueKES ?? 0)}</div>
            <span className="text-[10px] text-muted-foreground">{digestData?.totalOrders ?? 0} Completed Orders</span>
          </div>
          <div className="p-3.5 bg-muted/15 rounded-xl border border-border">
            <span className="text-[10px] font-black uppercase text-muted-foreground block">Avg Order Value (AOV)</span>
            <div className="text-lg font-black text-foreground mt-0.5">{kes(digestData?.averageOrderValueKES ?? 0)}</div>
            <span className="text-[10px] text-muted-foreground">Per Checkout</span>
          </div>
          <div className="p-3.5 bg-muted/15 rounded-xl border border-border">
            <span className="text-[10px] font-black uppercase text-muted-foreground block">KRA 16% VAT Accrual</span>
            <div className="text-lg font-black text-amber-600 mt-0.5">{kes(digestData?.vatLiabilityKES ?? 0)}</div>
            <span className="text-[10px] text-muted-foreground">Fiscalized via eTIMS</span>
          </div>
          <div className="p-3.5 bg-muted/15 rounded-xl border border-border">
            <span className="text-[10px] font-black uppercase text-muted-foreground block">Top Revenue Node</span>
            <div className="text-sm font-black text-emerald-600 mt-1 truncate">{digestData?.topPerformingBranch || "Nairobi CBD"}</div>
            <span className="text-[10px] text-muted-foreground">Leading Branch</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/20 rounded-xl border border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Schedule: <strong className="text-foreground">{digestData?.frequency || "Every Monday at 08:00 AM (EAT)"}</strong></span>
          </div>
          <div className="text-[11px]">
            Recipients: <strong className="text-foreground font-mono">directors@tindiholdings.co.ke, finance@...</strong>
          </div>
        </div>
      </div>

      {/* ─── ENTERPRISE EXPORTS CENTER ─── */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div>
          <h3 className="text-base font-black tracking-tight">Enterprise Export Center</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download formatted multi-tab Excel workbooks, raw CSV files, or generate official print-ready corporate PDF reports.
          </p>
        </div>

        <div className="grid gap-3 pt-2">
          {hubs.map((h) => (
            <div key={h.id} className="p-4 bg-muted/20 rounded-xl border border-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-foreground">{h.label}</h4>
                  <p className="text-[10px] text-muted-foreground">{h.description} • <strong>{h.count}</strong></p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={h.onOpen}
                className="rounded-xl h-8 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" /> Export & Print
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { sub } = Route.useParams();
  const navigate = useNavigate();
  const { selectedBranchId, selectedBranch, isAllBranches } = useBranch();

  const initialDates = calculateDateRange("30d");
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    preset: "30d",
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    compareMode: "none",
  });

  const branchName = isAllBranches ? "All Enterprise Branches (Global)" : selectedBranch?.name || "Selected Branch";
  const title = TABS.find((t) => t.key === sub)?.label ?? sub;

  return (
    <AdminShell title={`Reports — ${title}`}>
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight">{title}</h2>
              <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {isAllBranches ? "Global View" : selectedBranch?.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official data reporting node for {branchName}
            </p>
          </div>

          <AnalyticsDateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex overflow-x-auto gap-1.5 pb-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ to: "/admin/reports/$sub", params: { sub: t.key } })}
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

        {/* Active Report Tab Content */}
        {sub === "sales" && <SalesReport branchId={selectedBranchId || undefined} branchName={branchName} dateRange={dateRange} />}
        {sub === "inventory" && <InventoryReport branchName={branchName} />}
        {sub === "customers" && <CustomersReport branchId={selectedBranchId || undefined} branchName={branchName} />}
        {sub === "branches" && <SalesReport branchId={undefined} branchName={branchName} dateRange={dateRange} />}
        {sub === "financial" && <FinancialReport branchId={selectedBranchId || undefined} branchName={branchName} dateRange={dateRange} />}
        {sub === "tax" && <KraTaxReport branchId={selectedBranchId || undefined} branchName={branchName} dateRange={dateRange} />}
        {sub === "exports" && <ExportsHub branchId={selectedBranchId || undefined} branchName={branchName} dateRange={dateRange} />}
      </div>
    </AdminShell>
  );
}
