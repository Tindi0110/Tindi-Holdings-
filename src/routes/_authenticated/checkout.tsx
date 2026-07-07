import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, Wallet, Banknote, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { placeOrder } from "@/lib/orders.functions";
import {
  createStripeCheckout,
  createPayPalOrder,
  initiateMpesaSTK,
} from "@/lib/payments.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Tindi Group" }] }),
  component: CheckoutPage,
});

type PaymentMethod = "stripe" | "paypal" | "mpesa" | "cod";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("stripe");
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "",
    shipping_zip: "",
    shipping_phone: "",
  });

  const subtotal = items.reduce((s, i) => {
    const p = i.products as unknown as { price: number } | null;
    return s + (p ? Number(p.price) * i.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 50 ? 0 : 5.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const place = useMutation({
    mutationFn: async () => {
      const order = await placeOrder({
        data: {
          ...form,
          payment_method: method,
          payment_phone: method === "mpesa" ? phone : null,
        },
      });
      if (method === "cod") {
        return { ...order, redirect: null as string | null };
      }
      if (method === "stripe") {
        const { url } = await createStripeCheckout({ data: { orderId: order.orderId } });
        return { ...order, redirect: url };
      }
      if (method === "paypal") {
        const { url } = await createPayPalOrder({ data: { orderId: order.orderId } });
        return { ...order, redirect: url };
      }
      if (method === "mpesa") {
        if (!phone) throw new Error("Enter your M-Pesa phone number");
        await initiateMpesaSTK({ data: { orderId: order.orderId, phone } });
        return { ...order, redirect: null as string | null };
      }
      return { ...order, redirect: null };
    },
    onSuccess: (r) => {
      if (r.redirect) {
        window.location.href = r.redirect;
        return;
      }
      toast.success(`Order ${r.orderNumber} placed!`);
      navigate({ to: "/orders/$id", params: { id: r.orderId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <CorporateHeader onCartOpen={() => setCartOpen(true)} />
        <div className="flex-1 grid place-items-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <Link to="/shop">
              <Button className="mt-4">Browse products</Button>
            </Link>
          </div>
        </div>
        <CorporateFooter />
        <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-6xl w-full px-6 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-1">Checkout</h1>
        <p className="text-sm text-muted-foreground mb-6">Complete your purchase securely.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            place.mutate();
          }}
          className="grid lg:grid-cols-[1fr_380px] gap-8"
        >
          <div className="space-y-6">
            <section className="space-y-4 bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Shipping Details</h2>
              <Input
                label="Full Name"
                value={form.shipping_name}
                onChange={(v) => set("shipping_name", v)}
              />
              <Input
                label="Address"
                value={form.shipping_address}
                onChange={(v) => set("shipping_address", v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={form.shipping_city}
                  onChange={(v) => set("shipping_city", v)}
                />
                <Input
                  label="Zip"
                  value={form.shipping_zip}
                  onChange={(v) => set("shipping_zip", v)}
                />
              </div>
              <Input
                label="Phone"
                value={form.shipping_phone}
                onChange={(v) => set("shipping_phone", v)}
              />
            </section>

            <section className="space-y-3 bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PaymentOption
                  icon={CreditCard}
                  label="Card (Stripe)"
                  sub="Visa, Mastercard, Amex"
                  active={method === "stripe"}
                  onClick={() => setMethod("stripe")}
                />
                <PaymentOption
                  icon={Wallet}
                  label="PayPal"
                  sub="Pay with your PayPal balance"
                  active={method === "paypal"}
                  onClick={() => setMethod("paypal")}
                />
                <PaymentOption
                  icon={Smartphone}
                  label="M-Pesa"
                  sub="STK push to your phone"
                  active={method === "mpesa"}
                  onClick={() => setMethod("mpesa")}
                />
                <PaymentOption
                  icon={Banknote}
                  label="Cash on Delivery"
                  sub="Pay when you receive"
                  active={method === "cod"}
                  onClick={() => setMethod("cod")}
                />
              </div>
              {method === "mpesa" && (
                <div className="pt-3">
                  <Input label="M-Pesa Phone (e.g. 0712345678)" value={phone} onChange={setPhone} />
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll receive an STK push prompt to enter your PIN.
                  </p>
                </div>
              )}
              {method === "stripe" && (
                <Note>You'll be redirected to Stripe's secure hosted checkout.</Note>
              )}
              {method === "paypal" && (
                <Note>You'll be redirected to PayPal to approve the payment.</Note>
              )}
              {method === "cod" && (
                <Note>Pay in cash when your order arrives. No upfront payment needed.</Note>
              )}
            </section>
          </div>

          <aside className="bg-card border border-border rounded-2xl p-6 h-fit sticky top-24 space-y-4">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto">
              {items.map((it) => {
                const p = it.products as unknown as { name: string; price: number } | null;
                if (!p) return null;
                return (
                  <div key={it.id} className="flex justify-between">
                    <span className="text-muted-foreground truncate pr-2">
                      {p.name} × {it.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      ${(Number(p.price) * it.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-3 space-y-1.5 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Shipping" value={shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`} />
              <Row label="Tax" value={`$${tax.toFixed(2)}`} />
              <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={place.isPending}
              className="w-full h-12 bg-conversion hover:bg-conversion/90 text-conversion-foreground"
            >
              {place.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By placing this order you agree to our terms of service.
            </p>
          </aside>
        </form>
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}

function PaymentOption({
  icon: Icon,
  label,
  sub,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative text-left p-4 rounded-xl border-2 transition-all",
        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-lg grid place-items-center",
            active ? "bg-primary text-primary-foreground" : "bg-section",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground truncate">{sub}</div>
        </div>
        {active && <Check className="h-5 w-5 text-primary shrink-0" />}
      </div>
    </button>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground bg-section rounded-lg p-3 mt-2">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold block mb-1.5">{label}</label>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
