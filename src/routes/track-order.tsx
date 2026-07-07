import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getPublicOrderTrack } from "@/lib/orders.functions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/track-order")({
  head: () => ({ meta: [{ title: "Track Order — Tindi Group" }] }),
  component: TrackOrder,
});

interface OrderResult {
  order_number: string;
  status: string;
  total: string | number;
}

function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);

  const track = useMutation({
    mutationFn: () => getPublicOrderTrack({ data: { orderNumber, email } }),
    onSuccess: (o) => setOrder(o),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => {}} />
      <div className="mx-auto max-w-lg w-full px-6 py-12 flex-1">
        <h1 className="text-3xl font-bold mb-6">Track Your Order</h1>
        {!order ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              track.mutate();
            }}
            className="space-y-4"
          >
            <Input
              placeholder="Order Number e.g. ORD-12345"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={track.isPending} className="w-full">
              {track.isPending ? <Loader2 className="animate-spin" /> : "Track Order"}
            </Button>
          </form>
        ) : (
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h2 className="font-semibold text-lg">Order {order.order_number}</h2>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setOrder(null)}>
              Check Another
            </Button>
          </div>
        )}
      </div>
      <CorporateFooter />
    </div>
  );
}
