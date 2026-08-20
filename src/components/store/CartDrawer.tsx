import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, ShoppingCart } from "lucide-react";
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
      <DialogContent className="w-[96vw] sm:w-full max-w-[560px] rounded-3xl p-0 gap-0 border border-border shadow-2xl overflow-hidden bg-card text-foreground font-sans">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black tracking-tight text-foreground uppercase">
                  Your Shopping Cart
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {items.length} {items.length === 1 ? "product" : "products"} in your active cart
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
                KES {subtotal.toLocaleString("en-KE")}
              </span>
            )}
          </div>
        </DialogHeader>

        {/* Free Shipping Progress Indicator */}
        {items.length > 0 && (
          <div className="px-6 py-3 bg-muted/30 border-b border-border text-xs">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              {isFreeShipping ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-black">
                  <CheckCircle2 className="h-4 w-4 inline" /> You've unlocked FREE nationwide delivery!
                </span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 inline" /> Add{" "}
                  <strong className="text-primary font-black">KES {remainingForFree.toLocaleString("en-KE")}</strong> more for FREE shipping
                </span>
              )}
              <span className="text-xs text-muted-foreground font-mono font-black">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
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
          <div className="flex flex-col items-center justify-center text-center p-10 gap-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 grid place-items-center text-primary mb-1">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground uppercase tracking-wide">Sign In to View Your Cart</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mt-1">
                Your cart items, discounts, and order history sync securely across all your devices.
              </p>
            </div>
            <Link to="/login" className="w-full max-w-xs mt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="w-full h-11 font-black text-xs uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In / Register
              </Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 gap-4">
            <div className="h-16 w-16 rounded-3xl bg-muted grid place-items-center text-muted-foreground mb-1">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground uppercase tracking-wide">Your Cart is Empty</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mt-1">
                Explore our store catalogue, exclusive collections, and smart gadgets in Kenyan Shillings.
              </p>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/shop" });
              }}
              className="mt-2 h-11 px-8 font-black text-xs uppercase tracking-wider rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div className="max-h-[440px] overflow-y-auto px-6 py-4 space-y-4 divide-y divide-border/60 scrollbar-thin">
              {items.map((it) => {
                const p = it.products as unknown as {
                  name: string;
                  price: number;
                  image_url: string | null;
                  slug: string;
                } | null;
                if (!p) return null;
                const itemTotal = Number(p.price) * it.quantity;
                return (
                  <div key={it.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-2xl bg-muted/40 border border-border p-1.5 overflow-hidden shrink-0">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[10px] text-muted-foreground font-bold">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to="/product/$slug"
                        params={{ slug: p.slug }}
                        onClick={() => onOpenChange(false)}
                        className="text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">
                        KES {Number(p.price).toLocaleString("en-KE")} each
                      </div>
                      <div className="text-xs font-black text-primary mt-1">
                        Total: KES {itemTotal.toLocaleString("en-KE")}
                      </div>
                    </div>
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1.5 border border-border rounded-xl bg-muted/20 px-2 py-1 shrink-0">
                      <button
                        onClick={() =>
                          update.mutate({ id: it.id, quantity: Math.max(0, it.quantity - 1) })
                        }
                        className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-foreground">
                        {it.quantity}
                      </span>
                      <button
                        onClick={() => update.mutate({ id: it.id, quantity: it.quantity + 1 })}
                        className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-lg transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Delete Item */}
                    <button
                      onClick={() => remove.mutate(it.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-xl hover:bg-destructive/10 cursor-pointer shrink-0"
                      aria-label="Remove item"
                      title="Remove from cart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary & Checkout */}
            <div className="border-t border-border px-6 py-5 space-y-3 bg-muted/20">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">
                  KES {subtotal.toLocaleString("en-KE")}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Delivery (Nationwide Kenya)</span>
                <span
                  className={
                    isFreeShipping
                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                      : "font-bold text-foreground"
                  }
                >
                  {isFreeShipping ? "FREE" : `KES ${shipping.toLocaleString("en-KE")}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black pt-3 border-t border-border text-foreground">
                <span className="uppercase tracking-tight">Total Amount</span>
                <span className="text-primary font-black text-lg">
                  KES {total.toLocaleString("en-KE")}
                </span>
              </div>

              <div className="pt-2 space-y-2.5">
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    navigate({ to: "/checkout" });
                  }}
                  className="w-full bg-conversion hover:bg-conversion/90 text-conversion-foreground h-12 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Secure SSL Checkout • Instant M-Pesa / Card • Official Receipts</span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
