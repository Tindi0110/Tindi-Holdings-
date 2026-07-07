import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import { listAdminProducts, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { listCategories } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Box, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/_admin/admin/products")({
  head: () => ({
    meta: [{ title: "Product Inventory — Tindi Group" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductsAdmin,
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  category_id: string;
  stock: number;
  is_active: boolean;
};

const empty: ProductForm = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compare_at_price: null,
  image_url: "",
  category_id: "",
  stock: 0,
  is_active: true,
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
  });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(empty);

  const save = useMutation({
    mutationFn: () =>
      upsertProduct({
        data: {
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          image_url: form.image_url || null,
          category_id: form.category_id || null,
          stock: Number(form.stock),
          is_active: form.is_active,
        },
      }),
    onSuccess: () => {
      toast.success(form.id ? "Product updated" : "Product created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const edit = (p: NonNullable<typeof products>[number]) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: "",
      price: Number(p.price),
      compare_at_price: null,
      image_url: p.image_url ?? "",
      category_id: "",
      stock: p.stock,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  return (
    <AdminShell title="Product Inventory">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-end gap-3 px-1">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
                Global Catalog
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">Enterprise Asset Registry</h2>
          </div>
          <Button
            onClick={() => {
              setForm(empty);
              setOpen(true);
            }}
            className="rounded-xl px-6 bg-primary shadow-lg shadow-primary/20 font-black uppercase text-[10px] tracking-widest h-11"
          >
            <Plus className="h-4 w-4 mr-2" /> Initialize Asset
          </Button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl shadow-black/5"
        >
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-muted/30 text-[9px] text-muted-foreground border-b border-border">
                <tr>
                  {[
                    "Product Node",
                    "Channel Group",
                    "Fixed Valuation",
                    "Stock Level",
                    "Integrity",
                    "Control",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-5 text-left font-black uppercase tracking-widest whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(products ?? []).map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-muted/50 overflow-hidden border border-border shadow-inner shrink-0 relative group-hover:scale-105 transition-transform duration-300">
                          {p.image_url ? (
                            <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-muted-foreground/30">
                              <Box className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-foreground/90">{p.name}</div>
                          <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                            {p.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-muted-foreground whitespace-nowrap font-bold text-[10px] uppercase tracking-widest">
                      {(p.categories as { name: string } | null)?.name ?? "—"}
                    </td>
                    <td className="px-8 py-5 font-black whitespace-nowrap text-base">
                      ${Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`font-black text-sm ${p.stock < 10 ? "text-error" : "text-foreground"}`}
                        >
                          {p.stock} Units
                        </span>
                        <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.stock < 10 ? "bg-error" : "bg-success"}`}
                            style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-tighter shadow-sm ${p.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                      >
                        {p.is_active ? "Synchronized" : "Offline"}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => edit(p)}
                          className="h-10 w-10 grid place-items-center rounded-xl bg-muted/50 hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `CRITICAL ACTION: Purge product "${p.name}" from registry? All related analytical clusters will be affected.`,
                              )
                            )
                              del.mutate(p.id);
                          }}
                          className="h-10 w-10 grid place-items-center rounded-xl bg-error/5 text-error/60 hover:bg-error hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-card">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {form.id ? "Edit Product Master" : "Initialize New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                Core Identification
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Identity Name">
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        slug: form.id
                          ? form.slug
                          : e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/^-|-$/g, ""),
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </Field>
                <Field label="System Slug">
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm font-mono focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </Field>
              </div>
              <Field label="Detailed Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  rows={4}
                />
              </Field>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                Asset Management
              </h4>
              <Field label="Primary Asset URL">
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="https://..."
                />
              </Field>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/30 px-2 py-1 rounded w-fit">
                Commerce & Logistics
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Base Price">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </Field>
                <Field label="Compare At">
                  <input
                    type="number"
                    step="0.01"
                    value={form.compare_at_price ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        compare_at_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </Field>
                <Field label="Target Stock">
                  <input
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </Field>
              </div>
              <Field label="Categorization Group">
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option value="">— Uncategorized —</option>
                  {(cats ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            <div className="flex items-center gap-2 pt-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
                <span className="ml-3 text-sm font-semibold">Active Inventory Status</span>
              </label>
            </div>
          </div>
          <DialogFooter className="p-6 bg-muted/10 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl px-6"
            >
              Discard Changes
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="rounded-xl px-8 shadow-lg shadow-primary/20"
            >
              {save.isPending ? "Synchronizing..." : "Finalize Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold block mb-1">{label}</label>
      {children}
    </div>
  );
}
