import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  FileText, Download, TrendingUp, TrendingDown, DollarSign,
  Package, Users, Building2, RefreshCw, BarChart3,
} from "lucide-react";
import {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getBranchesReport,
  getFinancialReport,
} from "@/lib/analytics.functions";

export const Route = createFileRoute("/_admin/admin/reports/$sub")({
  component: ReportsPage,
});

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
  return <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-section whitespace-nowrap">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-5 py-3.5 text-sm whitespace-nowrap ${className}`}>{children}</td>;
}

function KPICard({ label, value, icon: Icon, color = "primary" }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>; color?: string;
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

function exportCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => {
        const val = r[h] ?? "";
        const str = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Sales Report ──────────────────────────────────────── */
function SalesReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "sales"], queryFn: () => getSalesReport() });
  if (isLoading) return <Loader />;

  const handleExport = () => {
    const rows = (data?.orders ?? []).map((o: any) => ({
      "Order #": o.order_number,
      "Customer": o.shipping_name || "",
      "Branch": (o.branches as any)?.name ?? "",
      "Status": o.status,
      "Payment Method": o.payment_method,
      "Total (KES)": Number(o.total),
      "Date": new Date(o.created_at).toLocaleDateString(),
    }));
    exportCSV("sales_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Total Revenue" value={kes(data?.totalRevenue ?? 0)} icon={DollarSign} color="primary" />
        <KPICard label="Completed Revenue" value={kes(data?.completedRevenue ?? 0)} icon={TrendingUp} color="success" />
        <KPICard label="Total Orders" value={String(data?.orders?.length ?? 0)} icon={BarChart3} color="conversion" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Sales Transactions</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <TableWrap>
          <thead><tr><Th>Order #</Th><Th>Customer</Th><Th>Branch</Th><Th>Status</Th><Th>Payment</Th><Th>Total</Th><Th>Date</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.orders?.map((o: any) => (
              <tr key={o.id} className="hover:bg-section/30">
                <Td><span className="font-mono text-xs font-bold">{o.order_number}</span></Td>
                <Td>{o.shipping_name || "—"}</Td>
                <Td className="text-muted-foreground">{(o.branches as any)?.name ?? "—"}</Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[o.status] ?? "bg-muted"}`}>{o.status}</span></Td>
                <Td className="capitalize text-muted-foreground">{o.payment_method}</Td>
                <Td><span className="font-black">{kes(Number(o.total))}</span></Td>
                <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Inventory Report ──────────────────────────────────── */
function InventoryReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "inventory"], queryFn: () => getInventoryReport() });
  if (isLoading) return <Loader />;

  const handleExport = () => {
    const rows = (data?.products ?? []).map((p: any) => ({
      "Product": p.name,
      "Category": (p.categories as any)?.name ?? "",
      "Price (KES)": Number(p.price),
      "Stock": p.stock ?? 0,
      "Stock Value (KES)": Number(p.price) * (p.stock ?? 0),
      "Status": p.is_active ? "Active" : "Inactive",
    }));
    exportCSV("inventory_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Total Products" value={String(data?.totalProducts ?? 0)} icon={Package} color="primary" />
        <KPICard label="Out of Stock" value={String(data?.outOfStock ?? 0)} icon={TrendingDown} color="error" />
        <KPICard label="Low Stock" value={String(data?.lowStock ?? 0)} icon={TrendingDown} color="warning" />
        <KPICard label="Stock Value" value={kes(data?.totalStockValue ?? 0)} icon={DollarSign} color="success" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Product Inventory</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <TableWrap>
          <thead><tr><Th>Product</Th><Th>Category</Th><Th>Price</Th><Th>Stock</Th><Th>Stock Value</Th><Th>Status</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.products?.map((p: any) => (
              <tr key={p.id} className="hover:bg-section/30">
                <Td><span className="font-semibold">{p.name}</span></Td>
                <Td className="text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                <Td className="font-bold">{kes(Number(p.price))}</Td>
                <Td>
                  <span className={`font-black text-sm ${(p.stock ?? 0) === 0 ? "text-error" : (p.stock ?? 0) < 10 ? "text-warning" : "text-success"}`}>
                    {p.stock ?? 0}
                  </span>
                </Td>
                <Td className="font-bold">{kes(Number(p.price) * (p.stock ?? 0))}</Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{p.is_active ? "Active" : "Inactive"}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Customers Report ──────────────────────────────────── */
function CustomersReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "customers"], queryFn: () => getCustomersReport() });
  if (isLoading) return <Loader />;

  const handleExport = () => {
    const rows = (data?.customers ?? []).map((c: any) => ({
      "Name": c.full_name || "",
      "Username": c.username || "",
      "Branch": (c.branches as any)?.name ?? "",
      "Total Spend (KES)": c.totalSpend ?? 0,
      "Orders": c.orderCount ?? 0,
      "Joined": new Date(c.created_at).toLocaleDateString(),
    }));
    exportCSV("customers_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Total Customers" value={String(data?.total ?? 0)} icon={Users} color="primary" />
        <KPICard label="Customers Registered" value={String(data?.total ?? 0)} icon={TrendingUp} color="success" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Customer Registry</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <TableWrap>
          <thead><tr><Th>Name</Th><Th>Username</Th><Th>Branch</Th><Th>Total Spend</Th><Th>Orders</Th><Th>Joined</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.customers?.map((c: any) => (
              <tr key={c.id} className="hover:bg-section/30">
                <Td><span className="font-semibold">{c.full_name || "—"}</span></Td>
                <Td className="text-muted-foreground">@{c.username || "—"}</Td>
                <Td className="text-muted-foreground">{(c.branches as any)?.name ?? "—"}</Td>
                <Td><span className="font-black text-success">{kes(c.totalSpend ?? 0)}</span></Td>
                <Td className="font-bold text-primary">{c.orderCount}</Td>
                <Td className="text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Branches Report ───────────────────────────────────── */
function BranchesReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "branches"], queryFn: () => getBranchesReport() });
  if (isLoading) return <Loader />;

  const handleExport = () => {
    const rows = (data?.branches ?? []).map((b: any) => ({
      "Branch": b.name,
      "Address": b.address || "",
      "Phone": b.phone || "",
      "Orders": b.orders,
      "Revenue (KES)": b.revenue,
      "Staff": b.staff,
      "Completion Rate": `${b.completionRate}%`,
      "Status": b.is_active ? "Active" : "Inactive",
    }));
    exportCSV("branches_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <KPICard label="Total Branches" value={String(data?.branches?.length ?? 0)} icon={Building2} color="primary" />
        <KPICard label="Active Branches" value={String((data?.branches ?? []).filter((b: any) => b.is_active).length)} icon={TrendingUp} color="success" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Branch Performance Report</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <TableWrap>
          <thead><tr><Th>Branch</Th><Th>Address</Th><Th>Phone</Th><Th>Orders</Th><Th>Revenue</Th><Th>Staff</Th><Th>Completion</Th><Th>Status</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.branches?.map((b: any) => (
              <tr key={b.id} className="hover:bg-section/30">
                <Td><span className="font-black">{b.name}</span></Td>
                <Td className="text-muted-foreground text-xs">{b.address || "—"}</Td>
                <Td className="text-muted-foreground">{b.phone || "—"}</Td>
                <Td className="font-bold text-primary">{b.orders}</Td>
                <Td><span className="font-black">{kes(b.revenue)}</span></Td>
                <Td>{b.staff}</Td>
                <Td><span className="font-bold text-success">{b.completionRate}%</span></Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${b.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>{b.is_active ? "Active" : "Inactive"}</span></Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Financial Report ──────────────────────────────────── */
function FinancialReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "financial"], queryFn: () => getFinancialReport() });
  if (isLoading) return <Loader />;

  const handleExport = () => {
    const rows = (data?.orders ?? []).map((o: any) => ({
      "Order #": o.order_number,
      "Payment Method": o.payment_method || "",
      "Payment Status": o.payment_status || "pending",
      "Order Status": o.status,
      "Amount (KES)": Number(o.total),
      "Date": new Date(o.created_at).toLocaleDateString(),
    }));
    exportCSV("financial_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Gross Revenue" value={kes(data?.totalGross ?? 0)} icon={DollarSign} color="primary" />
        <KPICard label="Paid / Collected" value={kes(data?.paid ?? 0)} icon={TrendingUp} color="success" />
        <KPICard label="Outstanding" value={kes(data?.pending ?? 0)} icon={TrendingDown} color="warning" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>Financial Transactions</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <TableWrap>
          <thead><tr><Th>Order #</Th><Th>Payment Method</Th><Th>Payment Status</Th><Th>Order Status</Th><Th>Amount</Th><Th>Date</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.orders?.map((o: any) => (
              <tr key={o.id} className="hover:bg-section/30">
                <Td><span className="font-mono text-xs font-bold">{o.order_number}</span></Td>
                <Td className="capitalize text-muted-foreground">{o.payment_method || "—"}</Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${o.payment_status === "paid" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{o.payment_status || "pending"}</span></Td>
                <Td><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${statusColors[o.status] ?? "bg-muted"}`}>{o.status}</span></Td>
                <Td><span className="font-black">{kes(Number(o.total))}</span></Td>
                <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Tax Report ────────────────────────────────────────── */
