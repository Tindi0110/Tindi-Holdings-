import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { listMyOrders } from "@/lib/orders.functions";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/orders/")({
  head: () => ({ meta: [{ title: "My Orders — Tindi Group" }] }),
  component: OrdersPage,
});

const statusColor: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  processing: "bg-conversion/10 text-conversion",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

function OrdersPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => listMyOrders(),
  });
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-5xl w-full px-6 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-section animate-pulse" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
            <Link to="/shop">
              <Button>Start shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {orders.map((o) => (
              <Link
                key={o.id}
                to="/orders/$id"
                params={{ id: o.id }}
                className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-section"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{o.order_number}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="font-bold text-foreground text-sm">KES {Number(o.total).toLocaleString("en-KE")}</div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-md capitalize ${statusColor[o.status] ?? ""}`}
                >
                  {o.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
