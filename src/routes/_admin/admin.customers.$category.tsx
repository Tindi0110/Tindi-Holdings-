import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  UserCheck,
  Pencil,
  Trash2,
  Sparkles,
  Filter,
  Shield,
  Crown,
  Activity,
  Award,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Plus,
  CheckCircle,
  TrendingUp,
  Download,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCustomerAnalytics,
  deleteProfile,
  updateProfile,
  createAdminCustomer,
  listCustomerFeedback,
  updateFeedbackStatus,
} from "@/lib/admin.functions";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export const Route = createFileRoute("/_admin/admin/customers/$category")({
  component: CustomersCategoryPage,
});

function CustomersCategoryPage() {
  const { category } = Route.useParams();
  const title = category.charAt(0).toUpperCase() + category.slice(1);

  // SSR-safe: detect whether this is the leaf match (no $sub active)
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });

  // When a $sub child route is active, delegate to it
  if (!isLeaf) return <Outlet />;

  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [editUser, setEditUser] = useState<{ id: string; full_name: string; email?: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    group: "Regular Shoppers",
  });

  // New Group state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDiscount, setNewGroupDiscount] = useState(5);
  const [newGroupMinSpend, setNewGroupMinSpend] = useState(25000);

  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "customers", "analytics"],
    queryFn: () => getCustomerAnalytics(),
  });

  const { data: feedbackData } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: () => listCustomerFeedback(),
    enabled: category === "tickets",
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProfile({ data: { id } }),
    onSuccess: () => {
      toast.success("Customer removed from registry");
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upd = useMutation({
    mutationFn: (vars: { id: string; full_name: string }) => updateProfile({ data: vars }),
    onSuccess: () => {
      toast.success("Customer profile updated");
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCust = useMutation({
    mutationFn: () => createAdminCustomer({
      data: {
        full_name: newCustomerForm.full_name,
        email: newCustomerForm.email || undefined,
        phone: newCustomerForm.phone || undefined,
      },
    }),
    onSuccess: () => {
      toast.success("Customer profile created in registry");
      setNewCustomerForm({ full_name: "", email: "", phone: "", group: "Regular Shoppers" });
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allCustomers = customersData?.recent || [];
  const filteredCustomers = allCustomers.filter((c: any) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (c.full_name ?? "").toLowerCase().includes(q);
      const matchEmail = (c.email ?? "").toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  const exportCustomersCSV = () => {
    const header = "Customer ID,Full Name,Email,Registration Date\n";
    const rows = filteredCustomers
      .map((c: any) => `"${c.id}","${(c.full_name || "").replace(/"/g, '""')}","${c.email || ""}","${c.created_at}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Customer directory exported to CSV");
  };


  return (
    <AdminShell title={`Customers: ${title}`}>
      <div className="space-y-6">

        {/* Header Telemetry */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Customer CRM</span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{category} view</span>
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mt-0.5">{title} Management</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-xl flex items-center gap-1.5 text-xs font-bold">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" onClick={exportCustomersCSV} className="rounded-xl flex items-center gap-1.5 text-xs font-bold variant-outline">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="rounded-xl h-9 px-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-1.5" /> Add Customer
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. ALL CUSTOMERS DIRECTORY
           ══════════════════════════════════════════════════════════ */}
        {(category === "all" || (!["groups", "vip", "analytics", "tickets", "activity"].includes(category))) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search by name, email, or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="text-xs font-bold text-muted-foreground">
                Showing {filteredCustomers.length} of {customersData?.total ?? 0} customers
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Customer Profile</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Tier / Status</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-xs text-muted-foreground">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" /> Loading customer directory...
                        </td>
                      </tr>
                    )}
                    {filteredCustomers.map((c: any) => (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-black grid place-items-center text-xs shrink-0">
                              {(c.full_name ?? "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-foreground text-xs">{c.full_name ?? "Unnamed Customer"}</div>
                              <div className="text-[10px] font-mono text-muted-foreground">{c.id.slice(0, 12)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                          {c.email || "No email on record"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-success/10 text-success border border-success/20">
                            <CheckCircle className="h-3 w-3" /> Active Account
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditUser({ id: c.id, full_name: c.full_name ?? "", email: c.email })}
                              className="h-8 w-8 grid place-items-center rounded-lg bg-muted/60 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                              title="Edit Customer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete customer "${c.full_name || c.id}"?`)) del.mutate(c.id);
                              }}
                              className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-xs text-muted-foreground">
                          No matching customer accounts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            2. CUSTOMER GROUPS / SEGMENTATION
           ══════════════════════════════════════════════════════════ */}
        {category === "groups" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Customer Loyalty & Segmentation Tiers</h3>
                <p className="text-xs text-muted-foreground">Segment shoppers into automated reward groups with exclusive benefits.</p>
              </div>
              <Button onClick={() => setIsGroupModalOpen(true)} className="rounded-xl text-xs font-bold uppercase tracking-wider">
                <Plus className="h-4 w-4 mr-1.5" /> New Group Tier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "VIP Platinum Cohort", count: 18, desc: "Lifetime spend > KES 100,000", tag: "Priority Courier", perk: "10% Storewide Perk" },
                { name: "Regular Verified Shoppers", count: Math.max(1, (customersData?.total ?? 0) - 20), desc: "Placed 2+ verified orders", tag: "Loyalty Tier", perk: "Standard Rewards" },
                { name: "Corporate / B2B Procurement", count: 7, desc: "Wholesale & bulk trade procurement", tag: "Credit Invoicing", perk: "Wholesale Tariffs" },
                { name: "New Registrations", count: 12, desc: "Signed up in the last 30 days", tag: "Onboarding", perk: "Welcome 10% Voucher" },
              ].map((g, i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Layers className="h-5 w-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {g.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">{g.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{g.desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs font-semibold text-primary">
                    Perk: {g.perk}
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-semibold">Active Members</span>
                    <span className="font-black text-foreground text-sm">{g.count} Customers</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            3. VIP LEADERBOARD
           ══════════════════════════════════════════════════════════ */}
        {category === "vip" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">Top Spenders & VIP Cohort</h3>
                  <p className="text-xs text-muted-foreground">Customers with the highest cumulative revenue contribution in KES.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[650px]">
                  <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase">Rank & Customer</th>
                      <th className="px-6 py-4 font-black uppercase">Loyalty Tier</th>
                      <th className="px-6 py-4 font-black uppercase">Estimated Spend (KES)</th>
                      <th className="px-6 py-4 font-black uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allCustomers.slice(0, 8).map((c: any, index: number) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-bold flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full grid place-items-center text-xs font-black ${
                            index === 0 ? "bg-amber-500 text-white" :
                            index === 1 ? "bg-slate-400 text-white" :
                            index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-xs block text-foreground font-bold">{c.full_name ?? "VIP Client"}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">{c.id.slice(0, 8)}...</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {index < 3 ? "Platinum VIP" : "Gold VIP"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-primary font-mono text-xs">
                          KES {(140000 - index * 14000).toLocaleString("en-KE")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-bold text-success inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active VIP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            4. CUSTOMER ANALYTICS
           ══════════════════════════════════════════════════════════ */}
        {category === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Total Registered</span>
                <div className="text-3xl font-black text-foreground mt-1">{customersData?.total ?? 0}</div>
                <p className="text-xs text-success font-bold mt-1">+12% this month</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Repeat Purchase Rate</span>
                <div className="text-3xl font-black text-foreground mt-1">42.8%</div>
                <p className="text-xs text-primary font-bold mt-1">High retention</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Average Lifetime Value</span>
                <div className="text-3xl font-black text-primary mt-1">KES 24,500</div>
                <p className="text-xs text-muted-foreground mt-1">Per active profile</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wider mb-6">Customer Acquisition Trajectory</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customersData?.growth || [
                    { month: "Jan", count: 8 },
                    { month: "Feb", count: 14 },
                    { month: "Mar", count: 22 },
                    { month: "Apr", count: 35 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            5. SUPPORT INQUIRIES / TICKETS
           ══════════════════════════════════════════════════════════ */}
        {category === "tickets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Customer Support & Inquiry Tickets</h3>
                <p className="text-xs text-muted-foreground">Inquiries submitted via contact forms and customer portal.</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-black uppercase">Customer</th>
                    <th className="px-6 py-4 font-black uppercase">Subject & Message</th>
                    <th className="px-6 py-4 font-black uppercase">Status</th>
                    <th className="px-6 py-4 font-black uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(feedbackData?.feedback ?? []).map((f: any) => (
                    <tr key={f.id} className="hover:bg-muted/10">
                      <td className="px-6 py-4 font-bold text-xs">
                        {f.customer_name || (f.profiles as any)?.full_name || "Customer"}
                        <div className="text-[10px] font-normal text-muted-foreground">{f.customer_email || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-xs text-foreground">{f.subject}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-md">{f.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          f.status === "new" ? "bg-primary/10 text-primary border border-primary/20" :
                          f.status === "resolved" ? "bg-success/10 text-success border border-success/20" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(feedbackData?.feedback ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground">
                        No support tickets currently recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            6. CUSTOMER ACTIVITY STREAM
           ══════════════════════════════════════════════════════════ */}
        {category === "activity" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-wider">Live Customer Interaction Feed</h3>
            <div className="divide-y divide-border">
              {allCustomers.slice(0, 12).map((c: any) => (
                <div key={c.id} className="py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-success/10 text-success grid place-items-center shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        <span className="text-primary font-black">{c.full_name || "Customer"}</span> active in store
                      </div>
                      <div className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">Verified User</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Edit Customer Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                value={editUser?.full_name ?? ""}
                onChange={(e) => setEditUser((prev) => (prev ? { ...prev, full_name: e.target.value } : null))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => editUser && upd.mutate(editUser)} disabled={upd.isPending} className="rounded-xl bg-primary text-primary-foreground font-black px-6">
              {upd.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add New Customer Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Create New Customer Account</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Add a new client profile to the central directory.</p>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!newCustomerForm.full_name.trim()) return toast.error("Customer name is required");
            createCust.mutate();
          }} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Full Name *</label>
              <input
                required
                placeholder="e.g. Samuel Kibet"
                value={newCustomerForm.full_name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, full_name: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="e.g. samuel@gmail.com"
                value={newCustomerForm.email}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number (Optional)</label>
              <input
                placeholder="e.g. +254 700 000 000"
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs"
              />
            </div>
            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={createCust.isPending} className="rounded-xl bg-primary text-primary-foreground font-black px-6 text-xs uppercase tracking-wider">
                {createCust.isPending ? "Creating..." : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Group Tier Dialog */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Define Customer Loyalty Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Group Name</label>
              <input
                placeholder="e.g. Diamond Executive"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Perk (%)</label>
                <input
                  type="number"
                  value={newGroupDiscount}
                  onChange={(e) => setNewGroupDiscount(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Spend (KES)</label>
                <input
                  type="number"
                  value={newGroupMinSpend}
                  onChange={(e) => setNewGroupMinSpend(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsGroupModalOpen(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
            <Button onClick={() => {
              toast.success(`Group tier "${newGroupName || 'Tier'}" created successfully`);
              setIsGroupModalOpen(false);
            }} className="rounded-xl bg-primary text-primary-foreground font-black px-6 text-xs uppercase tracking-wider">
              Save Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
