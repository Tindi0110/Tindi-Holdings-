import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "@tanstack/react-router";

const FREE_SHIPPING_THRESHOLD = 5000;

export function CartDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const { items, update, remove } = useCart();
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => {
    const p = i.products as unknown as { price: number } | null;
    return s + (p ? Number(p.price) * i.quantity : 0);
  }, 0);

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
  const shipping = subtotal === 0 ? 0 : isFreeShipping ? 0 : 500;
  const total = subtotal + shipping;
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] sm:w-full max-w-[420px] rounded-2xl p-0 gap-0 border border-border shadow-2xl overflow-hidden bg-card text-foreground font-sans">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold tracking-tight text-foreground">
                Shopping Cart
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"} selected
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-5 py-2.5 bg-muted/40 border-b border-border text-xs">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              {isFreeShipping ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 inline" /> You've unlocked FREE shipping!
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 inline" /> Add{" "}
                  <strong className="text-foreground">KES {remainingForFree.toLocaleString("en-KE")}</strong> for FREE shipping
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isFreeShipping ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        {!user ? (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 grid place-items-center text-primary mb-1">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Sign in to view your cart</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Your cart items and saved preferences will sync securely across all your devices.
            </p>
            <Link to="/login" className="w-full mt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-10 font-bold text-xs uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In / Register
              </Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted grid place-items-center text-muted-foreground mb-1">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Your cart is empty</h3>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Discover our latest premium products, smart home gear, and exclusive collections.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/shop" });
              }}
              className="mt-2 h-10 px-6 font-bold text-xs uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Browse Catalog
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div className="max-h-[300px] overflow-y-auto px-5 py-3 space-y-3 divide-y divide-border/50 scrollbar-thin">
              {items.map((it) => {
                const p = it.products as unknown as {
                  name: string;
                  price: number;
                  image_url: string | null;
                  slug: string;
                } | null;
                if (!p) return null;
                return (
                  <div key={it.id} className="pt-3 first:pt-0 flex gap-3 items-center">
                    <div className="h-12 w-12 rounded-xl bg-muted/50 border border-border p-1 overflow-hidden shrink-0">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[9px] text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">{p.name}</div>
                      <div className="text-xs font-black text-primary mt-0.5">
                        KES {Number(p.price).toLocaleString("en-KE")}
                      </div>
                    </div>
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 border border-border rounded-lg bg-muted/30 px-1 py-0.5 shrink-0">
                      <button
                        onClick={() =>
                          update.mutate({ id: it.id, quantity: Math.max(0, it.quantity - 1) })
                        }
                        className="h-5 w-5 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-foreground">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => update.mutate({ id: it.id, quantity: it.quantity + 1 })}
                        className="h-5 w-5 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    {/* Delete Item */}
                    <button
                      onClick={() => remove.mutate(it.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="border-t border-border px-5 py-4 space-y-2 bg-muted/20">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  KES {subtotal.toLocaleString("en-KE")}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span>
                <span
                  className={
                    isFreeShipping
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "font-semibold text-foreground"
                  }
                >
                  {isFreeShipping ? "FREE" : `KES ${shipping.toLocaleString("en-KE")}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-border text-foreground">
                <span>Total</span>
                <span className="text-primary font-black">
                  KES {total.toLocaleString("en-KE")}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/checkout" });
                  }}
                  className="w-full bg-conversion hover:bg-conversion/90 text-conversion-foreground h-10 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Secure SSL Checkout • Fast Delivery across Kenya</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
