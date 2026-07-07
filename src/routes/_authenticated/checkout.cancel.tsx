import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";

export const Route = createFileRoute("/_authenticated/checkout/cancel")({
  validateSearch: (s: Record<string, unknown>) => ({
    order_id: typeof s.order_id === "string" ? s.order_id : "",
  }),
  head: () => ({ meta: [{ title: "Payment Cancelled — Tindi Group" }] }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => {}} />
      <div className="flex-1 grid place-items-center px-6 py-16">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md w-full">
          <XCircle className="h-16 w-16 mx-auto text-warning" />
          <h1 className="text-2xl font-bold mt-4">Payment Cancelled</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your order was created but no payment was made. You can retry whenever you're ready.
          </p>
          <div className="flex gap-2 justify-center mt-6">
            <Link to="/orders">
              <Button variant="outline">My Orders</Button>
            </Link>
            <Link to="/checkout">
              <Button>Back to Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
      <CorporateFooter />
    </div>
  );
}
