import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Smartphone, Wallet, Banknote, Check, ShieldCheck, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
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
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [phone, setPhone] = useState("");
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    orderNumber: string;
    message?: string;
  } | null>(null);
  const [form, setForm] = useState({
    shipping_name: "",
    shipping_address: "",
    shipping_city: "Nairobi",
    shipping_zip: "00100",
    shipping_phone: "",
  });

  const subtotal = items.reduce((s, i) => {
    const p = i.products as unknown as { price: number } | null;
    return s + (p ? Number(p.price) * i.quantity : 0);
  }, 0);
  
  const isFreeShipping = subtotal >= 5000 && subtotal > 0;
  const shipping = subtotal === 0 ? 0 : isFreeShipping ? 0 : 500;
  const tax = Math.round(subtotal * 0.16);
  const total = subtotal + shipping;

  const place = useMutation({
    mutationFn: async () => {
      const order = await placeOrder({
        data: {
          ...form,
          payment_method: method,
          payment_phone: method === "mpesa" ? phone : null,
        },
      });
      setPlacedOrder({ orderId: order.orderId, orderNumber: order.orderNumber });

      if (method === "cod") {
        return {
          ...order,
          redirect: null as string | null,
          message: `Order ${order.orderNumber} placed successfully with Cash on Delivery!`,
        };
      }
      if (method === "stripe") {
        const { url } = await createStripeCheckout({ data: { orderId: order.orderId } });
        return {
          ...order,
          redirect: url,
          message: `Order ${order.orderNumber} created. Redirecting to payment...`,
        };
      }
      if (method === "paypal") {
        const { url } = await createPayPalOrder({ data: { orderId: order.orderId } });
        return {
          ...order,
          redirect: url,
          message: `Order ${order.orderNumber} created. Redirecting to PayPal...`,
        };
      }
      if (method === "mpesa") {
        if (!phone) throw new Error("Enter your M-Pesa phone number");
        const stkRes = await initiateMpesaSTK({ data: { orderId: order.orderId, phone } });
        return {
          ...order,
          redirect: null as string | null,
          message: stkRes.message || `Order ${order.orderNumber} placed! Check your phone for STK prompt.`,
        };
      }
      return { ...order, redirect: null };
    },
    onSuccess: (r) => {
      // Invalidate queries so cart & orders stay fresh
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      if (user?.id) {
        queryClient.setQueryData(["cart", user.id], []);
      }
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });

      if (r.message) {
        toast.success(r.message);
      } else {
        toast.success(`Order ${r.orderNumber} placed successfully!`);
      }

      if (r.redirect) {
        window.location.href = r.redirect;
        return;
      }
      navigate({ to: "/orders/$id", params: { id: r.orderId } });
    },
    onError: (e: Error) => {
      toast.error(e.message);
    },
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // If order was just placed, show confirmation card while redirecting
  if (placedOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <CorporateHeader onCartOpen={() => setCartOpen(true)} />
        <div className="flex-1 grid place-items-center px-6 py-16">
          <div className="text-center max-w-md bg-card border border-border p-10 rounded-3xl shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Order Confirmed!</h1>
            <p className="text-sm font-bold text-primary mt-1">
              Order Number: {placedOrder.orderNumber}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              {method === "mpesa"
                ? "An instant M-Pesa STK push prompt was sent to your phone. Enter your PIN to complete payment."
                : "Thank you for your order. We are preparing your delivery details."}
            </p>
            <Button
              onClick={() => navigate({ to: "/orders/$id", params: { id: placedOrder.orderId } })}
              className="mt-6 h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground uppercase text-xs tracking-wider"
            >
              View Order Details
            </Button>
          </div>
        </div>
        <CorporateFooter />
      </div>
    );
  }

  // Only show empty cart when NOT placing an order and no order was placed
  if (items.length === 0 && !place.isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-background font-sans">
        <CorporateHeader onCartOpen={() => setCartOpen(true)} />
        <div className="flex-1 grid place-items-center px-6 py-16">
          <div className="text-center max-w-md bg-card border border-border p-10 rounded-3xl shadow-sm">
            <div className="h-16 w-16 rounded-2xl bg-muted grid place-items-center text-muted-foreground mx-auto mb-4">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Your cart is empty</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Looks like you haven't added any products to your cart yet.
            </p>
            <Link to="/shop">
              <Button className="mt-6 h-11 px-8 rounded-xl font-bold bg-primary text-primary-foreground uppercase text-xs tracking-wider">
                Browse Store Products
              </Button>
            </Link>
          </div>
        </div>
        <CorporateFooter />
        <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-6xl w-full px-6 py-10 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight uppercase text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground mt-1">Complete your purchase securely in Kenyan Shillings (KES).</p>
        </div>
        
        <form
          onSubmit={(e) => {
            e.preventDefault();
            place.mutate();
          }}
          className="grid lg:grid-cols-[1fr_400px] gap-8"
        >
          <div className="space-y-6">
            <section className="space-y-4 bg-card border border-border rounded-3xl p-7 shadow-sm">
              <h2 className="text-base font-black uppercase tracking-wider text-foreground">Shipping Details</h2>
              <Input
                label="Full Name"
                placeholder="e.g. Grace Wanjiku"
                value={form.shipping_name}
                onChange={(v) => set("shipping_name", v)}
              />
              <Input
                label="Delivery Address / Street"
                placeholder="e.g. Westlands Commercial Centre, 4th Floor"
                value={form.shipping_address}
                onChange={(v) => set("shipping_address", v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City / Town"
                  placeholder="e.g. Nairobi"
                  value={form.shipping_city}
                  onChange={(v) => set("shipping_city", v)}
                />
                <Input
                  label="Postal Code (Optional)"
                  placeholder="e.g. 00100"
                  value={form.shipping_zip}
                  onChange={(v) => set("shipping_zip", v)}
                />
              </div>
              <Input
                label="Contact Phone Number"
                placeholder="e.g. +254 712 345 678"
                value={form.shipping_phone}
                onChange={(v) => set("shipping_phone", v)}
              />
            </section>

            <section className="space-y-4 bg-card border border-border rounded-3xl p-7 shadow-sm">
              <h2 className="text-base font-black uppercase tracking-wider text-foreground">Payment Method</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PaymentOption
                  icon={Smartphone}
                  label="M-Pesa STK Push"
                  sub="Instant prompt to your Safaricom phone"
                  active={method === "mpesa"}
                  onClick={() => setMethod("mpesa")}
                />
                <PaymentOption
                  icon={CreditCard}
                  label="Debit / Credit Card"
                  sub="Visa, Mastercard, Amex"
                  active={method === "stripe"}
                  onClick={() => setMethod("stripe")}
                />
                <PaymentOption
                  icon={Wallet}
                  label="PayPal"
                  sub="Pay via your PayPal account"
                  active={method === "paypal"}
                  onClick={() => setMethod("paypal")}
                />
                <PaymentOption
                  icon={Banknote}
                  label="Cash on Delivery (COD)"
                  sub="Pay in cash upon doorstep receipt"
                  active={method === "cod"}
                  onClick={() => setMethod("cod")}
                />
              </div>
              {method === "mpesa" && (
                <div className="pt-2">
                  <Input 
                    label="M-Pesa Phone Number (e.g. 0712345678 / 254712345678)" 
                    placeholder="0712345678"
                    value={phone} 
                    onChange={setPhone} 
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You'll receive an instant STK push prompt on your mobile phone to enter your M-Pesa PIN.
                  </p>
                </div>
              )}
              {method === "stripe" && (
                <Note>You'll be seamlessly redirected to Stripe's secure checkout page for card processing.</Note>
              )}
              {method === "paypal" && (
                <Note>You'll be redirected to PayPal's official portal to authorize the payment.</Note>
              )}
              {method === "cod" && (
                <Note>Pay in cash upon doorstep delivery. Official physical & digital tax receipts provided.</Note>
              )}
            </section>
          </div>

          <aside className="bg-card border border-border rounded-3xl p-7 h-fit sticky top-24 space-y-5 shadow-sm">
            <h2 className="text-base font-black uppercase tracking-wider text-foreground">Order Summary</h2>
            <div className="space-y-3 text-sm max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {items.map((it) => {
                const p = it.products as unknown as { name: string; price: number } | null;
                if (!p) return null;
                return (
                  <div key={it.id} className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground truncate pr-2 font-medium">
                      {p.name} × <strong className="text-foreground">{it.quantity}</strong>
                    </span>
                    <span className="font-bold shrink-0 text-foreground">
                      KES {(Number(p.price) * it.quantity).toLocaleString("en-KE")}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              <Row label="Subtotal" value={`KES ${subtotal.toLocaleString("en-KE")}`} />
              <Row 
                label="Delivery (Kenya)" 
                value={isFreeShipping ? "FREE" : `KES ${shipping.toLocaleString("en-KE")}`} 
              />
              <Row label="Estimated VAT (16% Incl.)" value={`KES ${tax.toLocaleString("en-KE")}`} />
              <div className="flex justify-between text-base font-black pt-3 border-t border-border text-foreground">
                <span className="uppercase tracking-tight">Total Amount</span>
                <span className="text-primary text-xl">KES {total.toLocaleString("en-KE")}</span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={place.isPending}
              className="w-full h-12 bg-conversion hover:bg-conversion/90 text-conversion-foreground rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {place.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                `Place Order • KES ${total.toLocaleString("en-KE")}`
              )}
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Encrypted & Guaranteed by Tindi Holdings Ltd</span>
            </div>
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
        "relative text-left p-4 rounded-2xl border-2 transition-all cursor-pointer",
        active ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:border-primary/40",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-xl grid place-items-center shrink-0",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
        </div>
        {active && <Check className="h-4 w-4 text-primary shrink-0" />}
      </div>
    </button>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl p-3 mt-2">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
      <input
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
