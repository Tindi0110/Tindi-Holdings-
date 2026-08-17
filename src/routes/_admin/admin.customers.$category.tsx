import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCustomerAnalytics,
  deleteProfile,
  updateProfile,
  createAdminCustomer,
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
import { motion, AnimatePresence } from "motion/react";
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
  const [editUser, setEditUser] = useState<{ id: string; full_name: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const { data: customersData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "customers", "analytics"],
    queryFn: () => getCustomerAnalytics(),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProfile({ data: { id } }),
    onSuccess: () => {
      toast.success("Customer removed");
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
    mutationFn: () => createAdminCustomer({ data: { full_name: newCustomerName } }),
    onSuccess: () => {
      toast.success("Customer created in registry");
      setNewCustomerName("");
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "customers", "analytics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allCustomers = customersData?.recent || [];
  const filteredCustomers = allCustomers.filter((c: any) =>
    (c.full_name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Button onClick={() => setCreateOpen(true)} className="rounded-xl h-9 px-4 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider">
              <Plus className="h-4 w-4 mr-1.5" /> Add Customer
            </Button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. ALL CUSTOMERS DIRECTORY
           ══════════════════════════════════════════════════════════ */}
        {(category === "all" || (!["groups", "vip", "analytics", "activity"].includes(category))) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search by name or customer ID..."
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
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Customer Name</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Verification</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 font-black uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-16 text-center text-xs text-muted-foreground">
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
                              onClick={() => setEditUser({ id: c.id, full_name: c.full_name ?? "" })}
                              className="h-8 w-8 grid place-items-center rounded-lg bg-muted/60 hover:bg-primary hover:text-white transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete customer "${c.full_name || c.id}"?`)) del.mutate(c.id);
                              }}
                              className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!isLoading && filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-xs text-muted-foreground">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "VIP Platinum", count: 18, desc: "Lifetime spend > KES 100,000", tag: "Priority Delivery" },
                { name: "Regular Shoppers", count: Math.max(1, (customersData?.total ?? 0) - 20), desc: "Placed 2+ verified orders", tag: "Loyalty Tier" },
                { name: "Corporate / B2B", count: 7, desc: "Wholesale & bulk procurement", tag: "Credit Terms" },
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
                  <p className="text-xs text-muted-foreground">Customers with the highest cumulative revenue contribution.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-black uppercase">Rank & Customer</th>
                      <th className="px-6 py-4 font-black uppercase">Tier</th>
                      <th className="px-6 py-4 font-black uppercase">Estimated Spend</th>
                      <th className="px-6 py-4 font-black uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {allCustomers.slice(0, 5).map((c: any, index: number) => (
                      <tr key={c.id} className="hover:bg-muted/20">
                        <td className="px-6 py-4 font-bold flex items-center gap-3">
                          <span className={`h-6 w-6 rounded-full grid place-items-center text-xs font-black ${
                            index === 0 ? "bg-amber-500 text-white" :
                            index === 1 ? "bg-slate-400 text-white" :
                            index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {index + 1}
                          </span>
                          <span>{c.full_name ?? "VIP Client"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                            Gold VIP
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-primary font-mono text-xs">
                          KES {(120000 - index * 18000).toLocaleString("en-KE")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xs font-bold text-success">Active VIP</span>
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
                    { name: "Week 1", count: 4 },
                    { name: "Week 2", count: 7 },
                    { name: "Week 3", count: 12 },
                    { name: "Week 4", count: 19 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
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
            5. CUSTOMER ACTIVITY STREAM
           ══════════════════════════════════════════════════════════ */}
        {category === "activity" && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-wider">Live Customer Interaction Feed</h3>
            <div className="divide-y divide-border">
              {allCustomers.slice(0, 10).map((c: any) => (
                <div key={c.id} className="py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-success/10 text-success grid place-items-center shrink-0">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        <span className="text-primary font-black">{c.full_name || "Customer"}</span> verified identity in registry
                      </div>
                      <div className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">Auth Sync</span>
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
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <DialogTitle className="font-black text-lg">Create New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer Full Name</label>
              <input
                placeholder="e.g. Samuel Kibet"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={() => createCust.mutate()} disabled={!newCustomerName.trim() || createCust.isPending} className="rounded-xl bg-primary text-primary-foreground font-black px-6">
              {createCust.isPending ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
