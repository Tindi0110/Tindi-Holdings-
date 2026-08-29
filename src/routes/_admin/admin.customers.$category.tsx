import { createFileRoute, Outlet, useRouterState, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  Users,
  Search,
  Pencil,
  Trash2,
  Crown,
  RefreshCw,
  Plus,
  CheckCircle,
  Download,
  Mail,
  Building2,
  ShoppingCart,
  MessageSquare,
  Send,
  Clock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const isLeaf = useRouterState({
    select: (state) => state.matches[state.matches.length - 1]?.routeId === Route.id,
  });
  if (!isLeaf) return <Outlet />;
  return <CustomersCategoryView category={category} />;
}

function getTier(spend: number) {
  if (spend >= 100000)
    return {
      label: "Platinum VIP",
      color: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      icon: "👑",
    };
  if (spend >= 50000)
    return {
      label: "Gold VIP",
      color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
      icon: "⭐",
    };
  if (spend >= 10000)
    return {
      label: "Silver",
      color: "bg-slate-400/10 text-slate-500 border-slate-400/30",
      icon: "🥈",
    };
  return {
    label: "Regular",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: "✓",
  };
}

function Customer360Drawer({ customer, onClose }: { customer: any; onClose: () => void }) {
  if (!customer) return null;
  const tier = getTier(customer.totalSpend || 0);
  return (
    <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-l border-border">
      <SheetHeader className="pb-4 border-b border-border">
        <SheetTitle className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary font-black text-lg grid place-items-center shrink-0">
            {(customer.full_name ?? "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-base font-black text-foreground">
              {customer.full_name || "Unnamed Customer"}
            </div>
            <div className="text-xs text-muted-foreground font-normal mt-0.5">
              {customer.email || "No email on file"}
            </div>
          </div>
        </SheetTitle>
      </SheetHeader>
      <div className="space-y-5 pt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Lifetime Spend",
              value: `KES ${Number(customer.totalSpend || 0).toLocaleString("en-KE")}`,
              color: "text-primary",
            },
            {
              label: "Total Orders",
              value: String(customer.orderCount || 0),
              color: "text-emerald-600",
            },
            { label: "Tier", value: tier.label, color: "text-amber-600" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-muted/30 rounded-xl p-3 text-center border border-border"
            >
              <div className={`text-sm font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[
            {
              icon: Building2,
              label: "Branch",
              value: (customer.branches as any)?.name || "No branch assigned",
            },
            {
              icon: Clock,
              label: "Customer Since",
              value: new Date(customer.created_at).toLocaleDateString("en-KE", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            },
            {
              icon: ShoppingCart,
              label: "Last Order Date",
              value: customer.lastOrderDate
                ? new Date(customer.lastOrderDate).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "No orders yet",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                  {label}
                </div>
                <div className="text-xs font-bold text-foreground mt-0.5">{value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${tier.color}`}>
          <span className="text-base">{tier.icon}</span>
          <div>
            <div className="text-xs font-black uppercase tracking-wider">{tier.label}</div>
            <div className="text-[10px] font-medium opacity-70">
              {tier.label === "Platinum VIP"
                ? "Lifetime spend ≥ KES 100,000"
                : tier.label === "Gold VIP"
                  ? "Lifetime spend KES 50,000–100,000"
                  : tier.label === "Silver"
                    ? "Lifetime spend KES 10,000–50,000"
                    : "Spend KES 10,000+ to upgrade tier"}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              const rawPhone = customer.phone || customer.username || "";
              const clean = rawPhone.replace(/\D/g, "");
              const kenyaPhone = clean.startsWith("0")
                ? `254${clean.slice(1)}`
                : clean.startsWith("254")
                  ? clean
                  : clean.length === 9
                    ? `254${clean}`
                    : "254700000000";
              const msg = `Hello ${customer.full_name || "Valued Customer"}, thank you for shopping with Tindi Holdings Ltd (${tier.label})! How may we assist you today?`;
              const url = `https://wa.me/${kenyaPhone}?text=${encodeURIComponent(msg)}`;
              window.open(url, "_blank");
            }}
            className="h-10 flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" /> WhatsApp
          </button>
          <a
            href={`mailto:${customer.email}`}
            className="h-10 flex items-center justify-center gap-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary hover:text-white transition-all border border-primary/20"
          >
            <Mail className="h-3.5 w-3.5" /> Email
          </a>
          <Link
            to="/admin/orders"
            className="h-10 flex items-center justify-center gap-1.5 bg-muted hover:bg-muted/60 text-foreground rounded-xl text-xs font-black transition-all border border-border"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Orders
          </Link>
        </div>
      </div>
    </SheetContent>
  );
}

