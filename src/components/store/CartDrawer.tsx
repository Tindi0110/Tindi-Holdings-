import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
  const shipping = subtotal === 0 ? 0 : subtotal >= 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sign in to view your cart</p>
            <Link to="/login">
              <Button onClick={() => onOpenChange(false)}>Sign In</Button>
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Your cart is empty</p>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate({ to: "/shop" });
              }}
            >
              Browse products
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((it) => {
                const p = it.products as unknown as {
                  name: string;
                  price: number;
                  image_url: string | null;
                  slug: string;
                } | null;
                if (!p) return null;
                return (
                  <div key={it.id} className="flex gap-3 items-center">
                    <div className="h-16 w-16 rounded-lg bg-section overflow-hidden shrink-0">
                      {p.image_url && (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-sm font-semibold mt-1">
                        ${Number(p.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 border border-border rounded-lg">
                      <button
                        onClick={() =>
                          update.mutate({ id: it.id, quantity: Math.max(0, it.quantity - 1) })
                        }
                        className="h-7 w-7 grid place-items-center"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{it.quantity}</span>
                      <button
                        onClick={() => update.mutate({ id: it.id, quantity: it.quantity + 1 })}
                        className="h-7 w-7 grid place-items-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove.mutate(it.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border px-6 py-4 space-y-3 bg-card">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={shipping === 0 ? "text-success font-medium" : ""}>
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  navigate({ to: "/checkout" });
                }}
                className="w-full bg-conversion hover:bg-conversion/90 text-conversion-foreground h-11"
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
