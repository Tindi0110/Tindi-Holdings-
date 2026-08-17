import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Shield,
  Activity,
  Database,
  Server,
  ShoppingCart,
  Package,
  Users,
  Loader2,
  Lock,
  Key,
  CreditCard,
  Truck,
  FileText,
  Bell,
  Sliders,
  Check,
  RefreshCw,
  Download,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Pencil,
  Eye,
  Send,
  Building,
  Radio,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listSystemUsers,
  updateUserRole,
  getDetailedSystemLogs,
  getDashboardMetrics,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_admin/admin/system/$category/$sub")({
  component: SystemSubPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-muted-foreground bg-muted/20 whitespace-nowrap">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 text-sm whitespace-nowrap ${className}`}>{children}</td>;
}

function SystemSubPage() {
  const { category, sub } = Route.useParams();
  const queryClient = useQueryClient();

  const subTitle = sub
    .replace(/-/g, " ")
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // 1. Users & Roles Queries
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "system", "users"],
    queryFn: () => listSystemUsers(),
    enabled: category === "users",
  });

  // 2. Logs Queries
  const { data: logsData = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["admin", "system", "logs"],
    queryFn: () => getDetailedSystemLogs(),
    enabled: category === "logs" || sub === "logs",
  });

  // 3. Metrics Query
  const { data: metrics } = useQuery({
    queryKey: ["admin", "dashboard", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });

  // User Role Mutation
  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "manager" | "staff" | "customer" }) =>
      updateUserRole({ data: vars }),
    onSuccess: () => {
      toast.success("User role updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    companyName: "Tindi Holdings Group",
    legalName: "Tindi Group Limited (Kenya)",
    email: "contact@tindiholdings.co.ke",
    phone: "+254 700 000 000",
    currency: "KES",
    timezone: "Africa/Nairobi (EAT)",
    address: "Westlands Commercial Centre, Nairobi, Kenya",
    vatPin: "P051234567Z",
    // Store
    multiBranch: true,
    autoReceipts: true,
    guestCheckout: true,
    cancelWindow: "30",
    lowStockThreshold: "10",
    // M-Pesa
    mpesaShortcode: "174379",
    mpesaType: "Paybill",
    mpesaEnv: "sandbox",
    codEnabled: true,
    cardEnabled: true,
    // Shipping
    nairobiExpressRate: "500",
    standardRate: "300",
    freeShippingThreshold: "5000",
    // Tax
    vatRate: "16",
    etimsDeviceId: "ETIMS-KE-98234-TH",
    autoETIMS: true,
    // Notifications
    smsGateway: "AfricasTalking",
    notifyOrderPlaced: true,
    notifyOutForDelivery: true,
    notifyDelivered: true,
    // Security
    twoFactorEnforced: true,
    sessionTimeout: "30",
    rateLimit: "120",
  });

  const [logFilter, setLogFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");

  const filteredLogs = logsData.filter((l: any) => {
    if (logFilter !== "all" && l.level.toLowerCase() !== logFilter.toLowerCase()) return false;
    if (logSearch && !l.action.toLowerCase().includes(logSearch.toLowerCase()) && !l.details.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  const exportLogsCSV = () => {
    const header = "Timestamp,Level,Category,Action,Details\n";
    const rows = filteredLogs
      .map((l: any) => `"${l.timestamp}","${l.level}","${l.category}","${l.action.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system_logs_${sub}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported to CSV");
  };

  return (
    <AdminShell title={`System: ${subTitle}`}>
      <div className="space-y-6">
        {/* Header telemetry banner */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Module</span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{category} / {sub}</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">{subTitle} Telemetry</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20 w-fit">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-black text-success uppercase">Node Online</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. USERS & ROLES CATEGORY
           ══════════════════════════════════════════════════════════ */}
        {category === "users" && (
          <div className="space-y-6">
            {/* Top KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Admins</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.admins?.length ?? 0}</div>
                <p className="text-[11px] text-primary font-semibold mt-0.5">Full Superuser Access</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Managers</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.managers?.length ?? 0}</div>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Branch Operations</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Staff & Cashiers</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.staff?.length ?? 0}</div>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Front-line POS Access</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Directory</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.users?.length ?? 0}</div>
                <p className="text-[11px] text-success font-semibold mt-0.5">Registered Accounts</p>
              </div>
            </div>

            {/* Sub View: Admin / Managers / Staff / Roles Table */}
            {(sub === "admin" || sub === "managers" || sub === "staff" || sub === "roles") && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {sub === "admin" ? "Superuser Administrators" : sub === "managers" ? "Store Managers" : sub === "staff" ? "Branch Staff" : "All Directory Users"}
                  </h3>
                </div>

                {usersLoading ? (
                  <div className="bg-card border border-border rounded-2xl p-12 text-center text-xs text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading users...
                  </div>
                ) : (
                  <TableWrap>
                    <thead>
                      <tr>
                        <Th>User Profile</Th>
                        <Th>User ID</Th>
                        <Th>Role</Th>
                        <Th>Assigned Branch</Th>
                        <Th>Created Date</Th>
                        <Th>Manage Role</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(sub === "admin" ? usersData?.admins : sub === "managers" ? usersData?.managers : sub === "staff" ? usersData?.staff : usersData?.users)?.map((u: any) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <Td className="font-bold flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary font-black grid place-items-center text-xs shrink-0">
                              {u.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.full_name}</span>
                          </Td>
                          <Td className="font-mono text-xs text-muted-foreground">{u.id.slice(0, 8)}...</Td>
                          <Td>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                              u.role === "admin" ? "bg-primary/10 text-primary border border-primary/20" :
                              u.role === "manager" ? "bg-warning/10 text-warning border border-warning/20" :
                              u.role === "staff" ? "bg-success/10 text-success border border-success/20" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {u.role}
                            </span>
                          </Td>
                          <Td className="font-medium text-xs">{u.branch}</Td>
                          <Td className="font-mono text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</Td>
                          <Td>
                            <select
                              value={u.role}
                              onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                              className="h-8 px-2.5 rounded-lg border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                              <option value="customer">Customer</option>
                            </select>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </TableWrap>
                )}
              </div>
            )}

            {/* Sub View: Permissions Matrix */}
            {sub === "permissions" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Role Access Control Matrix (RBAC)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Granular permission breakdown by assigned security tier.</p>
                </div>
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Capability / Action</Th>
                      <Th>Admin (Super)</Th>
                      <Th>Manager</Th>
                      <Th>Staff / Cashier</Th>
                      <Th>Customer</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { cap: "View Dashboard & Reports", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Create & Update Products", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Process In-Store POS Orders", admin: true, manager: true, staff: true, customer: false },
                      { cap: "Approve Stock Transfers", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Generate KRA eTIMS Receipts", admin: true, manager: true, staff: true, customer: false },
                      { cap: "Issue Customer Refunds", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Manage System Settings & API Keys", admin: true, manager: false, staff: false, customer: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10">
                        <Td className="font-bold">{row.cap}</Td>
                        <Td>{row.admin ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.manager ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.staff ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.customer ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : <span className="text-xs text-muted-foreground">Restricted</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            2. SETTINGS CATEGORY
           ══════════════════════════════════════════════════════════ */}
        {category === "settings" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm max-w-4xl">
            {/* General Settings */}
            {sub === "general" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Enterprise Identity & Localization</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Primary business contact information displayed on official documents.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Company Trade Name">
                    <input value={settingsForm.companyName} onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Legal Entity Name">
                    <input value={settingsForm.legalName} onChange={(e) => setSettingsForm({ ...settingsForm, legalName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Support Email Address">
                    <input value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Official Phone Line">
                    <input value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Default Currency">
                    <input value={settingsForm.currency} disabled className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-sm font-bold text-primary cursor-not-allowed" />
                  </Field>
                  <Field label="System Timezone">
                    <input value={settingsForm.timezone} disabled className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-sm font-mono cursor-not-allowed" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="Physical Headquarters">
                      <input value={settingsForm.address} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* Store Settings */}
            {sub === "store" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Commerce & Inventory Policies</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Control multi-branch logic, receipting, and order cancellation windows.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Multi-Branch Real-Time Sync</div>
                      <div className="text-[10px] text-muted-foreground">Route orders to nearest branch automatically</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.multiBranch} onChange={(e) => setSettingsForm({ ...settingsForm, multiBranch: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Auto Digital Receipt Signing</div>
                      <div className="text-[10px] text-muted-foreground">Generate KRA-compliant receipt upon payment</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.autoReceipts} onChange={(e) => setSettingsForm({ ...settingsForm, autoReceipts: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                  <Field label="Customer Cancellation Window (Minutes)">
                    <input type="number" value={settingsForm.cancelWindow} onChange={(e) => setSettingsForm({ ...settingsForm, cancelWindow: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Low Stock Warning Alert Level">
                    <input type="number" value={settingsForm.lowStockThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, lowStockThreshold: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                </div>
              </div>
            )}

            {/* Payment (M-Pesa) Settings */}
            {sub === "payment" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">M-Pesa & Payment Gateway Integrations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Safaricom Daraja API configurations for STK push and C2B payments.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="M-Pesa Business Shortcode / Till">
                    <input value={settingsForm.mpesaShortcode} onChange={(e) => setSettingsForm({ ...settingsForm, mpesaShortcode: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Integration Mode">
                    <select value={settingsForm.mpesaEnv} onChange={(e) => setSettingsForm({ ...settingsForm, mpesaEnv: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="sandbox">Sandbox / Staging</option>
                      <option value="production">Production (Live Safaricom)</option>
                    </select>
                  </Field>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Accept Cash on Delivery</div>
                      <div className="text-[10px] text-muted-foreground">Allow payment upon physical handover</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.codEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Card Payments (Visa / Mastercard)</div>
                      <div className="text-[10px] text-muted-foreground">Direct debit / credit card processing</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.cardEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, cardEnabled: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Settings */}
            {sub === "shipping" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Logistics & Delivery Tariffs</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Define standard and expedited shipping costs across Kenya.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Nairobi Express Rate (KES)">
                    <input type="number" value={settingsForm.nairobiExpressRate} onChange={(e) => setSettingsForm({ ...settingsForm, nairobiExpressRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Upcountry Standard (KES)">
                    <input type="number" value={settingsForm.standardRate} onChange={(e) => setSettingsForm({ ...settingsForm, standardRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="Free Shipping Threshold (KES)">
                    <input type="number" value={settingsForm.freeShippingThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold text-success outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                </div>
              </div>
            )}

            {/* Tax Settings */}
            {sub === "tax" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Tax & KRA eTIMS Compliance</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Kenya Revenue Authority automated compliance and invoicing parameters.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Standard VAT Rate (%)">
                    <input value={settingsForm.vatRate} onChange={(e) => setSettingsForm({ ...settingsForm, vatRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold text-primary outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                  <Field label="eTIMS Control Device Identifier">
                    <input value={settingsForm.etimsDeviceId} onChange={(e) => setSettingsForm({ ...settingsForm, etimsDeviceId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/20" />
                  </Field>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {sub === "notifications" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Automated SMS & Email Triggers</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Customer notification dispatch rules for order milestones.</p>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">SMS on Order Confirmation</div>
                      <div className="text-[10px] text-muted-foreground">Send SMS receipt with tracking number immediately</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.notifyOrderPlaced} onChange={(e) => setSettingsForm({ ...settingsForm, notifyOrderPlaced: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">SMS on Out for Delivery</div>
                      <div className="text-[10px] text-muted-foreground">Notify customer when rider is en route</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.notifyOutForDelivery} onChange={(e) => setSettingsForm({ ...settingsForm, notifyOutForDelivery: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {sub === "security" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Access Security & Session Controls</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Enforce administrative 2FA and idle session timeouts.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold">Enforce 2FA for Admin Role</div>
                      <div className="text-[10px] text-muted-foreground">Require OTP upon logging into admin area</div>
                    </div>
                    <input type="checkbox" checked={settingsForm.twoFactorEnforced} onChange={(e) => setSettingsForm({ ...settingsForm, twoFactorEnforced: e.target.checked })} className="h-5 w-5 rounded text-primary" />
                  </div>
                  <Field label="Inactivity Logout (Minutes)">
                    <select value={settingsForm.sessionTimeout} onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeout: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* API Settings */}
            {sub === "api" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Webhooks & API Endpoint Keys</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Integrate third-party logistics and CRM endpoints.</p>
                </div>
                <div className="space-y-4">
                  <Field label="M-Pesa Webhook Endpoint">
                    <input readOnly value="https://tindi-holdings.co.ke/api/public/webhooks/mpesa" className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs font-mono select-all" />
                  </Field>
                  <Field label="Public Catalog API Key">
                    <input readOnly value="pk_live_tindi_839201948201938" className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs font-mono select-all" />
                  </Field>
                  <Button onClick={() => toast.success("Test webhook ping dispatched with 200 OK")} variant="outline" className="rounded-xl font-bold text-xs">
                    Send Test Webhook Ping
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={() => toast.success("Settings saved successfully")} className="rounded-xl bg-primary text-primary-foreground font-black px-6 h-11 uppercase text-xs tracking-wider">
                Save Configurations
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. SYSTEM LOGS CATEGORY
           ══════════════════════════════════════════════════════════ */}
        {(category === "logs" || sub === "logs") && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-64"
                  />
                </div>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Levels</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => refetchLogs()} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                  <RefreshCw className={`h-3.5 w-3.5 ${logsLoading ? "animate-spin" : ""}`} /> Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={exportLogsCSV} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>

            {logsLoading ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading telemetry logs...
              </div>
            ) : (
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Timestamp</Th>
                    <Th>Level</Th>
                    <Th>Category</Th>
                    <Th>Event Action</Th>
                    <Th>Context / Details</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">No matching system logs found.</td></tr>
                  )}
                  {filteredLogs.map((l: any) => (
                    <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                      <Td className="font-mono text-xs text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</Td>
                      <Td>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          l.level === "ERROR" ? "bg-error/10 text-error border border-error/20" :
                          l.level === "WARN" ? "bg-warning/10 text-warning border border-warning/20" :
                          "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {l.level}
                        </span>
                      </Td>
                      <Td className="font-bold text-xs uppercase tracking-wider">{l.category}</Td>
                      <Td className="font-bold text-foreground">{l.action}</Td>
                      <Td className="text-xs text-muted-foreground">{l.details}</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