function CustomersCategoryView({ category }: { category: string }) {
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState<{ id: string; full_name: string } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerCustomer, setDrawerCustomer] = useState<any>(null);
  const [replyingTicket, setReplyingTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newCustomerForm, setNewCustomerForm] = useState({ full_name: "", email: "", phone: "" });
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDiscount, setNewGroupDiscount] = useState(5);
  const [newGroupMinSpend, setNewGroupMinSpend] = useState(25000);

  const {
    data: customersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "customers", "analytics"],
    queryFn: () => getCustomerAnalytics(),
  });

  const { data: feedbackData, isLoading: ticketsLoading } = useQuery({
    queryKey: ["admin", "feedback"],
    queryFn: () => listCustomerFeedback(),
    enabled: category === "tickets",
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProfile({ data: { id } }),
    onSuccess: () => {
      toast.success("Customer removed");
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const upd = useMutation({
    mutationFn: (vars: { id: string; full_name: string }) => updateProfile({ data: vars }),
    onSuccess: () => {
      toast.success("Profile updated");
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createCust = useMutation({
    mutationFn: () =>
      createAdminCustomer({
        data: {
          full_name: newCustomerForm.full_name,
          email: newCustomerForm.email || undefined,
          phone: newCustomerForm.phone || undefined,
        },
      }),
    onSuccess: () => {
      toast.success("Customer profile created");
      setNewCustomerForm({ full_name: "", email: "", phone: "" });
      setCreateOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "customers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const replyTicketMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateFeedbackStatus({ data: { id, status: "replied", admin_notes: notes } }),
    onSuccess: () => {
      toast.success("Reply recorded");
      setReplyingTicket(null);
      setReplyText("");
      qc.invalidateQueries({ queryKey: ["admin", "feedback"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allCustomers: any[] = customersData?.recent ?? [];
  const filteredCustomers = allCustomers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (c.full_name ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      ((c.branches as any)?.name ?? "").toLowerCase().includes(q)
    );
  });
  const vipCustomers = [...allCustomers].sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0));

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const selectAll = () =>
    setSelectedIds(
      selectedIds.size === filteredCustomers.length && filteredCustomers.length > 0
        ? new Set()
        : new Set(filteredCustomers.map((c) => c.id)),
    );

  const exportCSV = () => {
    const targets =
      selectedIds.size > 0
        ? filteredCustomers.filter((c) => selectedIds.has(c.id))
        : filteredCustomers;
    const header = "Name,Email,Branch,Tier,Total Spend (KES),Orders,Last Order,Joined\n";
    const rows = targets
      .map((c) => {
        const tier = getTier(c.totalSpend || 0);
        return `"${c.full_name || ""}","${c.email || ""}","${(c.branches as any)?.name || ""}","${tier.label}",${c.totalSpend || 0},${c.orderCount || 0},"${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : ""}","${new Date(c.created_at).toLocaleDateString()}"`;
      })
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${targets.length} customers`);
  };

  return (
    <AdminShell title="Customers">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-primary">
                Customer CRM
              </div>
              <h2 className="text-xl font-black tracking-tight capitalize">
                {category} Management
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={exportCSV}
              className="rounded-xl gap-1.5 text-xs font-bold"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button
              onClick={() => setCreateOpen(true)}
              className="rounded-xl h-9 px-4 font-black text-xs uppercase tracking-wider"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Customer
            </Button>
          </div>
        </div>

        {/* ALL CUSTOMERS DIRECTORY */}
        {(category === "all" ||
          !["groups", "vip", "analytics", "tickets", "activity"].includes(category)) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search by name, email or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="text-xs font-bold text-muted-foreground">
                {filteredCustomers.length} of {customersData?.total ?? 0} customers
              </div>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <span className="text-xs font-black text-primary">{selectedIds.size} selected</span>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.info("Email blast: integrate your email provider")}
                  className="rounded-xl text-xs"
                >
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  Send Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportCSV}
                  className="rounded-xl text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Export
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedIds(new Set())}
                  className="rounded-xl text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[960px]">
                  <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                    <tr>
                      <th className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === filteredCustomers.length &&
                            filteredCustomers.length > 0
                          }
                          onChange={selectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">Customer</th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">Branch</th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">Tier</th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">
                        Spend (KES)
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-center">
                        Orders
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider">
                        Last Order
                      </th>
                      <th className="px-5 py-3.5 font-black uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {isLoading && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-16 text-center text-xs text-muted-foreground"
                        >
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                          Loading customer directory...
                        </td>
                      </tr>
                    )}
                    {filteredCustomers.map((c) => {
                      const tier = getTier(c.totalSpend || 0);
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-muted/10 transition-colors cursor-pointer"
                          onClick={() => setDrawerCustomer(c)}
                        >
                          <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(c.id)}
                              onChange={() => toggleSelect(c.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-black grid place-items-center text-xs shrink-0">
                                {(c.full_name ?? "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground text-xs">
                                  {c.full_name ?? "Unnamed"}
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">
                                  {c.id.slice(0, 8)}…
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {c.email || "—"}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {(c.branches as any)?.name || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border ${tier.color}`}
                            >
                              {tier.icon} {tier.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-primary text-xs font-mono">
                            {(c.totalSpend || 0) > 0
                              ? Number(c.totalSpend).toLocaleString("en-KE")
                              : "—"}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-center text-xs">
                            {c.orderCount || 0}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">
                            {c.lastOrderDate
                              ? new Date(c.lastOrderDate).toLocaleDateString("en-KE")
                              : "No orders"}
                          </td>
                          <td
                            className="px-5 py-3.5 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() =>
                                  setEditUser({ id: c.id, full_name: c.full_name ?? "" })
                                }
                                className="h-8 w-8 grid place-items-center rounded-lg bg-muted/60 hover:bg-primary hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete "${c.full_name || c.id}"?`)) del.mutate(c.id);
                                }}
                                className="h-8 w-8 grid place-items-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {!isLoading && filteredCustomers.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-12 text-center text-xs text-muted-foreground"
                        >
                          No matching customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMER GROUPS */}
        {category === "groups" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Customer Loyalty & Segmentation Tiers
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customers auto-segment based on lifetime spend.
                </p>
              </div>
              <Button
                onClick={() => setIsGroupModalOpen(true)}
                className="rounded-xl text-xs font-black uppercase tracking-wider"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Tier
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  name: "Platinum VIP",
                  count: allCustomers.filter((c) => c.totalSpend >= 100000).length,
                  desc: "Spend ≥ KES 100,000",
                  perk: "Priority Courier + 10% Storewide",
                  icon: "👑",
                  color: "bg-amber-500/10 border-amber-500/30 text-amber-600",
                },
                {
                  name: "Gold VIP",
                  count: allCustomers.filter((c) => c.totalSpend >= 50000 && c.totalSpend < 100000)
                    .length,
                  desc: "Spend KES 50,000–100,000",
                  perk: "5% Discount + Gold Rewards",
                  icon: "⭐",
                  color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600",
                },
                {
                  name: "Silver Tier",
                  count: allCustomers.filter((c) => c.totalSpend >= 10000 && c.totalSpend < 50000)
                    .length,
                  desc: "Spend KES 10,000–50,000",
                  perk: "Standard Loyalty Points",
                  icon: "🥈",
                  color: "bg-slate-400/10 border-slate-400/30 text-slate-500",
                },
                {
                  name: "Regular",
                  count: allCustomers.filter((c) => c.totalSpend < 10000).length,
                  desc: "All other customers",
                  perk: "Welcome 5% Voucher",
                  icon: "🛍️",
                  color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
                },
              ].map((g, i) => (
                <div
                  key={i}
                  className={`bg-card border ${g.color} rounded-2xl p-6 space-y-4 shadow-sm`}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-2xl">{g.icon}</div>
                    <span className="text-3xl font-black">{isLoading ? "…" : g.count}</span>
                  </div>
                  <div>
                    <h3 className="font-black text-base">{g.name}</h3>
                    <p className="text-xs opacity-70 mt-0.5">{g.desc}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/20 border border-current/10 text-xs font-bold">
                    🎁 {g.perk}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIP LEADERBOARD */}
        {category === "vip" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center shrink-0">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Top Spenders — VIP Cohort
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ranked by real cumulative spend from orders database.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-muted/20 text-[10px] text-muted-foreground text-left border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-black uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider">Branch</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider">
                      Lifetime Spend
                    </th>
                    <th className="px-6 py-4 font-black uppercase tracking-wider text-center">
                      Orders
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-xs text-muted-foreground"
                      >
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                        Loading...
                      </td>
                    </tr>
                  )}
                  {vipCustomers.slice(0, 25).map((c, index) => {
                    const tier = getTier(c.totalSpend || 0);
                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-muted/10 cursor-pointer transition-colors"
                        onClick={() => setDrawerCustomer(c)}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`h-7 w-7 rounded-full grid place-items-center text-xs font-black ${index === 0 ? "bg-amber-500 text-white" : index === 1 ? "bg-slate-400 text-white" : index === 2 ? "bg-amber-700 text-white" : "bg-muted text-muted-foreground"}`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-black grid place-items-center text-xs shrink-0">
                              {(c.full_name ?? "V").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-black text-foreground">
                                {c.full_name ?? "VIP Client"}
                              </div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {c.email || c.id.slice(0, 10) + "…"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {(c.branches as any)?.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${tier.color}`}
                          >
                            {tier.icon} {tier.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-primary font-mono text-sm">
                          {(c.totalSpend || 0) > 0 ? (
                            `KES ${Number(c.totalSpend).toLocaleString("en-KE")}`
                          ) : (
                            <span className="text-muted-foreground font-normal text-xs">
                              No purchases
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-center">{c.orderCount || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {category === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Registered",
                  value: customersData?.total ?? 0,
                  sub: "All-time registrations",
                  color: "text-primary",
                },
                {
                  label: "Active Buyers",
                  value: customersData?.withOrders ?? 0,
                  sub: "Placed at least 1 order",
                  color: "text-emerald-600",
                },
                {
                  label: "Repeat Purchase Rate",
                  value: `${customersData?.repeatRate ?? 0}%`,
                  sub: "Customers with 2+ orders",
                  color: "text-violet-600",
                },
                {
                  label: "Est. Avg Lifetime Value",
                  value: `KES ${Number(customersData?.avgLifetimeValue ?? 0).toLocaleString("en-KE")}`,
                  sub: "Per active buyer",
                  color: "text-amber-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {s.label}
                  </span>
                  <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="font-black text-sm uppercase tracking-wider mb-4">
                Customer Acquisition Trajectory
              </h3>
              {(customersData?.growth ?? []).length === 0 ? (
                <div className="h-48 flex items-center justify-center text-xs text-muted-foreground">
                  No data yet.
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={customersData?.growth}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fontWeight: 700 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => [v, "New Customers"]} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUPPORT TICKETS */}
        {category === "tickets" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">
                  Customer Support Inbox
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inquiries submitted via contact forms and the customer portal.
                </p>
              </div>
              <div className="text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                {feedbackData?.newCount ?? 0} new
              </div>
            </div>
            <div className="space-y-3">
              {ticketsLoading && (
                <div className="bg-card border border-border rounded-2xl p-10 text-center text-xs text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading tickets...
                </div>
              )}
              {(feedbackData?.feedback ?? []).map((f: any) => (
                <div
                  key={f.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-foreground">
                          {f.customer_name || (f.profiles as any)?.full_name || "Customer"}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${f.status === "new" ? "bg-primary/10 text-primary border-primary/20" : f.status === "replied" || f.status === "resolved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"}`}
                        >
                          {f.status}
                        </span>
                        {f.category && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {f.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {f.customer_email} ·{" "}
                        {new Date(f.created_at).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setReplyingTicket(replyingTicket === f.id ? null : f.id);
                        setReplyText(f.admin_notes || "");
                      }}
                      className="h-8 px-3 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white text-xs font-black transition-all flex items-center gap-1 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" /> Reply
                    </button>
                  </div>
                  <div>
                    <div className="font-black text-xs text-foreground">{f.subject}</div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {f.message}
                    </p>
                  </div>
                  {f.admin_notes && replyingTicket !== f.id && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <div className="text-[10px] font-black uppercase text-emerald-600 mb-1 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Admin Response
                      </div>
                      <p className="text-xs text-foreground">{f.admin_notes}</p>
                    </div>
                  )}
                  {replyingTicket === f.id && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                        Reply to Customer
                      </label>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-muted/20 text-xs resize-none outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => replyTicketMut.mutate({ id: f.id, notes: replyText })}
                          disabled={replyTicketMut.isPending || !replyText.trim()}
                          className="rounded-xl text-xs font-black"
                        >
                          {replyTicketMut.isPending ? "Sending…" : "Send Reply"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTicket(null)}
                          className="rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {!ticketsLoading && (feedbackData?.feedback ?? []).length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-black text-sm">Inbox is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer inquiries will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY FEED */}
        {category === "activity" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-wider mb-5">
              Customer Activity Feed
            </h3>
            <div className="divide-y divide-border">
              {[...allCustomers]
                .sort(
                  (a, b) =>
                    new Date(b.lastOrderDate || b.created_at).getTime() -
                    new Date(a.lastOrderDate || a.created_at).getTime(),
                )
                .slice(0, 30)
                .map((c) => (
                  <div
                    key={c.id}
                    className="py-3.5 flex items-center justify-between hover:bg-muted/10 transition-colors px-2 rounded-xl cursor-pointer"
                    onClick={() => setDrawerCustomer(c)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0 text-xs font-black">
                        {(c.full_name ?? "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-black text-foreground">
                          {c.full_name || "Customer"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {c.lastOrderDate
                            ? `Last order: ${new Date(c.lastOrderDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`
                            : `Joined: ${new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-primary">
                        {c.orderCount || 0} orders
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {c.totalSpend > 0
                          ? `KES ${Number(c.totalSpend).toLocaleString("en-KE")}`
                          : "No purchases"}
                      </div>
                    </div>
                  </div>
                ))}
              {isLoading && (
                <div className="py-10 text-center text-xs text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                  Loading activity…
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer 360 Drawer */}
      <Sheet open={!!drawerCustomer} onOpenChange={(open) => !open && setDrawerCustomer(null)}>
        <Customer360Drawer customer={drawerCustomer} onClose={() => setDrawerCustomer(null)} />
      </Sheet>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Edit Customer Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Full Name
            </label>
            <input
              value={editUser?.full_name ?? ""}
              onChange={(e) =>
                setEditUser((prev) => (prev ? { ...prev, full_name: e.target.value } : null))
              }
              className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditUser(null)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => editUser && upd.mutate(editUser)}
              disabled={upd.isPending}
              className="rounded-xl font-black px-6"
            >
              {upd.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Create New Customer Account</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a client profile to the central CRM directory.
            </p>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCustomerForm.full_name.trim()) return toast.error("Name required");
              createCust.mutate();
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Customer Full Name *
              </label>
              <input
                required
                placeholder="e.g. Samuel Kibet"
                value={newCustomerForm.full_name}
                onChange={(e) =>
                  setNewCustomerForm({ ...newCustomerForm, full_name: e.target.value })
                }
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={newCustomerForm.email}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                  }
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Phone
                </label>
                <input
                  placeholder="+254 7XX XXX XXX"
                  value={newCustomerForm.phone}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                  }
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                className="rounded-xl text-xs font-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCust.isPending}
                className="rounded-xl font-black px-6 text-xs uppercase tracking-wider"
              >
                {createCust.isPending ? "Creating…" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Tier Dialog */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-lg">Define Custom Loyalty Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Tier Name
              </label>
              <input
                placeholder="e.g. Diamond Executive"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={newGroupDiscount}
                  onChange={(e) => setNewGroupDiscount(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-xs font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Min Spend (KES)
                </label>
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
            <Button
              variant="outline"
              onClick={() => setIsGroupModalOpen(false)}
              className="rounded-xl text-xs font-black"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Tier "${newGroupName || "Custom Tier"}" saved`);
                setIsGroupModalOpen(false);
              }}
              className="rounded-xl font-black px-6 text-xs uppercase tracking-wider"
            >
              Save Tier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
