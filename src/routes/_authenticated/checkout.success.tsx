import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { verifyStripeSession, capturePayPalOrder } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/checkout/success")({
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
    order_id: typeof s.order_id === "string" ? s.order_id : "",
    provider: typeof s.provider === "string" ? s.provider : undefined,
    token: typeof s.token === "string" ? s.token : undefined,
  }),
  head: () => ({ meta: [{ title: "Payment Success — Tindi Group" }] }),
  component: SuccessPage,
});

function SuccessPage() {
  const { session_id, order_id, provider, token } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "ok" | "fail">("verifying");

  const verifyStripe = useMutation({
    mutationFn: () => verifyStripeSession({ data: { sessionId: session_id!, orderId: order_id } }),
  });
  const capturePaypal = useMutation({
    mutationFn: () => capturePayPalOrder({ data: { orderId: order_id, paypalOrderId: token! } }),
  });

  useEffect(() => {
    (async () => {
      try {
        if (provider === "paypal" && token) {
          const r = await capturePaypal.mutateAsync();
          setStatus(r.paid ? "ok" : "fail");
        } else if (session_id) {
          const r = await verifyStripe.mutateAsync();
          setStatus(r.paid ? "ok" : "fail");
        } else {
          setStatus("ok");
        }
      } catch {
        setStatus("fail");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader />
      <div className="flex-1 grid place-items-center px-6 py-16">
        <div className="bg-card border border-border rounded-2xl p-10 text-center max-w-md w-full">
          {status === "verifying" && (
            <>
              <Loader2 className="h-14 w-14 mx-auto text-primary animate-spin" />
              <h1 className="text-2xl font-bold mt-4">Verifying payment…</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Hang tight, this only takes a moment.
              </p>
            </>
          )}
          {status === "ok" && (
            <>
              <CheckCircle2 className="h-16 w-16 mx-auto text-success" />
              <h1 className="text-2xl font-bold mt-4">Payment Successful</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Thanks for your order — we'll start preparing it right away.
              </p>
              <Button
                onClick={() => navigate({ to: "/orders/$id", params: { id: order_id } })}
                className="mt-6"
              >
                View Order
              </Button>
            </>
          )}
          {status === "fail" && (
            <>
              <XCircle className="h-16 w-16 mx-auto text-error" />
              <h1 className="text-2xl font-bold mt-4">Payment Not Confirmed</h1>
              <p className="text-sm text-muted-foreground mt-2">
                We couldn't confirm your payment yet. If you were charged, check your order in a
                moment.
              </p>
              <div className="flex gap-2 justify-center mt-6">
                <Link to="/orders/$id" params={{ id: order_id }}>
                  <Button variant="outline">View Order</Button>
                </Link>
                <Link to="/checkout">
                  <Button>Try Again</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
      <CorporateFooter />
    </div>
  );
}
