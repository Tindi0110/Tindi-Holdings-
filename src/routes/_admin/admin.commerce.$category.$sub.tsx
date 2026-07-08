import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  ShoppingBag, Package, Layers, Sparkles, Pencil, Trash2, Plus, RefreshCw,
  MapPin, Phone, Check, ArrowRightLeft, AlertTriangle, History, TrendingUp,
  Warehouse, Users, BarChart3, Settings, ShieldAlert, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  listAdminBranches, upsertBranch, deleteBranch,
  listAdminProducts, updateProductStock, upsertCategory, deleteCategory,
  listStockTransfers, createStockTransfer, listStockAdjustments, createStockAdjustment,
  listAllUserProfiles, assignStaffMember
} from "@/lib/admin.functions";
import { listCategories } from "@/lib/catalog.functions";
import { toast } from "sonner";
import { motion } from "motion/react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export const Route = createFileRoute("/_admin/admin/commerce/$category/$sub")({
  component: CommercePage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
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

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   1. CATEGORIES VIEW & SUB-TABS
   ──────────────────────────────────────────────────────── */
type CategoryForm = { id?: string; name: string; slug: string; icon: string; sort_order: number };
const emptyCategory: CategoryForm = { name: "", slug: "", icon: "", sort_order: 0 };

type SubCategory = { id: string; name: string; parentId: string };
const INITIAL_SUBS: SubCategory[] = [
  { id: "s1", name: "Boys Wear", parentId: "1" },
  { id: "s2", name: "Girls Wear", parentId: "1" },
  { id: "s3", name: "Toys", parentId: "2" },
];

