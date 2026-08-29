import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/ui/safe-image";
import { Star, Check, Truck, RotateCcw, Shield, Minus, Plus, ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/catalog.functions";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { trackRecentlyViewed } from "@/hooks/use-recently-viewed";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `${params.slug.replace(/-/g, " ")} — Tindi Holdings Ltd` }],
  }),
  loader: async ({ params, context }) => {
    const p = await context.queryClient.ensureQueryData({
      queryKey: ["product", params.slug],
      queryFn: () => getProductBySlug({ data: { slug: params.slug } }),
    });
    if (!p) throw notFound();
    return {
      dehydratedState: dehydrate(context.queryClient),
    };
  },
  notFoundComponent: () => <div className="p-10 text-center">Product not found.</div>,
  errorComponent: ({ error }) => <div className="p-10 text-center text-error">{error.message}</div>,
  component: ProductPage,
});

function ProductPage() {
  const { dehydratedState } = Route.useLoaderData();
  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductPageInner />
    </HydrationBoundary>
  );
}

function ProductPageInner() {
  const { slug } = Route.useParams();
  const { data: product } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (product) {
      trackRecentlyViewed({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_at_price: product.compare_at_price,
        image_url: product.image_url,
      });
    }
  }, [product]);

  if (!product) return null;
  const price = Number(product.price);
  const old = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discount = old && old > price ? Math.round(((old - price) / old) * 100) : null;

  const onAdd = (buyNow = false) => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    add.mutate(
      { productId: product.id, quantity: qty },
      {
        onSuccess: () => {
          if (buyNow) navigate({ to: "/checkout" });
        },
      },
    );
  };
  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-screen-2xl w-full px-6 py-6 font-sans">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-primary transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 mt-4">
          <div className="aspect-square bg-card rounded-2xl border border-border overflow-hidden p-8 relative flex items-center justify-center">
            <SafeImage
              src={product.image_url}
              alt={product.name}
              aspectRatio="square"
              objectFit="contain"
              fallbackText="No image available for this product"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  product.stock > 0
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                    : "text-rose-700 bg-rose-50 border-rose-200"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              <span className="text-xs text-muted-foreground">ID: {product.id.slice(0, 8)}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= Math.round(Number(product.rating ?? 0))
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {Number(product.rating ?? 0).toFixed(1)} / 5.0 Rating
              </span>
            </div>

            <div className="flex items-baseline gap-4 py-6 border-y border-border mb-8">
              <span className="text-3xl font-bold text-foreground">KES {price.toLocaleString("en-KE")}</span>
              {old && (
                <span className="text-lg text-muted-foreground line-through font-medium">
                  KES {old.toLocaleString("en-KE")}
                </span>
              )}
              {discount && (
                <span className="ml-auto text-xs font-bold text-red-600 px-2 py-1 rounded bg-red-50 border border-red-100">
                  {discount}% OFF
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-base text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            )}

            <div className="grid gap-4 mb-10">
              {[
                {
                  icon: Shield,
                  t: "Secure Checkout",
                  d: "Your payment information is processed securely.",
                },
                { icon: Truck, t: "Fast Shipping", d: "Quick delivery for all orders." },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl bg-card border border-border shadow-sm"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted text-muted-foreground flex items-center justify-center shrink-0 border border-border">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground mb-0.5">{item.t}</div>
                    <div className="text-sm text-muted-foreground">{item.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <div className="flex items-center bg-card border border-border rounded-lg h-12 px-2 shadow-sm">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-8 w-8 grid place-items-center rounded hover:bg-muted text-muted-foreground"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold text-foreground">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="h-8 w-8 grid place-items-center rounded hover:bg-muted text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                disabled={product.stock === 0 || add.isPending}
                size="lg"
                onClick={() => onAdd(false)}
                className="flex-[2] h-12 shadow-sm"
              >
                Add to Cart
              </Button>

              <Button
                disabled={product.stock === 0}
                onClick={() => onAdd(true)}
                variant="outline"
                size="lg"
                className="flex-1 h-12"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
