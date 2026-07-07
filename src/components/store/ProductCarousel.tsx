import { useRef, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function ProductCarousel({
  title,
  subtitle,
  viewAllTo,
  children,
}: {
  title: string;
  subtitle?: string;
  viewAllTo?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(280, el.clientWidth * 0.85);
    el.scrollBy({ left: amount * dir, behavior: "smooth" });
  };
  return (
    <section className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full mt-12 md:mt-16">
      <div className="flex items-end justify-between mb-5 gap-3">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {viewAllTo && (
            <Link
              to={viewAllTo}
              className="text-sm font-medium text-primary hover:underline hidden sm:inline"
            >
              View All
            </Link>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-thin -mx-4 md:-mx-6 px-4 md:px-6 pb-3"
        style={{ scrollPaddingLeft: "1rem" }}
      >
        {children}
      </div>
    </section>
  );
}

export function CarouselItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`snap-start shrink-0 w-[46%] sm:w-[32%] md:w-[24%] lg:w-[19.2%] ${className}`}>
      {children}
    </div>
  );
}
