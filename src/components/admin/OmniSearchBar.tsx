import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search,
  ShoppingCart,
  Package,
  ScrollText,
  Building2,
  Users,
  Settings,
  Percent,
  ArrowRight,
  Boxes,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listAdminOrders, listAdminProducts, listAdminBranches } from "@/lib/admin.functions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OmniSearchBar({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => listAdminOrders(),
    enabled: open,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => listAdminProducts(),
    enabled: open,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["admin", "branches"],
    queryFn: () => listAdminBranches(),
    enabled: open,
  });

  // Global Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const quickNavs = [
    { label: "Executive Dashboard", to: "/admin/", icon: Activity, group: "Navigation" },
    { label: "Orders Fulfillment", to: "/admin/orders", icon: ShoppingCart, group: "Navigation" },
    { label: "Products Catalog", to: "/admin/products", icon: Package, group: "Navigation" },
    {
      label: "Multi-Branch Inventory",
      to: "/admin/commerce/inventory/stock",
      icon: Boxes,
      group: "Navigation",
    },
    {
      label: "Receipt Telemetry & eTIMS",
      to: "/admin/receipts",
      icon: ScrollText,
      group: "Navigation",
    },
    {
      label: "Branch Operational Centers",
      to: "/admin/branches",
      icon: Building2,
      group: "Navigation",
    },
    { label: "Customer Directory", to: "/admin/customers/all", icon: Users, group: "Navigation" },
    {
      label: "Marketing & Growth Engine",
      to: "/admin/growth/marketing/email",
      icon: Percent,
      group: "Navigation",
    },
    {
      label: "System Roles & Settings",
      to: "/admin/system/settings/general",
      icon: Settings,
      group: "Navigation",
    },
  ];

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return { orders: [], products: [], branches: [], navs: quickNavs.slice(0, 5) };
    }
    const q = query.toLowerCase();

    const matchedOrders = orders
      .filter(
        (o: any) =>
          (o.order_number || "").toLowerCase().includes(q) ||
          (o.shipping_name || "").toLowerCase().includes(q) ||
          (o.shipping_phone || "").toLowerCase().includes(q),
      )
      .slice(0, 5);

    const matchedProducts = products
      .filter(
        (p: any) =>
          (p.name || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q),
      )
      .slice(0, 5);

    const matchedBranches = branches
      .filter(
        (b: any) =>
          (b.name || "").toLowerCase().includes(q) || (b.address || "").toLowerCase().includes(q),
      )
      .slice(0, 3);

    const matchedNavs = quickNavs.filter((n) => n.label.toLowerCase().includes(q));

    return {
      orders: matchedOrders,
      products: matchedProducts,
      branches: matchedBranches,
      navs: matchedNavs,
    };
  }, [query, orders, products, branches]);

  const handleSelect = (to: string) => {
    onOpenChange(false);
    setQuery("");
    navigate({ to: to as any });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 border border-border shadow-2xl bg-card rounded-3xl overflow-hidden font-sans">
        {/* Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/20">
          <Search className="h-5 w-5 text-primary shrink-0 ml-2" />
          <input
            autoFocus
            placeholder="Type a command, order #, SKU, customer name, or receipt..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center h-6 px-2 rounded-lg border border-border bg-card text-[10px] font-black text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-3 space-y-4 scrollbar-thin text-xs">
          {/* Quick Navigations */}
          {filtered.navs.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-1.5 block">
                Quick Navigation
              </span>
              <div className="space-y-1">
                {filtered.navs.map((n) => (
                  <button
                    key={n.label}
                    onClick={() => handleSelect(n.to)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-muted grid place-items-center group-hover:bg-primary/20 text-muted-foreground group-hover:text-primary">
                        <n.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-primary">
                        {n.label}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {filtered.orders.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-1.5 block">
                Orders Found ({filtered.orders.length})
              </span>
              <div className="space-y-1">
                {filtered.orders.map((o: any) => (
                  <button
                    key={o.id}
                    onClick={() => handleSelect("/admin/orders")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 grid place-items-center text-primary">
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          Order #{o.order_number} •{" "}
                          <span className="text-primary">
                            KES {Number(o.total).toLocaleString("en-KE")}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {o.shipping_name || "Customer"} • {o.shipping_phone || "No phone"}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {o.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {filtered.products.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-1.5 block">
                Products Catalog ({filtered.products.length})
              </span>
              <div className="space-y-1">
                {filtered.products.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect("/admin/products")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 grid place-items-center text-emerald-600">
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{p.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          KES {Number(p.price).toLocaleString("en-KE")} • {p.stock} in stock
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        p.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.is_active ? "Live" : "Draft"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Branches Results */}
          {filtered.branches.length > 0 && (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 mb-1.5 block">
                Branches & Warehouses ({filtered.branches.length})
              </span>
              <div className="space-y-1">
                {filtered.branches.map((b: any) => (
                  <button
                    key={b.id}
                    onClick={() => handleSelect("/admin/branches")}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-purple-500/10 grid place-items-center text-purple-600">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">{b.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {b.address || "Main Logistics Node"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() &&
            filtered.orders.length === 0 &&
            filtered.products.length === 0 &&
            filtered.branches.length === 0 &&
            filtered.navs.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="font-bold">No matching records found for "{query}"</p>
                <p className="text-[11px] mt-0.5">
                  Try searching by order #, customer phone, or SKU.
                </p>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
              ↓
            </kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-card font-mono text-[10px]">
              ↵
            </kbd>
            <span>to select</span>
          </div>
          <span>Tindi Holdings Enterprise Search</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
