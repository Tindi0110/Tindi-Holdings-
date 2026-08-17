import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "@tanstack/react-router";

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
  const shipping = subtotal === 0 ? 0 : subtotal >= 5000 ? 0 : 500;
  const total = subtotal + shipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] sm:w-full max-w-md rounded-3xl p-0 gap-0 border border-border shadow-2xl overflow-hidden bg-card font-sans">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">Shopping Cart ({items.length})</DialogTitle>
          </div>
        </DialogHeader>

        {!user ? (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 grid place-items-center text-primary mb-1">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Sign in to manage your cart</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Save your items across devices and access personalized discounts.
            </p>
            <Link to="/login" className="w-full mt-2">
              <Button onClick={() => onOpenChange(false)} className="w-full h-11 font-bold rounded-xl">
                Sign In / Register
              </Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 gap-3">
            <div className="h-16 w-16 rounded-full bg-muted grid place-items-center text-muted-foreground mb-1">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-foreground">Your cart is empty</h3>
            <p className="text-xs text-muted-foreground">Browse our catalog to add items to your cart.</p>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/shop" });
              }}
              className="mt-2 h-10 px-6 font-bold rounded-xl"
            >
              Browse Catalog
            </Button>
          </div>
        ) : (
          <>
            <div className="max-h-[360px] overflow-y-auto px-6 py-4 space-y-3 divide-y divide-border/40">
              {items.map((it) => {
                const p = it.products as unknown as {
                  name: string;
                  price: number;
                  image_url: string | null;
                  slug: string;
                } | null;
                if (!p) return null;
                return (
                  <div key={it.id} className="pt-3 first:pt-0 flex gap-3.5 items-center">
                    <div className="h-14 w-14 rounded-xl bg-muted/40 border border-border p-1 overflow-hidden shrink-0">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full grid place-items-center text-[10px] text-muted-foreground">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-foreground truncate">{p.name}</div>
                      <div className="text-xs font-black text-primary mt-0.5">
                        KES {Number(p.price).toLocaleString("en-KE")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-lg bg-muted/20 px-1 py-0.5">
                      <button
                        onClick={() =>
                          update.mutate({ id: it.id, quantity: Math.max(0, it.quantity - 1) })
                        }
                        className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{it.quantity}</span>
                      <button
                        onClick={() => update.mutate({ id: it.id, quantity: it.quantity + 1 })}
                        className="h-6 w-6 grid place-items-center text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove.mutate(it.id)}
                      className="text-muted-foreground hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border px-6 py-4 space-y-2.5 bg-muted/10">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">KES {subtotal.toLocaleString("en-KE")}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-emerald-600 font-bold" : "font-bold text-foreground"}>
                  {shipping === 0 ? "FREE" : `KES ${shipping.toLocaleString("en-KE")}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-border text-foreground">
                <span>Total</span>
                <span className="text-primary">KES {total.toLocaleString("en-KE")}</span>
              </div>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate({ to: "/checkout" });
                }}
                className="w-full bg-conversion hover:bg-conversion/90 text-conversion-foreground h-11 rounded-xl font-bold text-sm shadow-md mt-1 cursor-pointer"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
