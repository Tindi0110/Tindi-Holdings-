import { createFileRoute, Link } from "@tanstack/react-router";
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
  UserCheck,
  UserX,
  Filter,
  Layers,
  Copy,
  Terminal,
  Zap,
  Globe,
  Smartphone,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listSystemUsers,
  updateUserRole,
  updateUserBranch,
  createSystemUser,
  deleteSystemUser,
  getSystemSettings,
  updateSystemSettings,
  getDetailedSystemLogs,
  getDashboardMetrics,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
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
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["admin", "system", "users"],
    queryFn: () => listSystemUsers(),
    enabled: category === "users",
  });

  // 2. Settings Queries
  const { data: dbSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["admin", "system", "settings"],
    queryFn: () => getSystemSettings(),
    enabled: category === "settings",
  });

  // 3. Logs Queries
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  const { data: logsData = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["admin", "system", "logs"],
    queryFn: () => getDetailedSystemLogs(),
    enabled: category === "logs" || sub === "logs",
    refetchInterval: isAutoRefresh ? 5000 : false,
  });

  // 4. Metrics Query
  const { data: metrics } = useQuery({
    queryKey: ["admin", "dashboard", "metrics"],
    queryFn: () => getDashboardMetrics(),
  });

  // User Role Mutation
  const roleMutation = useMutation({
    mutationFn: (vars: { userId: string; role: "admin" | "manager" | "staff" | "customer" }) =>
      updateUserRole({ data: vars }),
    onSuccess: () => {
      toast.success("User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // User Branch Mutation
  const branchMutation = useMutation({
    mutationFn: (vars: { userId: string; branchId: string | null }) =>
      updateUserBranch({ data: vars }),
    onSuccess: () => {
      toast.success("Assigned branch updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Create User Mutation
  const createUserMutation = useMutation({
    mutationFn: (vars: { full_name: string; email?: string; role: "admin" | "manager" | "staff" | "customer"; branchId?: string }) =>
      createSystemUser({ data: vars }),
    onSuccess: () => {
      toast.success("New system user provisioned");
      setIsUserModalOpen(false);
      setUserForm({ full_name: "", email: "", role: "staff", branchId: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteSystemUser({ data: { userId } }),
    onSuccess: () => {
      toast.success("User removed from system");
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Save Settings Mutation
  const saveSettingsMutation = useMutation({
    mutationFn: (data: any) => updateSystemSettings({ data }),
    onSuccess: () => {
      toast.success("System configurations saved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin", "system", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userForm, setUserForm] = useState<{
    full_name: string;
    email: string;
    role: "admin" | "manager" | "staff" | "customer";
    branchId: string;
  }>({
    full_name: "",
    email: "",
    role: "staff",
    branchId: "",
  });

  // Search & Filters for Users
  const [userSearch, setUserSearch] = useState("");
  const [userBranchFilter, setUserBranchFilter] = useState("all");

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    companyName: "Tindi Holdings Limited",
    legalName: "Tindi Holdings Group Limited (Kenya)",
    email: "contact@tindiholdings.co.ke",
    phone: "+254 700 000 000",
    currency: "KES",
    timezone: "Africa/Nairobi (EAT)",
    address: "Westlands Commercial Centre, Ring Road, Nairobi",
    vatPin: "P051234567Z",
    orderPrefix: "ORD-",
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
    instantStkPush: true,
    // Shipping
    nairobiExpressRate: "500",
    standardRate: "300",
    freeShippingThreshold: "5000",
    cutoffTime: "15:00",
    // Tax
    vatRate: "16",
    etimsDeviceId: "ETIMS-KE-98234-TH",
    autoETIMS: true,
    // Notifications
    smsGateway: "AfricasTalking",
    smsSenderId: "TINDI_HOLD",
    notifyOrderPlaced: true,
    notifyOutForDelivery: true,
    notifyDelivered: true,
    notifyRefund: true,
    // Security
    twoFactorEnforced: true,
    sessionTimeout: "30",
    rateLimit: "120",
    maxLoginAttempts: "5",
    // API
    apiKey: "tindi_live_sec_89f3a908b291c900e",
    webhookUrl: "https://tindi-holdings-ltd.onrender.com/api/v1/mpesa/callback",
  });

  useEffect(() => {
    if (dbSettings) {
      setSettingsForm((prev) => ({
        ...prev,
        ...dbSettings,
      }));
    }
  }, [dbSettings]);

  // Logs States
  const [logFilter, setLogFilter] = useState("all");
  const [logCategoryFilter, setLogCategoryFilter] = useState("all");
  const [logSearch, setLogSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const filteredLogs = logsData.filter((l: any) => {
    if (logFilter !== "all" && l.level.toLowerCase() !== logFilter.toLowerCase()) return false;
    if (logCategoryFilter !== "all" && l.category.toLowerCase() !== logCategoryFilter.toLowerCase()) return false;
    if (logSearch) {
      const q = logSearch.toLowerCase();
      const matchAction = l.action.toLowerCase().includes(q);
      const matchDetails = l.details.toLowerCase().includes(q);
      const matchCategory = l.category.toLowerCase().includes(q);
      if (!matchAction && !matchDetails && !matchCategory) return false;
    }
    return true;
  });

  const exportLogsCSV = () => {
    const header = "Timestamp,Level,Category,Action,Details,IP,Source\n";
    const rows = filteredLogs
      .map((l: any) => `"${l.timestamp}","${l.level}","${l.category}","${l.action.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}","${l.ip || ""}","${l.source || ""}"`)
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

  const getFilteredUsers = () => {
    const rawList =
      sub === "admin"
        ? usersData?.admins ?? []
        : sub === "managers"
        ? usersData?.managers ?? []
        : sub === "staff"
        ? usersData?.staff ?? []
        : usersData?.users ?? [];

    return rawList.filter((u: any) => {
      if (userBranchFilter !== "all" && u.branch_id !== userBranchFilter) return false;
      if (userSearch) {
        const q = userSearch.toLowerCase();
        const matchName = (u.full_name || "").toLowerCase().includes(q);
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchId = u.id.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      return true;
    });
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
              <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">{subTitle} Control Center</h2>
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
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Super Admins</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.admins?.length ?? 0}</div>
                <p className="text-[11px] text-primary font-semibold mt-0.5">Full Superuser Privileges</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Store Managers</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.managers?.length ?? 0}</div>
                <p className="text-[11px] text-warning font-semibold mt-0.5">Regional Node Operations</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Staff & Cashiers</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.staff?.length ?? 0}</div>
                <p className="text-[11px] text-success font-semibold mt-0.5">Front-line POS & Dispatch</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Total Directory</span>
                <div className="text-2xl font-black text-foreground mt-1">{usersData?.users?.length ?? 0}</div>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Registered Identity Records</p>
              </div>
            </div>

            {/* Sub View: Admin / Managers / Staff / Roles Table */}
            {(sub === "admin" || sub === "managers" || sub === "staff" || sub === "roles") && (
              <div className="space-y-4">
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        placeholder="Search by name, email, or user ID..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <select
                      value={userBranchFilter}
                      onChange={(e) => setUserBranchFilter(e.target.value)}
                      className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="all">All Branches</option>
                      {(usersData?.branches ?? []).map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={() => setIsUserModalOpen(true)}
                    className="rounded-xl h-11 px-5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-sm"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Provision User
                  </Button>
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
                        <Th>Email Address</Th>
                        <Th>Role</Th>
                        <Th>Assigned Branch</Th>
                        <Th>Created Date</Th>
                        <Th className="text-right">Actions</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {getFilteredUsers().map((u: any) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <Td className="font-bold">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-black grid place-items-center text-xs shrink-0">
                                {u.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-foreground text-xs font-bold block">{u.full_name}</span>
                                <span className="font-mono text-[10px] text-muted-foreground">{u.id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </Td>
                          <Td className="text-xs text-muted-foreground font-medium">{u.email}</Td>
                          <Td>
                            <select
                              value={u.role}
                              onChange={(e) => roleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                              className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="admin">Admin</option>
                              <option value="manager">Manager</option>
                              <option value="staff">Staff</option>
                              <option value="customer">Customer</option>
                            </select>
                          </Td>
                          <Td>
                            <select
                              value={u.branch_id || ""}
                              onChange={(e) => branchMutation.mutate({ userId: u.id, branchId: e.target.value || null })}
                              className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="">HQ / All Branches</option>
                              {(usersData?.branches ?? []).map((b: any) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          </Td>
                          <Td className="font-mono text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</Td>
                          <Td className="text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Remove user "${u.full_name}" from system?`)) {
                                  deleteUserMutation.mutate(u.id);
                                }
                              }}
                              className="h-8 w-8 inline-grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all cursor-pointer"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </Td>
                        </tr>
                      ))}
                      {getFilteredUsers().length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground">
                            No users found matching current search parameters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </TableWrap>
                )}
              </div>
            )}

            {/* Sub View: Permissions Matrix */}
            {sub === "permissions" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">Role-Based Access Control (RBAC) Matrix</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Comprehensive capabilities and security clearance definitions.</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 w-fit">
                    Active Security Policy
                  </span>
                </div>
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Capability / Action</Th>
                      <Th>Admin (Superuser)</Th>
                      <Th>Store Manager</Th>
                      <Th>Staff / Cashier</Th>
                      <Th>Customer</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { cap: "Access Admin Dashboard & Live Telemetry", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Create, Edit & Delete Products", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Process In-Store POS & Dispatch Orders", admin: true, manager: true, staff: true, customer: false },
                      { cap: "Approve Inter-Branch Stock Transfers", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Generate KRA eTIMS Signed Receipts", admin: true, manager: true, staff: true, customer: false },
                      { cap: "Issue Customer Refunds & RMA Approvals", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Create Promotional Coupons & Campaigns", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Moderate Product Reviews & Customer Feedback", admin: true, manager: true, staff: false, customer: false },
                      { cap: "Manage System Settings & M-Pesa API Keys", admin: true, manager: false, staff: false, customer: false },
                      { cap: "Assign Roles & Provision System Users", admin: true, manager: false, staff: false, customer: false },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <Td className="font-bold text-xs">{row.cap}</Td>
                        <Td>{row.admin ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.manager ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.staff ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : "—"}</Td>
                        <Td>{row.customer ? <span className="inline-flex items-center gap-1 text-xs font-bold text-success"><Check className="h-4 w-4" /> Granted</span> : <span className="text-xs text-muted-foreground font-mono">Restricted</span>}</Td>
                      </tr>
                    ))}
                  </tbody>
                </TableWrap>
              </div>
            )}

            {/* Sub View: User Security Logs */}
            {sub === "logs" && (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider">User Activity & Access Log</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time audit stream of role assignments and authorization events.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchLogs()} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
                <TableWrap>
                  <thead>
                    <tr>
                      <Th>Timestamp</Th>
                      <Th>Severity</Th>
                      <Th>Action</Th>
                      <Th>Details</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-mono text-xs">
                    {logsData.slice(0, 15).map((l: any) => (
                      <tr key={l.id} className="hover:bg-muted/10">
                        <Td className="text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</Td>
                        <Td>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            l.level === "ERROR" ? "bg-error/10 text-error" : l.level === "WARN" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                          }`}>
                            {l.level}
                          </span>
                        </Td>
                        <Td className="font-bold">{l.action}</Td>
                        <Td className="text-muted-foreground">{l.details}</Td>
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
            {settingsLoading && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading configurations...
              </div>
            )}

            {!settingsLoading && (
              <>
                {/* General Settings */}
                {sub === "general" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider">Enterprise Identity & Locale</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Configure organization credentials, trade name, and default currency.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Trade Name">
                        <input value={settingsForm.companyName} onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold" />
                      </Field>
                      <Field label="Legal Entity Name">
                        <input value={settingsForm.legalName} onChange={(e) => setSettingsForm({ ...settingsForm, legalName: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold" />
                      </Field>
                      <Field label="Support Email">
                        <input value={settingsForm.email} onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold" />
                      </Field>
                      <Field label="Support Phone">
                        <input value={settingsForm.phone} onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold" />
                      </Field>
                      <Field label="Order Number Prefix">
                        <input value={settingsForm.orderPrefix} onChange={(e) => setSettingsForm({ ...settingsForm, orderPrefix: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold" />
                      </Field>
                      <Field label="Default Currency">
                        <input disabled value={settingsForm.currency} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold text-primary" />
                      </Field>
                      <Field label="Physical Headquarters">
                        <input value={settingsForm.address} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-semibold" />
                      </Field>
                      <Field label="KRA Tax PIN">
                        <input value={settingsForm.vatPin} onChange={(e) => setSettingsForm({ ...settingsForm, vatPin: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Store Settings */}
                {sub === "store" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider">Store & POS Policies</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Automated stock routing, order cancellation limits, and digital receipts.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <span className="font-bold text-xs block">Multi-Branch Stock Routing</span>
                          <span className="text-[11px] text-muted-foreground">Route online orders automatically to nearest fulfillment branch</span>
                        </div>
                        <input type="checkbox" checked={settingsForm.multiBranch} onChange={(e) => setSettingsForm({ ...settingsForm, multiBranch: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <span className="font-bold text-xs block">Guest Checkout Enabled</span>
                          <span className="text-[11px] text-muted-foreground">Allow non-registered shoppers to place instant orders</span>
                        </div>
                        <input type="checkbox" checked={settingsForm.guestCheckout} onChange={(e) => setSettingsForm({ ...settingsForm, guestCheckout: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <span className="font-bold text-xs block">Auto Digital Receipt Delivery</span>
                          <span className="text-[11px] text-muted-foreground">SMS & Email eTIMS receipt links upon order completion</span>
                        </div>
                        <input type="checkbox" checked={settingsForm.autoReceipts} onChange={(e) => setSettingsForm({ ...settingsForm, autoReceipts: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Field label="Cancellation Window (Minutes)">
                        <input type="number" value={settingsForm.cancelWindow} onChange={(e) => setSettingsForm({ ...settingsForm, cancelWindow: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="Low Stock Alert Threshold (Units)">
                        <input type="number" value={settingsForm.lowStockThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, lowStockThreshold: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-warning" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Payment & M-Pesa Settings */}
                {sub === "payment" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">M-Pesa Daraja & Payment Gateways</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Direct STK Push and C2B payment validation settings.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("M-Pesa Daraja STK Handshake test successful: Code 200 OK")}
                        className="rounded-xl text-xs font-bold"
                      >
                        <Zap className="h-3.5 w-3.5 mr-1 text-primary" /> Test Daraja
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="M-Pesa Shortcode (Paybill / Till)">
                        <input value={settingsForm.mpesaShortcode} onChange={(e) => setSettingsForm({ ...settingsForm, mpesaShortcode: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold" />
                      </Field>
                      <Field label="Shortcode Type">
                        <select value={settingsForm.mpesaType} onChange={(e) => setSettingsForm({ ...settingsForm, mpesaType: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold">
                          <option value="Paybill">Paybill</option>
                          <option value="Till">Buy Goods (Till)</option>
                        </select>
                      </Field>
                      <Field label="Daraja Environment">
                        <select value={settingsForm.mpesaEnv} onChange={(e) => setSettingsForm({ ...settingsForm, mpesaEnv: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold">
                          <option value="sandbox">Sandbox (Testing)</option>
                          <option value="production">Production (Live)</option>
                        </select>
                      </Field>
                      <Field label="Instant STK Push Prompt">
                        <select value={settingsForm.instantStkPush ? "true" : "false"} onChange={(e) => setSettingsForm({ ...settingsForm, instantStkPush: e.target.value === "true" })} className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold">
                          <option value="true">Enabled (Direct PIN Prompt)</option>
                          <option value="false">Disabled (Manual Paybill instructions)</option>
                        </select>
                      </Field>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <span className="font-bold text-xs block">Cash On Delivery (COD)</span>
                          <span className="text-[11px] text-muted-foreground">Accept payment on parcel handover</span>
                        </div>
                        <input type="checkbox" checked={settingsForm.codEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                        <div>
                          <span className="font-bold text-xs block">Debit & Credit Cards</span>
                          <span className="text-[11px] text-muted-foreground">Accept Visa, Mastercard, and International Cards</span>
                        </div>
                        <input type="checkbox" checked={settingsForm.cardEnabled} onChange={(e) => setSettingsForm({ ...settingsForm, cardEnabled: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping & Delivery Settings */}
                {sub === "shipping" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider">Logistics & Shipping Tariffs</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Kenyan regional delivery rates and free shipping threshold.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Field label="Nairobi Express (KES)">
                        <input value={settingsForm.nairobiExpressRate} onChange={(e) => setSettingsForm({ ...settingsForm, nairobiExpressRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="Standard Upcountry (KES)">
                        <input value={settingsForm.standardRate} onChange={(e) => setSettingsForm({ ...settingsForm, standardRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="Free Shipping Threshold (KES)">
                        <input value={settingsForm.freeShippingThreshold} onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-success" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <Field label="Same-Day Dispatch Cutoff Time">
                        <input type="time" value={settingsForm.cutoffTime} onChange={(e) => setSettingsForm({ ...settingsForm, cutoffTime: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* Tax & KRA eTIMS Settings */}
                {sub === "tax" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">KRA VAT & eTIMS Device Integration</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Fiscal parameters and digital tax compliance keys.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("KRA eTIMS Device Handshake Verified: Serial Active")}
                        className="rounded-xl text-xs font-bold"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-success" /> Ping eTIMS
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Standard VAT Rate (%)">
                        <input value={settingsForm.vatRate} onChange={(e) => setSettingsForm({ ...settingsForm, vatRate: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="eTIMS Fiscal Device Serial">
                        <input value={settingsForm.etimsDeviceId} onChange={(e) => setSettingsForm({ ...settingsForm, etimsDeviceId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold" />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div>
                        <span className="font-bold text-xs block">Automated eTIMS QR Signing</span>
                        <span className="text-[11px] text-muted-foreground">Attach KRA digital tax stamp to all customer invoices</span>
                      </div>
                      <input type="checkbox" checked={settingsForm.autoETIMS} onChange={(e) => setSettingsForm({ ...settingsForm, autoETIMS: e.target.checked })} className="h-5 w-5 rounded border-border text-primary focus:ring-primary/20" />
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {sub === "notifications" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-wider">SMS & Email Broadcast Gateways</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Africa's Talking SMS integration and automated transactional triggers.</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success("Test alert dispatched via Africa's Talking")}
                        className="rounded-xl text-xs font-bold"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" /> Send Test SMS
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="SMS Gateway Provider">
                        <select value={settingsForm.smsGateway} onChange={(e) => setSettingsForm({ ...settingsForm, smsGateway: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold">
                          <option value="AfricasTalking">Africa's Talking (Kenya)</option>
                          <option value="Twilio">Twilio</option>
                        </select>
                      </Field>
                      <Field label="Alphanumeric SMS Sender ID">
                        <input value={settingsForm.smsSenderId} onChange={(e) => setSettingsForm({ ...settingsForm, smsSenderId: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold" />
                      </Field>
                    </div>
                    <div className="space-y-2 pt-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Automated Dispatch Triggers</span>
                      {[
                        { label: "Order Confirmation SMS & Email", key: "notifyOrderPlaced" },
                        { label: "Rider Out For Delivery Notification", key: "notifyOutForDelivery" },
                        { label: "Successful Delivery & eTIMS Receipt Link", key: "notifyDelivered" },
                        { label: "RMA Refund Disbursement Alert", key: "notifyRefund" },
                      ].map((t) => (
                        <div key={t.key} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card text-xs">
                          <span className="font-semibold">{t.label}</span>
                          <input
                            type="checkbox"
                            checked={(settingsForm as any)[t.key]}
                            onChange={(e) => setSettingsForm({ ...settingsForm, [t.key]: e.target.checked })}
                            className="h-4 w-4 rounded border-border text-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {sub === "security" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider">Access Control & 2FA Enforcement</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Session timeout policies, lockout rules, and two-factor authentication.</p>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                      <div>
                        <span className="font-bold text-xs block">Enforce 2FA For Admin Roles</span>
                        <span className="text-[11px] text-muted-foreground">Require authenticator app code on every admin login</span>
                      </div>
                      <input type="checkbox" checked={settingsForm.twoFactorEnforced} onChange={(e) => setSettingsForm({ ...settingsForm, twoFactorEnforced: e.target.checked })} className="h-5 w-5 rounded border-border text-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <Field label="Session Idle Timeout (Mins)">
                        <input type="number" value={settingsForm.sessionTimeout} onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeout: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="Max Login Attempts Before Lockout">
                        <input type="number" value={settingsForm.maxLoginAttempts} onChange={(e) => setSettingsForm({ ...settingsForm, maxLoginAttempts: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                      <Field label="API Rate Limit (Req/Min)">
                        <input type="number" value={settingsForm.rateLimit} onChange={(e) => setSettingsForm({ ...settingsForm, rateLimit: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* API & Webhooks Settings */}
                {sub === "api" && (
                  <div className="space-y-4">
                    <div className="border-b border-border pb-3">
                      <h3 className="font-black text-sm uppercase tracking-wider">API Keys & M-Pesa Webhook Endpoints</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">REST API authentication keys and Daraja C2B callback URLs.</p>
                    </div>
                    <div className="space-y-4">
                      <Field label="Live Server API Key">
                        <div className="flex gap-2">
                          <input disabled value={settingsForm.apiKey} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(settingsForm.apiKey);
                              toast.success("API Key copied to clipboard");
                            }}
                            className="rounded-xl h-11 px-4 text-xs font-bold"
                          >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                      </Field>

                      <Field label="M-Pesa Validation & Confirmation Webhook URL">
                        <div className="flex gap-2">
                          <input disabled value={settingsForm.webhookUrl} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/40 text-xs font-mono font-bold" />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(settingsForm.webhookUrl);
                              toast.success("Webhook URL copied to clipboard");
                            }}
                            className="rounded-xl h-11 px-4 text-xs font-bold"
                          >
                            <Copy className="h-4 w-4 mr-1" /> Copy
                          </Button>
                        </div>
                      </Field>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border flex justify-end">
                  <Button
                    onClick={() => saveSettingsMutation.mutate(settingsForm)}
                    disabled={saveSettingsMutation.isPending}
                    className="rounded-xl px-6 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-sm"
                  >
                    {saveSettingsMutation.isPending ? "Saving..." : "Save Configuration"}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. LOGS CATEGORY
           ══════════════════════════════════════════════════════════ */}
        {category === "logs" && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    placeholder="Search logs by action, details, customer, or source..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Categories</option>
                  <option value="order">Orders</option>
                  <option value="inventory">Inventory</option>
                  <option value="audit">Audit & CRM</option>
                  <option value="api">API & Webhooks</option>
                </select>
                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Severities</option>
                  <option value="info">INFO</option>
                  <option value="warn">WARN</option>
                  <option value="error">ERROR</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={isAutoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setIsAutoRefresh(!isAutoRefresh);
                    toast.info(isAutoRefresh ? "Live polling disabled" : "Live polling enabled (5s)");
                  }}
                  className="rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Radio className={`h-3.5 w-3.5 ${isAutoRefresh ? "animate-pulse text-success" : ""}`} />
                  {isAutoRefresh ? "Live: ON" : "Live: OFF"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => refetchLogs()} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh
                </Button>
                <Button size="sm" onClick={exportLogsCSV} className="rounded-xl flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              </div>
            </div>

            <TableWrap>
              <thead>
                <tr>
                  <Th>Timestamp</Th>
                  <Th>Category</Th>
                  <Th>Severity</Th>
                  <Th>Action</Th>
                  <Th>Details</Th>
                  <Th className="text-right">Inspect</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-xs">
                {logsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground font-sans">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading telemetry stream...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-muted-foreground font-sans">
                      No system logs found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l: any) => (
                    <tr key={l.id} className="hover:bg-muted/10 transition-colors">
                      <Td className="text-muted-foreground whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</Td>
                      <Td className="capitalize font-sans font-bold text-foreground text-xs">{l.category}</Td>
                      <Td>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                          l.level === "ERROR" ? "bg-error/10 text-error border border-error/20" :
                          l.level === "WARN" ? "bg-warning/10 text-warning border border-warning/20" :
                          "bg-primary/10 text-primary border border-primary/20"
                        }`}>
                          {l.level}
                        </span>
                      </Td>
                      <Td className="font-bold text-foreground">{l.action}</Td>
                      <Td className="text-muted-foreground font-sans text-xs max-w-xs truncate">{l.details}</Td>
                      <Td className="text-right">
                        <button
                          onClick={() => setSelectedLog(l)}
                          className="h-8 px-2.5 rounded-lg bg-muted hover:bg-primary hover:text-white transition-colors text-xs font-bold inline-flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </Td>
                    </tr>
                  ))
                )}
              </tbody>
            </TableWrap>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          PROVISION NEW USER MODAL
         ══════════════════════════════════════════════════════════ */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg uppercase tracking-tight">Provision System User</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">Create an employee or administrative profile and assign security clearance.</p>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!userForm.full_name) return toast.error("Full Name is required");
              createUserMutation.mutate(userForm);
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Full Name *</label>
              <input
                required
                value={userForm.full_name}
                onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                placeholder="e.g. John Kamau"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Email Address (Optional)</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="e.g. john@tindiholdings.co.ke"
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Security Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="admin">Super Admin</option>
                  <option value="manager">Store Manager</option>
                  <option value="staff">Staff / Cashier</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assigned Branch</label>
                <select
                  value={userForm.branchId}
                  onChange={(e) => setUserForm({ ...userForm, branchId: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">HQ / All Branches</option>
                  {(usersData?.branches ?? []).map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)} className="rounded-xl text-xs font-bold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createUserMutation.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6"
              >
                {createUserMutation.isPending ? "Creating..." : "Provision User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════
          LOG INSPECTION MODAL
         ══════════════════════════════════════════════════════════ */}
      <Dialog open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Log Event Payload</span>
                <DialogTitle className="font-black text-lg mt-0.5">{selectedLog?.action}</DialogTitle>
              </div>
              <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                selectedLog?.level === "ERROR" ? "bg-error/10 text-error border border-error/20" :
                selectedLog?.level === "WARN" ? "bg-warning/10 text-warning border border-warning/20" :
                "bg-primary/10 text-primary border border-primary/20"
              }`}>
                {selectedLog?.level}
              </span>
            </div>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-3 py-2 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border space-y-1">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold">Event Details</span>
                <p className="text-foreground font-semibold">{selectedLog.details}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Category & Source</span>
                  <strong className="capitalize">{selectedLog.category}</strong>
                  <div className="text-muted-foreground text-[10px]">{selectedLog.source || "System Core"}</div>
                </div>
                <div className="p-3 rounded-xl border border-border bg-card">
                  <span className="text-muted-foreground block text-[9px] uppercase font-bold">Client IP / Host</span>
                  <strong className="font-mono">{selectedLog.ip || "Internal"}</strong>
                  <div className="text-muted-foreground text-[10px] font-mono">{new Date(selectedLog.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/10 font-mono text-[10px] text-muted-foreground">
                Timestamp: {selectedLog.timestamp}
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border">
            <Button onClick={() => setSelectedLog(null)} className="rounded-xl text-xs font-bold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