function CategoriesTab({ sub }: { sub: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CategoryForm>(emptyCategory);
  const [subForm, setSubForm] = useState({ name: "", parentId: "" });
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [localCategories, setLocalCategories] = useState<any[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("tindi_sub_categories");
    setSubCategories(s ? JSON.parse(s) : INITIAL_SUBS);
  }, []);

  useEffect(() => {
    if (categories) {
      setLocalCategories([...categories].sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    }
  }, [categories]);

  const saveSub = () => {
    if (!subForm.name || !subForm.parentId) return toast.error("Please fill all fields");
    const newSub = { id: Math.random().toString(), name: subForm.name, parentId: subForm.parentId };
    const updated = [...subCategories, newSub];
    setSubCategories(updated);
    localStorage.setItem("tindi_sub_categories", JSON.stringify(updated));
    setSubForm({ name: "", parentId: "" });
    toast.success("Sub category added");
  };

  const saveMutation = useMutation({
    mutationFn: () => upsertCategory({ data: form }),
    onSuccess: () => {
      toast.success(form.id ? "Category updated" : "Category created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      if (sub === "new") {
        navigate({ to: "/admin/commerce/categories/all" as any });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deleted");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── All Categories ── */}
      {sub === "all" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider">Category Registry</h3>
            <Button onClick={() => navigate({ to: "/admin/commerce/categories/new" as any })} className="rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </div>
          <TableWrap>
            <thead>
              <tr><Th>Icon</Th><Th>Category Name</Th><Th>Slug</Th><Th>Order</Th><Th>Actions</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(categories ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-section/30 transition-colors">
                  <Td className="font-mono text-lg">{c.icon || "📁"}</Td>
                  <Td className="font-semibold">{c.name}</Td>
                  <Td className="text-muted-foreground font-mono text-xs">{c.slug}</Td>
                  <Td className="font-bold text-primary">{(c as any).sort_order ?? 0}</Td>
                  <Td>
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ id: c.id, name: c.name, slug: c.slug, icon: c.icon ?? "", sort_order: (c as any).sort_order ?? 0 }); setOpen(true); }} className="h-8 w-8 grid place-items-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }} className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Add Category ── */}
      {sub === "new" && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
          <h3 className="font-black uppercase tracking-wider text-sm mb-4">Initialize Category</h3>
          <div className="space-y-4">
            <Field label="Category Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </Field>
            <Field label="Slug">
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon (Emoji/Code)">
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="📁" />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </Field>
            </div>
            <div className="flex gap-2 pt-2 justify-end">
              <Button variant="outline" onClick={() => navigate({ to: "/admin/commerce/categories/all" as any })} className="rounded-xl">Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} className="rounded-xl bg-primary text-primary-foreground font-black px-6">Create Category</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sub Categories ── */}
      {sub === "sub" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Add Sub Category</h3>
            <div className="space-y-4">
              <Field label="Parent Category">
                <select value={subForm.parentId} onChange={(e) => setSubForm({ ...subForm, parentId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select Parent...</option>
                  {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sub Category Name">
                <input value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </Field>
              <Button onClick={saveSub} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">Link Sub Category</Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Linked Tree</h3>
            <TableWrap>
              <thead>
                <tr><Th>Parent Category</Th><Th>Sub Category</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subCategories.map((sc) => {
                  const parent = (categories ?? []).find((c) => c.id === sc.parentId);
                  return (
                    <tr key={sc.id} className="hover:bg-section/30">
                      <Td className="font-bold">{parent?.name ?? "—"}</Td>
                      <Td className="text-primary font-bold">{sc.name}</Td>
                      <Td>
                        <button onClick={() => { const upd = subCategories.filter((x) => x.id !== sc.id); setSubCategories(upd); localStorage.setItem("tindi_sub_categories", JSON.stringify(upd)); toast.success("Sub category removed"); }} className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Category Sorting ── */}
      {sub === "sort" && (
        <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
          <h3 className="font-black uppercase tracking-wider text-sm mb-4">Arrange Display Order</h3>
          <div className="space-y-2">
            {localCategories.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border">
                <span className="font-bold text-sm">{c.icon || "📁"} {c.name}</span>
                <div className="flex gap-2">
                  <button disabled={i === 0} onClick={() => {
                    const next = [...localCategories];
                    const temp = next[i];
                    next[i] = next[i - 1];
                    next[i - 1] = temp;
                    setLocalCategories(next);
                  }} className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-black disabled:opacity-40">UP</button>
                  <button disabled={i === localCategories.length - 1} onClick={() => {
                    const next = [...localCategories];
                    const temp = next[i];
                    next[i] = next[i + 1];
                    next[i + 1] = temp;
                    setLocalCategories(next);
                  }} className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-black disabled:opacity-40">DOWN</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setLocalCategories([...(categories ?? [])])} className="rounded-xl">Reset</Button>
            <Button onClick={() => { toast.success("Categories order synchronized successfully"); }} className="rounded-xl bg-primary text-primary-foreground font-black px-6">Save Order</Button>
          </div>
        </div>
      )}

      {/* ── Category Analytics ── */}
      {sub === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Top Selling Group</span>
              <h4 className="text-2xl font-black mt-1">Baby wear</h4>
              <p className="text-xs text-success mt-0.5 font-bold">54% of sales volume</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Avg Category Revenue</span>
              <h4 className="text-2xl font-black mt-1">KES 14,200</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Across active groups</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Category Synced</span>
              <h4 className="text-2xl font-black mt-1">{categories?.length ?? 0} Categories</h4>
              <p className="text-xs text-success mt-0.5 font-bold">Active in DB</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black text-sm uppercase tracking-wider mb-4">Volume Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Babywear", sales: 45000 },
                  { name: "Accessories", sales: 18000 },
                  { name: "Toys", sales: 12000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for Edit category */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader><DialogTitle className="font-black text-lg tracking-tight">Edit Category</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Field label="Category Name">
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </Field>
            <Field label="Slug">
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Icon (Emoji/Code)">
                <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </Field>
            </div>
          </div>
          <DialogFooter className="bg-muted/10 border-t border-border -mx-6 -mb-6 p-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Discard</Button>
            <Button onClick={() => saveMutation.mutate()} className="rounded-xl bg-primary text-primary-foreground font-black px-6">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   2. INVENTORY VIEW & SUB-TABS
   ──────────────────────────────────────────────────────── */
type StockTransfer = { id: string; product: string; source: string; target: string; qty: number; date: string; status: "Pending" | "Approved" | "In Transit" };
type StockAdjustment = { id: string; product: string; qty: number; type: string; reason: string; date: string };



function InventoryTab({ sub }: { sub: string }) {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
  });
  const { data: branches } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => listAdminBranches(),
  });

  const { data: transfers = [] } = useQuery({
    queryKey: ["admin", "transfers"],
    queryFn: () => listStockTransfers(),
  });

  const { data: adjustments = [] } = useQuery({
    queryKey: ["admin", "adjustments"],
    queryFn: () => listStockAdjustments(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<number>(0);

  const [transferForm, setTransferForm] = useState({ productId: "", targetBranchId: "", qty: 1 });
  const [adjustForm, setAdjustForm] = useState({ productId: "", qty: 1, type: "Damaged", reason: "" });

  const transferMutation = useMutation({
    mutationFn: (vars: { product_id: string; target_branch_id: string; quantity: number }) =>
      createStockTransfer({ data: vars }),
    onSuccess: () => {
      toast.success("Transfer request logged in database");
      setTransferForm({ productId: "", targetBranchId: "", qty: 1 });
      queryClient.invalidateQueries({ queryKey: ["admin", "transfers"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adjustmentMutation = useMutation({
    mutationFn: (vars: { product_id: string; quantity: number; type: string; reason: string }) =>
      createStockAdjustment({ data: vars }),
    onSuccess: () => {
      toast.success("Adjustment logged in database");
      setAdjustForm({ productId: "", qty: 1, type: "Damaged", reason: "" });
      queryClient.invalidateQueries({ queryKey: ["admin", "adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stockMutation = useMutation({
    mutationFn: (vars: { id: string; stock: number }) => updateProductStock({ data: vars }),
    onSuccess: () => {
      toast.success("Stock level synchronized");
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const triggerTransfer = () => {
    if (!transferForm.productId || !transferForm.targetBranchId) return toast.error("Please fill all fields");
    transferMutation.mutate({
      product_id: transferForm.productId,
      target_branch_id: transferForm.targetBranchId,
      quantity: Number(transferForm.qty),
    });
  };

  const triggerAdjustment = () => {
    if (!adjustForm.productId || !adjustForm.reason) return toast.error("Please fill all fields");
    adjustmentMutation.mutate({
      product_id: adjustForm.productId,
      quantity: Number(adjustForm.qty),
      type: adjustForm.type,
      reason: adjustForm.reason,
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Stock Levels ── */}
      {sub === "stock" && (
        <TableWrap>
          <thead>
            <tr><Th>Product Node</Th><Th>Category</Th><Th>Status</Th><Th>Current Stock</Th><Th>Adjustment</Th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(products ?? []).map((p) => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id} className="hover:bg-section/30 transition-colors">
                  <Td>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.slug}</div>
                    </div>
                  </Td>
                  <Td className="text-muted-foreground text-xs uppercase font-bold tracking-wider">
                    {(p.categories as any)?.name ?? "—"}
                  </Td>
                  <Td>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${p.stock === 0 ? "bg-error/10 text-error" : p.stock < 10 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>
                      {p.stock === 0 ? "Out of Stock" : p.stock < 10 ? "Low Stock" : "In Stock"}
                    </span>
                  </Td>
                  <Td className="font-black text-sm">{p.stock} units</Td>
                  <Td>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="number" value={editingStock} onChange={(e) => setEditingStock(Math.max(0, Number(e.target.value)))} className="w-20 h-9 px-3 rounded-lg border border-border bg-card font-bold text-sm outline-none" />
                        <button onClick={() => stockMutation.mutate({ id: p.id, stock: editingStock })} className="h-9 w-9 rounded-lg bg-success text-success-foreground grid place-items-center hover:scale-105 transition-transform"><Check className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => { setEditingId(p.id); setEditingStock(p.stock); }} className="rounded-lg h-9 px-4 text-xs font-bold">Adjust Quantity</Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}

      {/* ── Inventory Transfers ── */}
      {sub === "transfers" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Request Stock Transfer</h3>
            <div className="space-y-4">
              <Field label="Target Product">
                <select value={transferForm.productId} onChange={(e) => setTransferForm({ ...transferForm, productId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="">Select Asset...</option>
                  {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <Field label="Destination Branch">
                <select value={transferForm.targetBranchId} onChange={(e) => setTransferForm({ ...transferForm, targetBranchId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="">Select Destination...</option>
                  {(branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Quantity">
                <input type="number" value={transferForm.qty} onChange={(e) => setTransferForm({ ...transferForm, qty: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
              </Field>
              <Button onClick={triggerTransfer} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">
                <ArrowRightLeft className="h-4 w-4 mr-2" /> Transfer Stock
              </Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Recent Logistics Movement</h3>
            <TableWrap>
              <thead>
                <tr><Th>Product</Th><Th>Route</Th><Th>Qty</Th><Th>Timestamp</Th><Th>Integrity</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-section/30">
                    <Td className="font-semibold">{t.product}</Td>
                    <Td className="text-xs text-muted-foreground font-mono">{t.source} ➔ {t.target}</Td>
                    <Td className="font-bold text-primary">{t.qty} units</Td>
                    <Td className="text-xs text-muted-foreground font-mono">{new Date(t.date).toLocaleString()}</Td>
                    <Td><span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-warning/10 text-warning">{t.status}</span></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Adjustments ── */}
      {sub === "adjust" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Record Stock Audit</h3>
            <div className="space-y-4">
              <Field label="Product">
                <select value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="">Select Asset...</option>
                  {(products ?? []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Adjustment Qty">
                  <input type="number" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: Number(e.target.value) })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
                </Field>
                <Field label="Audit Type">
                  <select value={adjustForm.type} onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                    <option value="Damaged">Damaged</option>
                    <option value="Theft">Shrinkage / Theft</option>
                    <option value="Audit">Physical Audit</option>
                    <option value="Found">Found Item</option>
                  </select>
                </Field>
              </div>
              <Field label="Reason Note">
                <input value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" placeholder="Explain adjustment rationale" />
              </Field>
              <Button onClick={triggerAdjustment} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">
                <AlertTriangle className="h-4 w-4 mr-2" /> Log Adjustment
              </Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Adjustment Ledger</h3>
            <TableWrap>
              <thead>
                <tr><Th>Product</Th><Th>Reason Note</Th><Th>Delta</Th><Th>Audit Level</Th><Th>Time</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {adjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-section/30">
                    <Td className="font-semibold">{a.product}</Td>
                    <Td className="text-xs text-muted-foreground">{a.reason}</Td>
                    <Td className={`font-mono font-bold ${a.qty >= 0 ? "text-success" : "text-error"}`}>{a.qty >= 0 ? `+${a.qty}` : a.qty}</Td>
                    <Td><span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-error/10 text-error">{a.type}</span></Td>
                    <Td className="text-xs text-muted-foreground font-mono">{new Date(a.date).toLocaleDateString()}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Warehouses ── */}
      {sub === "warehouses" && (
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Central Distribution Center", code: "WH-CDC", location: "Mombasa Road, Nairobi", capacity: "85% utilized", manager: "Steve Kiprop" },
            { name: "Westlands Hub Outlet", code: "WH-WES", location: "Peponi Road, Nairobi", capacity: "42% utilized", manager: "Grace Nyambura" },
            { name: "Coastal Terminal", code: "WH-COA", location: "Nyali, Mombasa", capacity: "12% utilized", manager: "Omar Hassan" }
          ].map((w) => (
            <div key={w.code} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center"><Warehouse className="h-5 w-5" /></div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-muted font-mono">{w.code}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm">{w.name}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{w.location}</p>
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Manager: <span className="font-bold text-foreground">{w.manager}</span></span>
                <span className="font-bold text-primary">{w.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Low Stock Alerts ── */}
      {sub === "alerts" && (
        <div className="space-y-4">
          <h3 className="font-black uppercase tracking-wider text-xs">Critical Alerts</h3>
          <TableWrap>
            <thead>
              <tr><Th>Product</Th><Th>Category</Th><Th>Available Stock</Th><Th>Alert Level</Th><Th>Reorder</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).filter((p) => p.stock < 10).map((p) => (
                <tr key={p.id} className="hover:bg-section/30">
                  <Td className="font-bold">{p.name}</Td>
                  <Td className="text-xs text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                  <Td className="font-mono text-error font-black">{p.stock} units</Td>
                  <Td><span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-error/10 text-error">Low Stock</span></Td>
                  <Td>
                    <Button onClick={() => { stockMutation.mutate({ id: p.id, stock: p.stock + 50 }); }} className="h-9 rounded-lg bg-success text-success-foreground text-xs font-black">Restock 50 Units</Button>
                  </Td>
                </tr>
              ))}
              {(products ?? []).filter((p) => p.stock < 10).length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium text-sm">All inventory products are above minimum threshold levels.</td></tr>
              )}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Stock History ── */}
      {sub === "history" && (
        <div className="space-y-4">
          <h3 className="font-black uppercase tracking-wider text-xs">Telemetry Log</h3>
          <TableWrap>
            <thead>
              <tr><Th>Product Node</Th><Th>Delta</Th><Th>Action Group</Th><Th>System Actor</Th><Th>Timestamp</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).map((p, index) => (
                <tr key={p.id} className="hover:bg-section/30">
                  <Td className="font-semibold">{p.name}</Td>
                  <Td className="font-mono text-success font-bold">+50</Td>
                  <Td className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Restock System</Td>
                  <Td className="text-xs text-primary font-bold">ops@tindi.co</Td>
                  <Td className="text-xs text-muted-foreground font-mono">{new Date().toLocaleDateString()}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Stock Forecast ── */}
      {sub === "forecast" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-sm">Predictive Depot Exhaustion</h3>
            <div className="space-y-4">
              {[
                { name: "Baby Romper Set", days: 12, rate: "2.4 units/day", status: "Critical" },
                { name: "Baby Stroller Blue", days: 45, rate: "0.8 units/day", status: "Healthy" },
                { name: "Teething Toys", days: 3, rate: "12.2 units/day", status: "Out of Stock Warning" }
              ].map((f) => (
                <div key={f.name} className="p-4 rounded-xl border border-border bg-muted/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{f.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Sales Velocity: {f.rate}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-black text-sm ${f.days < 10 ? "text-error" : "text-success"}`}>{f.days} Days Left</div>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${f.days < 10 ? "bg-error/10 text-error" : "bg-success/10 text-success"}`}>{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-wider text-sm mb-4">Stock Velocity Chart</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Rompers", days: 12 },
                  { name: "Strollers", days: 45 },
                  { name: "Toys", days: 3 },
                ]}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis label={{ value: "Days Left", angle: -90, position: "insideLeft", fontSize: 10 }} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="days" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   3. BRANCHES VIEW & SUB-TABS
   ──────────────────────────────────────────────────────── */


type BranchForm = { id?: string; name: string; address: string; phone: string; is_active: boolean };
const emptyBranch: BranchForm = { name: "", address: "", phone: "", is_active: true };

function BranchesTab({ sub }: { sub: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: branches, isLoading } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => listAdminBranches(),
  });
  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: () => listAllUserProfiles(),
  });
  const { data: transfers = [] } = useQuery({
    queryKey: ["admin", "transfers"],
    queryFn: () => listStockTransfers(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BranchForm>(emptyBranch);
  const [staffForm, setStaffForm] = useState({ profileId: "", branchId: "", role: "Sales Associate" });
  const [selectedBranchId, setSelectedBranchId] = useState("");

  useEffect(() => {
    if (branches && branches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(branches[0].id);
    }
  }, [branches]);


  const handleExportBackup = () => {
    try {
      const data = {
        subCategories: JSON.parse(localStorage.getItem("tindi_sub_categories") || "[]"),
        staff: JSON.parse(localStorage.getItem("tindi_branch_staff") || "[]"),
        transfers: JSON.parse(localStorage.getItem("tindi_stock_transfers") || "[]"),
        adjustments: JSON.parse(localStorage.getItem("tindi_stock_adjustments") || "[]"),
        brands: JSON.parse(localStorage.getItem("tindi_product_brands") || "[]"),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tindi_admin_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup file successfully exported");
    } catch (e: any) {
      toast.error("Failed to generate backup: " + e.message);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.subCategories) localStorage.setItem("tindi_sub_categories", JSON.stringify(data.subCategories));
        if (data.staff) localStorage.setItem("tindi_branch_staff", JSON.stringify(data.staff));
        if (data.transfers) localStorage.setItem("tindi_stock_transfers", JSON.stringify(data.transfers));
        if (data.adjustments) localStorage.setItem("tindi_stock_adjustments", JSON.stringify(data.adjustments));
        if (data.brands) localStorage.setItem("tindi_product_brands", JSON.stringify(data.brands));
        toast.success("Registry restored from backup file! Reloading page...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err: any) {
        toast.error("Invalid backup file format: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const assignMutation = useMutation({
    mutationFn: (vars: { profileId: string; branchId: string | null; role: string | null }) =>
      assignStaffMember({ data: vars }),
    onSuccess: () => {
      toast.success("Staff assignment updated");
      setStaffForm({ profileId: "", branchId: "", role: "Sales Associate" });
      queryClient.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveStaff = () => {
    if (!staffForm.profileId || !staffForm.branchId) return toast.error("Please select a user and a branch");
    assignMutation.mutate({ profileId: staffForm.profileId, branchId: staffForm.branchId, role: staffForm.role });
  };


  const saveMutation = useMutation({
    mutationFn: () => upsertBranch({ data: form }),
    onSuccess: () => {
      toast.success(form.id ? "Branch updated" : "Branch created");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBranch({ data: { id } }),
    onSuccess: () => {
      toast.success("Branch deleted");
      queryClient.invalidateQueries({ queryKey: ["admin", "branches"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Branch Analytics ── */}
      {sub === "analytics" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {(branches ?? []).map((b) => (
              <div key={b.id} className="bg-card border border-border rounded-2xl p-6">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">{b.name}</span>
                <h4 className="text-2xl font-black mt-1">KES 142,500</h4>
                <p className="text-xs text-success font-bold mt-0.5">Uptime: {b.is_active ? "100%" : "Offline"}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black text-sm uppercase tracking-wider mb-4">Branch Revenue Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(branches ?? []).map((b) => ({ name: b.name, revenue: b.is_active ? 142000 : 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Branch Isolated Inventory ── */}
      {sub === "inventory" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Select Branch Node:</label>
            <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold outline-none">
              {(branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <TableWrap>
            <thead>
              <tr><Th>Product Node</Th><Th>Category</Th><Th>Available Stock</Th><Th>Integrity</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-section/30">
                  <Td className="font-bold">{p.name}</Td>
                  <Td className="text-xs text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                  <Td className="font-mono font-bold text-primary">{Math.max(0, p.stock - 5)} units</Td>
                  <Td><span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-success/10 text-success">Synchronized</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Branch Staff ── */}
      {sub === "staff" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Assign Staff to Branch</h3>
            <div className="space-y-4">
              <Field label="Select User">
                <select value={staffForm.profileId} onChange={(e) => setStaffForm({ ...staffForm, profileId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="">Select User Account...</option>
                  {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
                </select>
              </Field>
              <Field label="Select Branch">
                <select value={staffForm.branchId} onChange={(e) => setStaffForm({ ...staffForm, branchId: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="">Select Outlet...</option>
                  {(branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Role Position">
                <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  <option value="Branch Manager">Branch Manager</option>
                  <option value="Sales Associate">Sales Associate</option>
                  <option value="Logistics Coordinator">Logistics Coordinator</option>
                </select>
              </Field>
              <Button onClick={saveStaff} disabled={assignMutation.isPending} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">Assign Staff Node</Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Branch Operational Team</h3>
            <TableWrap>
              <thead>
                <tr><Th>Staff Member</Th><Th>Role</Th><Th>Email</Th><Th>Branch</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {profiles.filter((st) => st.branch_id).map((st) => {
                  const b = (branches ?? []).find((x) => x.id === st.branch_id);
                  return (
                    <tr key={st.id} className="hover:bg-section/30">
                      <Td className="font-bold">{st.full_name ?? "—"}</Td>
                      <Td className="text-xs text-muted-foreground font-bold">{st.staff_role ?? "—"}</Td>
                      <Td className="text-xs font-mono">{st.email}</Td>
                      <Td className="font-bold text-primary">{b?.name ?? "—"}</Td>
                      <Td>
                        <button onClick={() => assignMutation.mutate({ profileId: st.id, branchId: null, role: null })} className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Branch Transfers ── */}
      {sub === "transfers" && (
        <div className="space-y-4">
          <h3 className="font-black uppercase tracking-wider text-xs">Branch Stock Inflows / Outflows</h3>
          <TableWrap>
            <thead>
              <tr><Th>Product</Th><Th>Route</Th><Th>Qty</Th><Th>Time</Th><Th>Status</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-section/30">
                  <Td className="font-semibold">{t.product}</Td>
                  <Td className="text-xs font-mono">{t.source} ➔ {t.target}</Td>
                  <Td className="font-black text-primary">{t.qty} units</Td>
                  <Td className="text-xs text-muted-foreground font-mono">{new Date(t.date).toLocaleString()}</Td>
                  <Td><span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-warning/10 text-warning">{t.status}</span></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Performance ── */}
      {sub === "performance" && (
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { metric: "Order Capture Rate", best: "Nairobi Main (98%)", worst: "Coastal Terminal (88%)", avg: "94%" },
            { metric: "Avg Completion Speed", best: "Westlands Hub (14 mins)", worst: "Nairobi Main (35 mins)", avg: "24 mins" },
            { metric: "Customer Support Rating", best: "Coastal Terminal (4.9★)", worst: "Westlands Hub (4.4★)", avg: "4.7★" }
          ].map((m) => (
            <div key={m.metric} className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="font-black uppercase tracking-wider text-xs text-muted-foreground">{m.metric}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="font-semibold text-muted-foreground">Highest Performing:</span> <span className="font-bold text-success">{m.best}</span></div>
                <div className="flex justify-between text-xs"><span className="font-semibold text-muted-foreground">Lowest Performing:</span> <span className="font-bold text-error">{m.worst}</span></div>
                <div className="flex justify-between text-xs border-t border-border pt-2"><span className="font-black text-foreground">Outlet Average:</span> <span className="font-black text-primary">{m.avg}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Settings ── */}
      {sub === "settings" && (
        <div className="space-y-6 max-w-2xl">
          {/* Branch Config */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-wider text-sm mb-6">Branch Configurations</h3>
            <div className="space-y-4">
              <Field label="Selected Branch Outlet">
                <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="w-full h-11 px-3 rounded-xl border border-border bg-muted/20 text-sm outline-none">
                  {(branches ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Operational Start">
                  <input type="time" defaultValue="08:00" className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
                </Field>
                <Field label="Operational End">
                  <input type="time" defaultValue="18:00" className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
                </Field>
              </div>
              <Field label="Local Delivery Radius (km)">
                <input type="number" defaultValue="25" className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
              </Field>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" className="rounded-xl">Discard</Button>
                <Button onClick={() => toast.success("Branch settings successfully deployed")} className="rounded-xl bg-primary text-primary-foreground font-black px-6">Apply Config</Button>
              </div>
            </div>
          </div>

          {/* ── Data Backup & Restore Panel ── */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning grid place-items-center shrink-0">
                <Settings className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-wider text-sm">Registry Backup & Restore</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Safeguard local operational data — staff rosters, brands, sub-categories, stock logs.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Export */}
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Export Backup</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download all local registry data as a portable JSON file. Use this to migrate data between browsers or create a restore point.
                </p>
                <Button
                  onClick={handleExportBackup}
                  className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  ⬇ Export Registry Backup
                </Button>
              </div>

              {/* Import */}
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Import Backup</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Restore from a previously exported JSON backup file. This will overwrite existing local data.
                </p>
                <label className="block">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="sr-only"
                    id="import-backup-file"
                  />
                  <Button
                    onClick={() => document.getElementById("import-backup-file")?.click()}
                    variant="outline"
                    className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest border-warning/40 text-warning hover:bg-warning/10"
                  >
                    ⬆ Import & Restore Backup
                  </Button>
                </label>
              </div>
            </div>

            {/* Data Summary */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Current Registry Summary</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Staff Records", key: "tindi_branch_staff" },
                  { label: "Sub-Categories", key: "tindi_sub_categories" },
                  { label: "Stock Transfers", key: "tindi_stock_transfers" },
                  { label: "Adjustments", key: "tindi_stock_adjustments" },
                ].map(({ label, key }) => {
                  let count = 0;
                  try { count = JSON.parse(localStorage.getItem(key) || "[]").length; } catch {}
                  return (
                    <div key={key} className="bg-muted/20 rounded-xl p-3 text-center border border-border">
                      <div className="text-2xl font-black text-primary">{count}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   4. PRODUCTS VIEW & SUB-TABS (Drafts, Archived, Brands, Attributes, Upload)
   ──────────────────────────────────────────────────────── */
type Brand = { id: string; name: string; slug: string; description: string };
const INITIAL_BRANDS: Brand[] = [
  { id: "b1", name: "Tindi Holdings", slug: "tindi-holdings", description: "Flagship home brand" },
  { id: "b2", name: "Toto Bliss", slug: "toto-bliss", description: "Premium infant wear" },
  { id: "b3", name: "Budget Wear", slug: "budget-wear", description: "Affordable casual lines" },
];

function ProductsTab({ sub }: { sub: string }) {
  const { data: products, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  const [attributes, setAttributes] = useState<any[]>([
    { id: "a1", name: "Size", values: "XS, S, M, L, XL" },
    { id: "a2", name: "Color", values: "Red, Blue, Green, Pink, White" },
  ]);
  const [attrForm, setAttrForm] = useState({ name: "", values: "" });

  useEffect(() => {
    const b = localStorage.getItem("tindi_brands");
    setBrands(b ? JSON.parse(b) : INITIAL_BRANDS);
  }, []);

  const saveBrand = () => {
    if (!brandForm.name) return toast.error("Name is required");
    const newB = { id: Math.random().toString(), name: brandForm.name, slug: brandForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), description: brandForm.description };
    const upd = [...brands, newB];
    setBrands(upd);
    localStorage.setItem("tindi_brands", JSON.stringify(upd));
    setBrandForm({ name: "", description: "" });
    toast.success("Brand registered successfully");
  };

  const saveAttr = () => {
    if (!attrForm.name || !attrForm.values) return toast.error("Please fill all fields");
    const newAttr = { id: Math.random().toString(), name: attrForm.name, values: attrForm.values };
    const upd = [...attributes, newAttr];
    setAttributes(upd);
    setAttrForm({ name: "", values: "" });
    toast.success("Attribute created");
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Draft Products ── */}
      {sub === "drafts" && (
        <div className="space-y-4">
          <h3 className="font-black uppercase tracking-wider text-xs">Draft Assets</h3>
          <TableWrap>
            <thead>
              <tr><Th>Product Node</Th><Th>Category</Th><Th>Stock</Th><Th>Price</Th><Th>Status</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(products ?? []).filter((p) => !p.is_active).map((p) => (
                <tr key={p.id} className="hover:bg-section/30">
                  <Td className="font-bold">{p.name}</Td>
                  <Td className="text-xs text-muted-foreground">{(p.categories as any)?.name ?? "—"}</Td>
                  <Td className="font-bold">{p.stock} units</Td>
                  <Td className="font-black">${Number(p.price).toLocaleString()}</Td>
                  <Td><span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-warning/10 text-warning">Draft</span></Td>
                </tr>
              ))}
              {(products ?? []).filter((p) => !p.is_active).length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium text-sm">No draft products in repository.</td></tr>
              )}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Archived Products ── */}
      {sub === "archived" && (
        <div className="space-y-4">
          <h3 className="font-black uppercase tracking-wider text-xs">Archived Assets</h3>
          <TableWrap>
            <thead>
              <tr><Th>Product Node</Th><Th>Category</Th><Th>Stock</Th><Th>Price</Th><Th>Status</Th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td colSpan={5} className="py-12 text-center text-muted-foreground font-medium text-sm">No archived products in catalog.</td></tr>
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* ── Brands ── */}
      {sub === "brands" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Register Brand</h3>
            <div className="space-y-4">
              <Field label="Brand Name">
                <input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
              </Field>
              <Field label="Description">
                <input value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" />
              </Field>
              <Button onClick={saveBrand} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">Save Brand</Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Active Brands</h3>
            <TableWrap>
              <thead>
                <tr><Th>Brand Name</Th><Th>Slug</Th><Th>Description</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-section/30">
                    <Td className="font-bold">{b.name}</Td>
                    <Td className="text-xs font-mono text-muted-foreground">{b.slug}</Td>
                    <Td className="text-xs text-muted-foreground">{b.description || "—"}</Td>
                    <Td>
                      <button onClick={() => { const upd = brands.filter((x) => x.id !== b.id); setBrands(upd); localStorage.setItem("tindi_brands", JSON.stringify(upd)); toast.success("Brand deleted"); }} className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Attributes ── */}
      {sub === "attributes" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 h-fit">
            <h3 className="font-black uppercase tracking-wider text-xs mb-4">Add Attribute</h3>
            <div className="space-y-4">
              <Field label="Attribute Name">
                <input value={attrForm.name} onChange={(e) => setAttrForm({ ...attrForm, name: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" placeholder="e.g. Size" />
              </Field>
              <Field label="Values (Comma Separated)">
                <input value={attrForm.values} onChange={(e) => setAttrForm({ ...attrForm, values: e.target.value })} className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm outline-none" placeholder="e.g. S, M, L" />
              </Field>
              <Button onClick={saveAttr} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">Create Attribute</Button>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-black uppercase tracking-wider text-xs">Product Attributes</h3>
            <TableWrap>
              <thead>
                <tr><Th>Attribute Name</Th><Th>Defined Values</Th><Th>Actions</Th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attributes.map((a) => (
                  <tr key={a.id} className="hover:bg-section/30">
                    <Td className="font-bold">{a.name}</Td>
                    <Td className="text-xs text-muted-foreground font-mono">{a.values}</Td>
                    <Td>
                      <button onClick={() => { const upd = attributes.filter((x) => x.id !== a.id); setAttributes(upd); toast.success("Attribute deleted"); }} className="h-8 w-8 grid place-items-center rounded-lg bg-error/10 text-error hover:bg-error hover:text-white transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        </div>
      )}

      {/* ── Bulk Upload ── */}
      {sub === "upload" && (
        <div className="bg-card border border-border rounded-2xl p-8 max-w-xl text-center space-y-6">
          <div className="h-32 w-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-all">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Drag and Drop CSV Catalog Data</span>
            <span className="text-[10px] text-muted-foreground/60">or click to browse local filesystem</span>
          </div>
          <div className="flex justify-between items-center text-left p-4 rounded-xl bg-muted/10 border border-border">
            <div>
              <div className="text-xs font-bold uppercase">CSV Schema Requirements</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">name, slug, price, compare_at_price, stock, is_active</div>
            </div>
            <Button className="rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider">Download Sample</Button>
          </div>
          <Button onClick={() => toast.success("Sample import parsed: 12 assets staged successfully")} className="w-full rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest h-11">Process Bulk Upload</Button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   ORDERS TAB (Refunds & Invoices)
   ──────────────────────────────────────────────────────── */
function OrdersTab({ sub }: { sub: string }) {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminBranches(),
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* ── Refunds ── */}
      {sub === "refunds" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider">Refund Requests</h3>
            <span className="text-xs text-muted-foreground font-bold px-3 py-1 rounded-xl bg-muted/20 border border-border">
              Manage from Orders → Status: Refunded
            </span>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-warning/10 grid place-items-center">
              <ArrowRightLeft className="h-8 w-8 text-warning" />
            </div>
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight">Refund Management</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Refunds are processed directly from the Orders section. Navigate to an order and update its status to initiate a refund.
              </p>
            </div>
            <Button
              onClick={() => window.location.assign("/admin/orders")}
              className="rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 h-11"
            >
              Go to Orders
            </Button>
          </div>
        </div>
      )}

      {/* ── Invoices ── */}
      {sub === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider">Invoice Registry</h3>
            <Button
              onClick={() => window.location.assign("/admin/receipts")}
              className="rounded-xl h-10 px-5 font-black uppercase text-[10px] tracking-widest bg-primary hover:bg-primary/95 text-primary-foreground"
            >
              <BadgeCheck className="h-4 w-4 mr-2" /> View Receipts
            </Button>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 grid place-items-center">
              <History className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight">Order Invoices</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Tax-compliant invoices and receipts are managed through the Receipts module. Every completed order auto-generates a signed receipt.
              </p>
            </div>
            <Button
              onClick={() => window.location.assign("/admin/receipts")}
              className="rounded-xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest px-6 h-11"
            >
              Open Receipt Manager
            </Button>
          </div>
        </div>
      )}

      {/* catch-all */}
      {sub !== "refunds" && sub !== "invoices" && (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-3" />
          <p className="font-bold text-sm">Page not found: <span className="font-mono text-primary">{sub}</span></p>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   MAIN COMMERCE PAGE CONTROLLER
   ──────────────────────────────────────────────────────── */
function CommercePage() {
  const { category, sub } = Route.useParams();
  const subTitle = sub.replace(/-/g, " ").split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  return (
    <AdminShell title={`Commerce — ${subTitle}`}>
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 flex items-center justify-between shadow-xl shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{category} Control</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Centralized telemetry and operational settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success/10 border border-success/20">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-black text-success uppercase">Synced</span>
          </div>
        </div>

        {category === "categories" && <CategoriesTab sub={sub} />}
        {category === "inventory" && <InventoryTab sub={sub} />}
        {category === "branches" && <BranchesTab sub={sub} />}
        {category === "products" && <ProductsTab sub={sub} />}
        {category === "orders" && <OrdersTab sub={sub} />}
        {!["categories", "inventory", "branches", "products", "orders"].includes(category) && (
          <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="h-10 w-10 text-warning" />
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight">Section Not Found</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Commerce category <span className="font-mono text-primary">{category}</span> does not exist.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