function TaxReport() {
  const { data, isLoading } = useQuery({ queryKey: ["report", "sales"], queryFn: () => getSalesReport() });
  if (isLoading) return <Loader />;
  const est16 = (data?.totalRevenue ?? 0) * 0.16;

  const handleExport = () => {
    const rows = (data?.orders ?? []).slice(0, 200).map((o: any) => ({
      "Order #": o.order_number,
      "Date": new Date(o.created_at).toLocaleDateString(),
      "Total (KES)": Number(o.total),
      "VAT 16% (KES)": (Number(o.total) * 0.16).toFixed(2),
    }));
    exportCSV("tax_report.csv", rows);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="Gross Revenue" value={kes(data?.totalRevenue ?? 0)} icon={DollarSign} color="primary" />
        <KPICard label="Est. VAT (16%)" value={kes(est16)} icon={BarChart3} color="warning" />
        <KPICard label="Net Revenue" value={kes((data?.totalRevenue ?? 0) - est16)} icon={TrendingUp} color="success" />
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-section/40 font-black text-sm uppercase tracking-wider flex items-center justify-between">
          <span>VAT Breakdown by Order</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Export CSV
          </button>
        </div>
        <p className="text-xs text-muted-foreground px-5 py-3 border-b border-border bg-section/20">Tax calculations are estimates at 16% VAT. Consult your accountant for official filings.</p>
        <TableWrap>
          <thead><tr><Th>Order #</Th><Th>Date</Th><Th>Order Total</Th><Th>VAT (16%)</Th><Th>Net</Th></tr></thead>
          <tbody className="divide-y divide-border">
            {data?.orders?.slice(0, 200).map((o: any) => {
              const total = Number(o.total);
              const vat = total * 0.16;
              return (
                <tr key={o.id} className="hover:bg-section/30">
                  <Td><span className="font-mono text-xs font-bold">{o.order_number}</span></Td>
                  <Td className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</Td>
                  <Td><span className="font-bold">{kes(total)}</span></Td>
                  <Td><span className="text-warning font-black">{kes(vat)}</span></Td>
                  <Td><span className="text-success font-black">{kes(total - vat)}</span></Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}

/* ─── Exports Hub ───────────────────────────────────────── */
function ExportsReport() {
  const { data: salesData } = useQuery({ queryKey: ["report", "sales"], queryFn: () => getSalesReport() });
  const { data: invData } = useQuery({ queryKey: ["report", "inventory"], queryFn: () => getInventoryReport() });
  const { data: custData } = useQuery({ queryKey: ["report", "customers"], queryFn: () => getCustomersReport() });
  const { data: branchData } = useQuery({ queryKey: ["report", "branches"], queryFn: () => getBranchesReport() });
  const { data: finData } = useQuery({ queryKey: ["report", "financial"], queryFn: () => getFinancialReport() });

  const reports = [
    {
      label: "Sales Report", description: "All sales transactions with status, payment and totals",
      icon: FileText, color: "primary",
      onExport: () => exportCSV("sales_report.csv", (salesData?.orders ?? []).map((o: any) => ({
        "Order #": o.order_number, "Customer": o.shipping_name || "", "Status": o.status,
        "Payment": o.payment_method, "Total (KES)": Number(o.total),
        "Date": new Date(o.created_at).toLocaleDateString(),
      }))),
    },
    {
      label: "Inventory Report", description: "All products with stock levels and values",
      icon: Package, color: "success",
      onExport: () => exportCSV("inventory_report.csv", (invData?.products ?? []).map((p: any) => ({
        "Product": p.name, "Category": (p.categories as any)?.name ?? "",
        "Price (KES)": Number(p.price), "Stock": p.stock ?? 0,
        "Stock Value (KES)": Number(p.price) * (p.stock ?? 0), "Status": p.is_active ? "Active" : "Inactive",
      }))),
    },
    {
      label: "Customer Registry", description: "All customers with order counts and spend",
      icon: Users, color: "conversion",
      onExport: () => exportCSV("customers_report.csv", (custData?.customers ?? []).map((c: any) => ({
        "Name": c.full_name || "", "Username": c.username || "",
        "Total Spend (KES)": c.totalSpend ?? 0, "Orders": c.orderCount ?? 0,
        "Joined": new Date(c.created_at).toLocaleDateString(),
      }))),
    },
    {
      label: "Branch Performance", description: "Revenue, orders and staff per branch",
      icon: Building2, color: "warning",
      onExport: () => exportCSV("branches_report.csv", (branchData?.branches ?? []).map((b: any) => ({
        "Branch": b.name, "Orders": b.orders, "Revenue (KES)": b.revenue,
        "Staff": b.staff, "Completion %": b.completionRate,
      }))),
    },
    {
      label: "Financial Transactions", description: "Payment status, method and amounts per order",
      icon: DollarSign, color: "primary",
      onExport: () => exportCSV("financial_report.csv", (finData?.orders ?? []).map((o: any) => ({
        "Order #": o.order_number, "Payment Method": o.payment_method || "",
        "Payment Status": o.payment_status || "pending", "Order Status": o.status,
        "Amount (KES)": Number(o.total), "Date": new Date(o.created_at).toLocaleDateString(),
      }))),
    },
    {
      label: "Tax Summary (VAT 16%)", description: "Estimated VAT breakdown across all orders",
      icon: BarChart3, color: "error",
      onExport: () => exportCSV("tax_report.csv", (salesData?.orders ?? []).map((o: any) => ({
        "Order #": o.order_number, "Date": new Date(o.created_at).toLocaleDateString(),
        "Total (KES)": Number(o.total),
        "VAT 16% (KES)": (Number(o.total) * 0.16).toFixed(2),
        "Net (KES)": (Number(o.total) * 0.84).toFixed(2),
      }))),
    },
  ] as const;

  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    conversion: "bg-conversion/10 text-conversion",
    error: "bg-error/10 text-error",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Download any report as a CSV file for offline analysis in Excel, Google Sheets, or accounting software.</p>
      {reports.map((r) => (
        <div key={r.label} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-xl grid place-items-center ${colorMap[r.color]}`}>
              <r.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm">{r.label}</div>
              <div className="text-xs text-muted-foreground">{r.description}</div>
            </div>
          </div>
          <button
            onClick={r.onExport}
            className="flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />Download
          </button>
        </div>
      ))}
    </div>
  );
}

const REPORT_TABS: Record<string, React.ComponentType> = {
  sales: SalesReport,
  inventory: InventoryReport,
  customers: CustomersReport,
  branches: BranchesReport,
  financial: FinancialReport,
  tax: TaxReport,
  exports: ExportsReport,
};

function ReportsPage() {
  const { sub } = Route.useParams();
  const TabContent = REPORT_TABS[sub] ?? SalesReport;
  const title = sub.charAt(0).toUpperCase() + sub.slice(1);

  return (
    <AdminShell title={`Reports — ${title}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight">{title} Report</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time data from your Supabase database.</p>
          </div>
        </div>
        <TabContent />
      </div>
    </AdminShell>
  );
}
