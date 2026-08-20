import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { getMyOrder } from "@/lib/orders.functions";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  head: () => ({ meta: [{ title: "Order Detail — Tindi Group" }] }),
  loader: async ({ params, context }) => {
    const o = await context.queryClient.ensureQueryData({
      queryKey: ["order", params.id],
      queryFn: () => getMyOrder({ data: { id: params.id } }),
    });
    if (!o) throw notFound();
    return {
      dehydratedState: dehydrate(context.queryClient),
    };
  },
  notFoundComponent: () => <div className="p-10 text-center">Order not found.</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-error">{error.message}</div>,
  component: OrderDetail,
});

function OrderDetail() {
  const { dehydratedState } = Route.useLoaderData();
  return (
    <HydrationBoundary state={dehydratedState}>
      <OrderDetailInner />
    </HydrationBoundary>
  );
}

function OrderDetailInner() {
  const { id } = Route.useParams();
  const [cartOpen, setCartOpen] = useState(false);
  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getMyOrder({ data: { id } }),
  });
  if (!order) return null;
  const items = (order.order_items ?? []) as Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-4xl w-full px-6 py-8 flex-1">
        <Link
          to="/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to orders
        </Link>

        <div className="mt-4 rounded-2xl bg-success/10 border border-success/30 text-success p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="h-10 w-10" />
            <div>
              <div className="font-semibold text-lg">Order Confirmed!</div>
              <div className="text-sm">
                Order number: <b>{order.order_number}</b> · Placed{" "}
                {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
          </div>
          <Link to="/my-receipts">
            <Button className="h-10 px-5 rounded-xl bg-success hover:bg-success/90 text-white text-xs font-black uppercase tracking-wider transition-all border-none">
              View Digital Receipt
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6 mt-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Items</h2>
            <div className="divide-y divide-border">
              {items.map((it) => (
                <div key={it.id} className="py-3 flex justify-between text-sm">
                  <div>
                    <div className="font-medium">{it.product_name}</div>
                    <div className="text-xs text-muted-foreground">Qty {it.quantity}</div>
                  </div>
                  <div className="font-bold text-foreground">
                    KES {(Number(it.unit_price) * it.quantity).toLocaleString("en-KE")}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="bg-card border border-border rounded-2xl p-6 h-fit space-y-3 text-sm">
            <h2 className="text-lg font-semibold">Summary</h2>
            <Row k="Status" v={<span className="capitalize font-medium">{order.status}</span>} />
            <Row
              k="Payment"
              v={`${order.payment_method?.toUpperCase()} · ${order.payment_status}`}
            />
            <Row k="Subtotal" v={`KES ${Number(order.subtotal).toLocaleString("en-KE")}`} />
            <Row k="Shipping" v={Number(order.shipping) === 0 ? "FREE" : `KES ${Number(order.shipping).toLocaleString("en-KE")}`} />
            <Row k="VAT (16%)" v={`KES ${Number(order.tax).toLocaleString("en-KE")}`} />
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary font-black text-base">KES {Number(order.total).toLocaleString("en-KE")}</span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1">Ship to</div>
              <div className="font-medium">{order.shipping_name}</div>
              <div className="text-xs text-muted-foreground">
                {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
              </div>
              <div className="text-xs text-muted-foreground">{order.shipping_phone}</div>
            </div>
          </aside>
        </div>
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span>{v}</span>
    </div>
  );
}
