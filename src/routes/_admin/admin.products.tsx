import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminSidebar";
import {
  listAdminProducts,
  upsertProduct,
  deleteProduct,
  toggleProductStatus,
  updateProductStock,
  bulkUpdateProductStatus,
  listProductVariants,
  upsertProductVariant,
  deleteProductVariant,
} from "@/lib/admin.functions";
import { listCategories } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Box,
  Upload,
  Loader2,
  Image as ImageIcon,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Layers,
  Filter,
  RefreshCw,
  Minus,
  Check,
  TrendingUp,
  SlidersHorizontal,
  Grid,
  Tag,
  Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ImageUploader } from "@/components/ui/image-uploader";
import { SafeImage } from "@/components/ui/safe-image";

const productsSearchSchema = z.object({
  new: z.union([z.string(), z.boolean()]).optional(),
});

export const Route = createFileRoute("/_admin/admin/products")({
  validateSearch: productsSearchSchema,
  head: () => ({
    meta: [
      { title: "Product Inventory & Catalog — Tindi Holdings Ltd" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProductsAdmin,
});

type ProductVariantItem = {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

type BundleItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
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

const emptyForm: ProductForm = {
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
  const search = Route.useSearch();
  const showNew = search.new;

  const {
    data: products = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);

  // Variant Matrix & Bundle States
  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [opt1Name, setOpt1Name] = useState("Size");
  const [opt1Values, setOpt1Values] = useState("S, M, L, XL");
  const [opt2Name, setOpt2Name] = useState("Color");
  const [opt2Values, setOpt2Values] = useState("Black, Silver");
  const [isBundle, setIsBundle] = useState(false);
  const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);
  const [selectedBundleProduct, setSelectedBundleProduct] = useState("");

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "low_stock">("all");

  // Multi-selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (showNew === "true" || showNew === true) {
      setForm(emptyForm);
      setOpen(true);
    }
  }, [showNew]);

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(filePath, file, { upsert: true });

      if (error) {
        // Fallback to Base64 Data URL if bucket access policy requires fallback
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setForm((prev) => ({ ...prev, image_url: result }));
          toast.success("Image file loaded into asset manager");
          setUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl(filePath);
      const publicUrl = publicUrlData.publicUrl;
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("Image uploaded to storage successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Generate Variant Matrix (Cartesian Product)
  const generateMatrix = () => {
    const list1 = opt1Values
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const list2 = opt2Values
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!list1.length && !list2.length) {
      toast.error("Please enter at least one option value");
      return;
    }

    const newVariants: ProductVariantItem[] = [];
    const baseSlug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const basePrice = Number(form.price) || 0;

    if (list1.length && list2.length) {
      for (const v1 of list1) {
        for (const v2 of list2) {
          const varName = `${v1} / ${v2}`;
          const varSku = `${baseSlug.toUpperCase().slice(0, 8)}-${v1.toUpperCase().slice(0, 3)}-${v2.toUpperCase().slice(0, 3)}`;
          newVariants.push({
            name: varName,
            sku: varSku,
            price: basePrice,
            stock: Number(form.stock) || 10,
          });
        }
      }
    } else {
      const singleList = list1.length ? list1 : list2;
      for (const v of singleList) {
        const varSku = `${baseSlug.toUpperCase().slice(0, 8)}-${v.toUpperCase().slice(0, 4)}`;
        newVariants.push({
          name: v,
          sku: varSku,
          price: basePrice,
          stock: Number(form.stock) || 10,
        });
      }
    }

    setVariants(newVariants);
    toast.success(`✨ Generated ${newVariants.length} product variants matrix!`);
  };

  const addCustomVariant = () => {
    const baseSlug = form.slug || "SKU";
    setVariants([
      ...variants,
      {
        name: "Custom Variant",
        sku: `${baseSlug.toUpperCase().slice(0, 6)}-VAR-${variants.length + 1}`,
        price: Number(form.price) || 0,
        stock: 10,
      },
    ]);
  };

  const removeVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const addBundleComponent = () => {
    if (!selectedBundleProduct) return;
    const targetProd = products.find((p: any) => p.id === selectedBundleProduct);
    if (!targetProd) return;

    if (bundleItems.some((b) => b.product_id === targetProd.id)) {
      toast.info("Component already added to bundle kit");
      return;
    }

    setBundleItems([
      ...bundleItems,
      {
        product_id: targetProd.id,
        product_name: targetProd.name,
        quantity: 1,
        unit_price: Number(targetProd.price),
      },
    ]);
    setSelectedBundleProduct("");
  };

  const removeBundleComponent = (prodId: string) => {
    setBundleItems(bundleItems.filter((b) => b.product_id !== prodId));
  };

  const save = useMutation({
    mutationFn: async () => {
      const res = await upsertProduct({
        data: {
          id: form.id,
          name: form.name,
          slug: form.slug,
          description: form.description,
          price: Number(form.price),
          compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
          image_url: form.image_url,
          category_id: form.category_id || null,
          stock: Number(form.stock),
          is_active: form.is_active,
        },
      });

      const prodId = form.id || res?.id;
      if (prodId && variants.length > 0) {
        for (const v of variants) {
          try {
            await upsertProductVariant({
              data: {
                id: v.id,
                product_id: prodId,
                name: v.name,
                sku: v.sku,
                price: Number(v.price),
                stock: Number(v.stock),
              },
            });
          } catch (err) {
            console.warn("Variant save notice:", err);
          }
        }
      }
      return res;
    },
    onSuccess: () => {
      toast.success(form.id ? "Product updated successfully" : "Product initialized successfully");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStatusMut = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) => toggleProductStatus({ data: vars }),
    onSuccess: (_, vars) => {
      toast.success(vars.is_active ? "Product published live" : "Product moved to drafts");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const stockMut = useMutation({
    mutationFn: (vars: { id: string; stock: number }) => updateProductStock({ data: vars }),
    onSuccess: () => {
      toast.success("Stock level updated");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkMut = useMutation({
    mutationFn: (vars: { ids: string[]; action: "activate" | "draft" | "delete" }) =>
      bulkUpdateProductStatus({ data: vars }),
    onSuccess: (res, vars) => {
      toast.success(
        vars.action === "delete"
          ? `${vars.ids.length} products deleted`
          : `${vars.ids.length} products updated`,
      );
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Edit Action
  const edit = (p: any) => {
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      price: Number(p.price),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      stock: p.stock,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  // Duplicate / Clone Action
  const duplicate = (p: any) => {
    setForm({
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy-${Date.now().toString().slice(-4)}`,
      description: p.description || "",
      price: Number(p.price),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      stock: p.stock,
      is_active: false, // Clone as draft
    });
    setOpen(true);
    toast.info("Product cloned as a draft. Review and save.");
  };

  // Metrics KPI calculations
  const stats = useMemo(() => {
    const totalCount = products.length;
    const activeCount = products.filter((p) => p.is_active).length;
    const draftCount = products.filter((p) => !p.is_active).length;
    const lowStockCount = products.filter((p) => p.stock < 10).length;
    const totalValuation = products.reduce((acc, p) => acc + Number(p.price) * (p.stock || 0), 0);
    return { totalCount, activeCount, draftCount, lowStockCount, totalValuation };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p: any) => {
      // Category filter
      if (selectedCategory !== "all" && p.category_id !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "draft" && p.is_active) return false;
      if (statusFilter === "low_stock" && p.stock >= 10) return false;

      // Search filter
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchSlug = (p.slug || "").toLowerCase().includes(q);
        const matchId = (p.id || "").toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchId) return false;
      }
      return true;
    });
  }, [products, selectedCategory, statusFilter, searchTerm]);

  // Selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <AdminShell title="Product Inventory & Catalog">
      <div className="space-y-6">
        {/* ═══════════════════════════════════════════════════════════════
            1. KPI METRICS OVERVIEW BAR (KES)
           ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">
              Total SKUs
            </span>
            <div className="text-2xl font-black mt-1 text-foreground">{stats.totalCount}</div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">Registered items</span>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest block">
              Live Active
            </span>
            <div className="text-2xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              {stats.activeCount}
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Published on store
            </span>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-widest block">
              Drafts / Offline
            </span>
            <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
              {stats.draftCount}
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Hidden from catalog
            </span>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] font-black uppercase text-error tracking-widest block">
              Low Stock Alert
            </span>
            <div className="text-2xl font-black mt-1 text-error">{stats.lowStockCount}</div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              &lt; 10 units remaining
            </span>
          </div>

          <div className="bg-card border border-border p-4 rounded-2xl shadow-xs col-span-2 lg:col-span-1">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest block">
              Inventory Value (KES)
            </span>
            <div className="text-xl font-black mt-1 text-primary truncate">
              KES {stats.totalValuation.toLocaleString("en-KE")}
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              At current unit price
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            2. CONTROLS, SEARCH & FILTER BAR
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products by title, slug, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by Category"
                className="h-11 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {cats.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="h-11 px-4 rounded-xl text-xs font-bold"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />{" "}
                Refresh
              </Button>

              {/* New Product CTA */}
              <Button
                onClick={() => {
                  setForm(emptyForm);
                  setOpen(true);
                }}
                className="rounded-xl px-5 bg-primary font-black uppercase text-xs tracking-wider h-11 shadow-sm flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>

          {/* Status Quick Filter Tabs */}
          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: `All Products (${products.length})` },
                { id: "active", label: `Active (${stats.activeCount})` },
                { id: "draft", label: `Drafts (${stats.draftCount})` },
                { id: "low_stock", label: `Low Stock (${stats.lowStockCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            3. BULK ACTIONS BAR (When items selected)
           ═══════════════════════════════════════════════════════════════ */}
        {selectedIds.length > 0 && (
          <div className="bg-primary/10 border border-primary/30 p-3.5 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-primary uppercase tracking-wider">
                {selectedIds.length} Selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => bulkMut.mutate({ ids: selectedIds, action: "activate" })}
                className="rounded-xl h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Publish Live
              </Button>
              <Button
                size="sm"
                onClick={() => bulkMut.mutate({ ids: selectedIds, action: "draft" })}
                className="rounded-xl h-8 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                Move to Drafts
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm(`Permanently delete ${selectedIds.length} selected products?`)) {
                    bulkMut.mutate({ ids: selectedIds, action: "delete" });
                  }
                }}
                className="rounded-xl h-8 text-xs font-bold"
              >
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            4. PRODUCTS DATA TABLE
           ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead className="bg-muted/20 text-[10px] text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length > 0 && selectedIds.length === filteredProducts.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-border cursor-pointer h-4 w-4"
                    />
                  </th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">
                    Price (KES)
                  </th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">
                    Stock & Inventory
                  </th>
                  <th className="px-5 py-4 text-left font-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right font-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-xs text-muted-foreground"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />{" "}
                      Loading products catalogue...
                    </td>
                  </tr>
                )}
                {filteredProducts.map((p: any) => {
                  const isSelected = selectedIds.includes(p.id);
                  const catName = p.categories?.name || "General";
                  const isLowStock = p.stock < 10;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        isSelected ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          className="rounded border-border cursor-pointer h-4 w-4"
                        />
                      </td>

                      {/* Product Thumbnail & Identity */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-xl bg-muted/40 overflow-hidden border border-border shrink-0">
                            <SafeImage
                              src={p.image_url}
                              alt={p.name}
                              aspectRatio="square"
                              objectFit="contain"
                              fallbackIcon={<Box className="h-4 w-4 text-muted-foreground/50" />}
                              fallbackText="No img"
                              showSkeleton={false}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-foreground truncate max-w-xs">
                              {p.name}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span>slug: {p.slug}</span>
                              {p.is_active && (
                                <Link
                                  to="/product/$slug"
                                  params={{ slug: p.slug }}
                                  target="_blank"
                                  className="text-primary hover:underline inline-flex items-center gap-0.5 font-bold"
                                >
                                  Storefront <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground">
                          {catName}
                        </span>
                      </td>

                      {/* Price in KES */}
                      <td className="px-5 py-4">
                        <div className="font-black text-primary text-sm">
                          KES {Number(p.price).toLocaleString("en-KE")}
                        </div>
                        {p.compare_at_price && Number(p.compare_at_price) > Number(p.price) && (
                          <div className="text-[10px] text-muted-foreground line-through">
                            KES {Number(p.compare_at_price).toLocaleString("en-KE")}
                          </div>
                        )}
                      </td>

                      {/* Stock Level with In-Line Adjuster */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Quick stepper */}
                          <div className="flex items-center border border-border rounded-lg bg-muted/20 px-1 py-0.5">
                            <button
                              onClick={() =>
                                stockMut.mutate({ id: p.id, stock: Math.max(0, p.stock - 1) })
                              }
                              title="Decrease Stock (-1)"
                              className="h-5 w-5 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer rounded"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span
                              className={`w-10 text-center font-black text-xs ${
                                isLowStock ? "text-error" : "text-foreground"
                              }`}
                            >
                              {p.stock}
                            </span>
                            <button
                              onClick={() => stockMut.mutate({ id: p.id, stock: p.stock + 1 })}
                              title="Increase Stock (+1)"
                              className="h-5 w-5 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer rounded"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          {isLowStock && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-error/10 text-error">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Toggle (Active / Draft) */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            toggleStatusMut.mutate({ id: p.id, is_active: !p.is_active })
                          }
                          className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                            p.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/20"
                          }`}
                          title={`Click to ${p.is_active ? "set as Draft" : "publish Live"}`}
                        >
                          {p.is_active ? "● Live Store" : "○ Draft Asset"}
                        </button>
                      </td>

                      {/* Action Menu (Clone, Edit, Delete) */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Clone / Duplicate */}
                          <button
                            onClick={() => duplicate(p)}
                            title="Duplicate / Clone product"
                            className="h-8 w-8 rounded-lg bg-muted hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all grid place-items-center cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit Form */}
                          <button
                            onClick={() => edit(p)}
                            title="Edit product master"
                            className="h-8 w-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all grid place-items-center cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                del.mutate(p.id);
                              }
                            }}
                            title="Delete product"
                            className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all grid place-items-center cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!isLoading && filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-xs text-muted-foreground"
                    >
                      No matching products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          5. PRODUCT CREATION / EDIT MODAL
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border border-border shadow-2xl bg-card rounded-3xl">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl font-black tracking-tight text-foreground uppercase">
              {form.id ? "Edit Product Master" : "Initialize New Product"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin"
          >
            {/* Core Identification */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md w-fit">
                1. Product Information
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Product Name / Title">
                  <input
                    required
                    placeholder="e.g. 55-inch 4K Smart OLED TV"
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
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field label="SEO Slug (URL Identifier)">
                  <input
                    required
                    placeholder="e.g. 55-inch-4k-smart-oled-tv"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Store Category">
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="">Select Category (Optional)</option>
                    {cats.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Publishing Status">
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_active: true })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        form.is_active
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      ● Live Store
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_active: false })}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        !form.is_active
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      ○ Draft Asset
                    </button>
                  </div>
                </Field>
              </div>

              <Field label="Description & Specs">
                <textarea
                  rows={3}
                  placeholder="Detailed specifications, warranty information, and package contents..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                />
              </Field>
            </section>

            {/* Pricing & Stock (KES) */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md w-fit">
                2. Pricing & Stock Valuation (KES)
              </h4>
              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Retail Price (KES)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field label="Compare-At Price (KES)">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. Was 55000"
                    value={form.compare_at_price ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        compare_at_price: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>

                <Field label="Units In Stock">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </Field>
              </div>
            </section>

            {/* Media Upload */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md w-fit">
                3. Product Media & Assets
              </h4>

              <ImageUploader
                value={form.image_url}
                onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
                bucket="products"
                folder="catalog"
                label="Primary Product Image"
                helperText="Upload high-res PNG, JPEG, WebP, or AVIF (Up to 5MB)"
              />

              <div className="pt-1">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Or Direct Image URL
                </label>
                <input
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full h-10 px-4 rounded-xl border border-border bg-card text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </section>

            {/* 4. Variant Matrix Generator */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md w-fit flex items-center gap-1.5">
                  <Grid className="h-3 w-3" /> 4. Product Variant Matrix
                </h4>
                <span className="text-[10px] text-muted-foreground font-bold">
                  {variants.length} Matrix SKUs Defined
                </span>
              </div>

              {/* Option axes generator controls */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Option 1 Name & Values (e.g. Size)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={opt1Name}
                        onChange={(e) => setOpt1Name(e.target.value)}
                        placeholder="Size"
                        className="w-24 h-9 px-2.5 rounded-lg border border-border bg-card text-xs font-bold"
                      />
                      <input
                        value={opt1Values}
                        onChange={(e) => setOpt1Values(e.target.value)}
                        placeholder="S, M, L, XL"
                        className="flex-1 h-9 px-3 rounded-lg border border-border bg-card text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Option 2 Name & Values (e.g. Color)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={opt2Name}
                        onChange={(e) => setOpt2Name(e.target.value)}
                        placeholder="Color"
                        className="w-24 h-9 px-2.5 rounded-lg border border-border bg-card text-xs font-bold"
                      />
                      <input
                        value={opt2Values}
                        onChange={(e) => setOpt2Values(e.target.value)}
                        placeholder="Black, Silver, Gold"
                        className="flex-1 h-9 px-3 rounded-lg border border-border bg-card text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    type="button"
                    onClick={generateMatrix}
                    size="sm"
                    className="bg-primary text-primary-foreground font-black text-[11px] uppercase rounded-xl h-8 px-4 gap-1.5"
                  >
                    <Grid className="h-3 w-3" /> Auto-Generate Matrix ({opt1Name} × {opt2Name})
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomVariant}
                    size="sm"
                    className="rounded-xl h-8 text-[11px] font-bold"
                  >
                    + Add Single Variant
                  </Button>
                </div>
              </div>

              {/* Variants table */}
              {variants.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <table className="w-full">
                    <thead className="bg-muted/30 text-[10px] text-muted-foreground uppercase font-black border-b border-border">
                      <tr>
                        <th className="px-3 py-2 text-left">Variant Title</th>
                        <th className="px-3 py-2 text-left">SKU Code</th>
                        <th className="px-3 py-2 text-right w-28">Price (KES)</th>
                        <th className="px-3 py-2 text-right w-24">Stock</th>
                        <th className="px-3 py-2 text-center w-12">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {variants.map((v, i) => (
                        <tr key={i} className="hover:bg-muted/10">
                          <td className="px-3 py-2">
                            <input
                              value={v.name}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[i].name = e.target.value;
                                setVariants(copy);
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={v.sku}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[i].sku = e.target.value;
                                setVariants(copy);
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-mono"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[i].price = Number(e.target.value);
                                setVariants(copy);
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              value={v.stock}
                              onChange={(e) => {
                                const copy = [...variants];
                                copy[i].stock = Number(e.target.value);
                                setVariants(copy);
                              }}
                              className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs font-bold text-right"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              className="text-muted-foreground hover:text-destructive cursor-pointer"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* 5. Product Bundles & Kitting (BOM) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md w-fit flex items-center gap-1.5">
                  <Boxes className="h-3 w-3" /> 5. Product Bundling & Kitting (BOM)
                </h4>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBundle}
                    onChange={(e) => setIsBundle(e.target.checked)}
                    className="rounded border-border"
                  />
                  <span>Enable Multi-Product Bundle</span>
                </label>
              </div>

              {isBundle && (
                <div className="p-4 rounded-2xl bg-muted/20 border border-border space-y-3">
                  <div className="flex gap-2">
                    <select
                      value={selectedBundleProduct}
                      onChange={(e) => setSelectedBundleProduct(e.target.value)}
                      className="flex-1 h-10 px-3 rounded-xl border border-border bg-card text-xs font-bold"
                    >
                      <option value="">Select Child Product to Bundle...</option>
                      {products
                        .filter((p: any) => p.id !== form.id)
                        .map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (KES {Number(p.price).toLocaleString("en-KE")})
                          </option>
                        ))}
                    </select>
                    <Button
                      type="button"
                      onClick={addBundleComponent}
                      className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase px-4 h-10"
                    >
                      + Add Component
                    </Button>
                  </div>

                  {bundleItems.length > 0 && (
                    <div className="border border-border rounded-xl overflow-hidden text-xs">
                      <table className="w-full">
                        <thead className="bg-muted/30 text-[10px] text-muted-foreground uppercase font-black border-b border-border">
                          <tr>
                            <th className="px-3 py-2 text-left">Bundle Item</th>
                            <th className="px-3 py-2 text-center w-20">Qty</th>
                            <th className="px-3 py-2 text-right w-28">Unit Price</th>
                            <th className="px-3 py-2 text-center w-12">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {bundleItems.map((b) => (
                            <tr key={b.product_id}>
                              <td className="px-3 py-2 font-bold">{b.product_name}</td>
                              <td className="px-3 py-2 text-center">
                                <input
                                  type="number"
                                  min={1}
                                  value={b.quantity}
                                  onChange={(e) => {
                                    const copy = bundleItems.map((item) =>
                                      item.product_id === b.product_id
                                        ? { ...item, quantity: Number(e.target.value) }
                                        : item,
                                    );
                                    setBundleItems(copy);
                                  }}
                                  className="w-14 h-7 text-center rounded-md border border-border bg-card font-bold"
                                />
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-bold text-muted-foreground">
                                KES {b.unit_price.toLocaleString("en-KE")}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeBundleComponent(b.product_id)}
                                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                                >
                                  ✕
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="p-3 bg-muted/30 border-t border-border flex justify-between items-center text-xs font-bold">
                        <span>Combined Component Value:</span>
                        <span className="font-black text-primary">
                          KES{" "}
                          {bundleItems
                            .reduce((sum, b) => sum + b.unit_price * b.quantity, 0)
                            .toLocaleString("en-KE")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            <DialogFooter className="pt-4 border-t border-border gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="rounded-xl font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={save.isPending}
                className="rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-6 h-11"
              >
                {save.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
                  </>
                ) : form.id ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
        {label}
      </label>
      {children}
    </div>
  );
}
