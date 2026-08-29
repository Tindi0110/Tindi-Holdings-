import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCarousel, CarouselItem } from "@/components/store/ProductCarousel";
import { useRecentlyViewed } from "@/hooks/use-recently-viewed";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { listProducts, listCategories } from "@/lib/catalog.functions";

const searchSchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z
    .enum([
      "popular",
      "new",
      "priceAsc",
      "priceDesc",
      "rating",
      "reviewed",
      "selling",
      "discount",
      "availability",
    ])
    .optional(),
});

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Integrated Retail Catalog — Tindi Holdings Ltd" },
      { name: "description", content: "Browse our full catalog of premium products." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: ShopPage,
});

const PAGE = 24;

function ShopPage() {
  const { category, q, sort = "new" } = Route.useSearch();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const [shown, setShown] = useState(PAGE);
  const recentlyViewed = useRecentlyViewed();
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: () => listCategories() });
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "list", category],
    queryFn: () => listProducts({ data: { category, limit: 100 } }),
  });

  const recommended = useMemo(() => (products ?? []).slice(0, 8), [products]);

  const filtered = useMemo(() => {
    let list = (products ?? []).filter((p) => !q || p.name.toLowerCase().includes(q.toLowerCase()));
    const num = (v: unknown) => Number(v ?? 0);
    switch (sort) {
      case "priceAsc":
        list = [...list].sort((a, b) => num(a.price) - num(b.price));
        break;
      case "priceDesc":
        list = [...list].sort((a, b) => num(b.price) - num(a.price));
        break;
      case "rating":
        list = [...list].sort((a, b) => num(b.rating) - num(a.rating));
        break;
      case "reviewed":
        list = [...list].sort((a, b) => num(b.reviews_count) - num(a.reviews_count));
        break;
      case "popular":
        list = [...list].sort((a, b) => num(b.reviews_count) - num(a.reviews_count));
        break;
      case "selling":
        list = [...list].sort((a, b) => num(b.reviews_count) - num(a.reviews_count));
        break;
      case "discount":
        list = [...list].sort((a, b) => {
          const da = a.compare_at_price
            ? (num(a.compare_at_price) - num(a.price)) / num(a.compare_at_price)
            : 0;
          const db = b.compare_at_price
            ? (num(b.compare_at_price) - num(b.price)) / num(b.compare_at_price)
            : 0;
          return db - da;
        });
        break;
      case "availability":
        break;
      case "new":
      default:
        list = [...list].sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        );
        break;
    }
    return list;
  }, [products, q, sort]);

  const visible = filtered.slice(0, shown);

  const Filters = (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold text-foreground mb-3 px-3">Categories</h3>
        <div className="space-y-1">
          <Link
            to="/shop"
            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
              !category ? "bg-muted text-foreground font-medium" : "hover:bg-muted text-slate-600"
            }`}
          >
            All Products
          </Link>
          {(cats ?? []).map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ category: c.slug }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                category === c.slug
                  ? "bg-muted text-foreground font-medium"
                  : "hover:bg-muted text-slate-600"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <div className="mx-auto max-w-screen-2xl w-full px-4 md:px-6 py-6 md:py-8 flex-1">
        <div className="flex items-end justify-between mb-6 gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold truncate">
              {category ? (cats?.find((c) => c.slug === category)?.name ?? "Shop") : "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} products{q ? ` matching "${q}"` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden h-10">
                  <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{Filters}</div>
              </SheetContent>
            </Sheet>
            <Select
              value={sort}
              onValueChange={(v) =>
                navigate({
                  to: "/shop",
                  search: {
                    category,
                    q,
                    sort: v as "new" | "priceAsc" | "priceDesc" | "rating" | "popular" | "discount",
                  },
                })
              }
            >
              <SelectTrigger className="h-10 w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="reviewed">Most Reviewed</SelectItem>
                <SelectItem value="selling">Best Selling</SelectItem>
                <SelectItem value="discount">Biggest Discount</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside className="hidden lg:block sticky top-24 self-start">{Filters}</aside>

          <div className="min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-3xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="aspect-square rounded-2xl bg-muted/60 w-full mb-4" />
                    <div className="h-4 bg-muted/80 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted/60 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-muted/80 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">No products found.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {visible.map((p) => (
                    <ProductCard key={p.id} p={p} />
                  ))}
                </div>
                {shown < filtered.length && (
                  <div className="text-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setShown((s) => s + PAGE)}
                      className="h-11 px-8 rounded-xl"
                    >
                      Load More ({filtered.length - shown} left)
                    </Button>
                  </div>
                )}
              </>
            )}

            {!isLoading && (
              <div className="mt-20 space-y-16">
                {recommended.length > 0 && (
                  <ProductCarousel title="Recommended For You" subtitle="Based on your interests">
                    {recommended.map((p) => (
                      <CarouselItem key={p.id}>
                        <ProductCard p={p} />
                      </CarouselItem>
                    ))}
                  </ProductCarousel>
                )}
                {recentlyViewed.length > 0 && (
                  <ProductCarousel title="Recently Viewed" subtitle="Continue where you left off">
                    {recentlyViewed.map((p) => (
                      <CarouselItem key={p.id}>
                        <ProductCard p={p} />
                      </CarouselItem>
                    ))}
                  </ProductCarousel>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
