import { TINDI_COMPANIES } from "@/data/tindi-config";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CartDrawer } from "@/components/store/CartDrawer";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductCarousel, CarouselItem } from "@/components/store/ProductCarousel";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  ArrowRight,
  Cpu,
  Compass,
  Utensils,
  Shirt,
  ShieldCheck,
  Building,
  Users,
  Briefcase,
  Globe,
  Sparkles,
  Globe2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkle,
  Terminal,
  ArrowUpRight,
  MessageSquare,
  Search,
  Laptop,
  Footprints,
  Home,
  Trophy,
  Glasses,
} from "lucide-react";
import { listProducts } from "@/lib/catalog.functions";
import { cmsStore } from "@/lib/cms-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tindi Group Holdings — Leading Multi-Industry Corporate Conglomerate" },
      {
        name: "description",
        content:
          "Tindi Group is a diversified holding company operating across Smart Homes, Advanced Tech, Logistics, Hospitality, and Sustainable Fashion.",
      },
    ],
  }),
  loader: async ({ context }) => {
    return {
      dehydratedState: dehydrate(context.queryClient),
    };
  },
  component: TindiGroupLanding,
});

const logoMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Compass,
  Utensils,
  Shirt,
};

function TindiGroupLanding() {
  const { dehydratedState } = Route.useLoaderData();
  return (
    <HydrationBoundary state={dehydratedState}>
      <TindiGroupLandingInner />
    </HydrationBoundary>
  );
}

function TindiGroupLandingInner() {
  const [isMounted, setIsMounted] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load from SQL/Supabase queries
  const { data: featuredProducts } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => listProducts({ data: { featured: true, limit: 12 } }).catch(() => []),
  });
  const { data: latestProducts } = useQuery({
    queryKey: ["products", "latest"],
    queryFn: () => listProducts({ data: { limit: 12 } }).catch(() => []),
  });

  // Load from CMS Store
  const companies = cmsStore.getCompanies();
  const news = cmsStore.getNews().slice(0, 3);
  const testimonials = cmsStore.getTestimonials();

  // Combine products for best-sellers
  const bestSellers = [...(latestProducts ?? [])]
    .sort((a, b) => Number(b.reviews_count ?? 0) - Number(a.reviews_count ?? 0))
    .slice(0, 8);

  const stats = [
    { label: "Years of Operation", value: "12+", icon: Calendar },
    { label: "Active Customers", value: "1.5M+", icon: Users },
    { label: "Projects Delivered", value: "4.8M+", icon: ShieldCheck },
    { label: "Projects Completed", value: "620+", icon: Building },
    { label: "Countries Served", value: "8+", icon: Globe2 },
  ];

  const industries = [
    {
      title: "Smart Home Tech",
      desc: "Acoustics, dynamic lighting control and smart appliance systems.",
      icon: Cpu,
    },
    {
      title: "Transport Logistics",
      desc: "Heavy multi-modal freight forwarding and carbon-neutral transit.",
      icon: Compass,
    },
    {
      title: "Hospitality & Dining",
      desc: "Fine culinary experiences, modern cafes, and automated delivery networks.",
      icon: Utensils,
    },
    {
      title: "Premium Fashion",
      desc: "Ecological and smart wearable systems handcrafted with circular fibers.",
      icon: Shirt,
    },
    {
      title: "Financial Tech",
      desc: "Digital micro-credit, secure consumer checkout, and capital ventures (Developing).",
      icon: Layers,
    },
    {
      title: "Clean Green Energy",
      desc: "R&D in battery storage and solar-powered electric safari conversions.",
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />{" "}
      {/* SECTION 1: HERO CONTAINER */}
      <section className="bg-gradient-to-b from-[#f3f8ff] dark:from-zinc-950 via-[#e6f2ff] dark:via-zinc-900 to-[#f8faff] dark:to-background text-foreground pb-32 pt-24 md:pt-36 relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-400/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-[10%] w-[350px] h-[350px] bg-indigo-300/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-conversion/20 bg-conversion/5 text-xs font-bold tracking-wider text-conversion uppercase mb-8 shadow-sm"
          >
            <Sparkle className="h-3 w-3 fill-conversion animate-pulse" />
            <span>INNOVATION • SYNERGY • SCALE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tight max-w-5xl mx-auto leading-[1.1] mb-8 bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase"
          >
            Building the Future Through Innovation, Technology, Mobility, Hospitality and Commerce.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
          >
            One Group. Many Industries. Unlimited Possibilities. Tindi Group drives growth through
            highly agile, sector-leading operating units.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto"
          >
            <Button
              onClick={() => {
                const el = document.getElementById("subsidiaries");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              size="lg"
              className="btn-conversion font-extrabold px-8 py-4 rounded-full flex items-center gap-2 shadow-lg shadow-conversion/20"
            >
              Explore Companies <ChevronRight className="h-5 w-5" />
            </Button>
            <Link to="/shop">
              <Button
                size="lg"
                className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-8 py-4 rounded-full flex items-center gap-2 shadow-lg shadow-sky-600/20"
              >
                Visit Shop <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-foreground border-border bg-card/85 hover:bg-muted font-semibold px-8 py-4 rounded-full transition-all shadow-sm"
              >
                Partner With Us
              </Button>
            </Link>
            <Link to="/investors">
              <Button
                size="lg"
                variant="outline"
                className="text-foreground border-border bg-card/85 hover:bg-muted font-semibold px-8 py-4 rounded-full transition-all shadow-sm"
              >
                Investor Relations
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* SECTION 2: CONSOLIDATED STRATEGY (MISSION & PURPOSE) */}
      <section className="py-24 bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-xs font-black uppercase text-conversion tracking-widest block mb-4">
                  CONSOLIDATED STRATEGY
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Our Mission & Purpose
                </h2>
              </div>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                Tindi Group operates as a highly integrated diversified holding structure. We
                provide capital expansion, research and development, smart engineering platforms,
                and regulatory compliance standards to accelerate subsidiary dominance in national
                and international markets.
              </p>

              <div className="grid sm:grid-cols-1 gap-6 pt-4">
                <div className="flex items-start gap-4 p-5 bg-muted rounded-2xl border border-border">
                  <div className="h-10 w-10 bg-primary/5 text-primary rounded-xl grid place-items-center shrink-0 shadow-sm border border-border">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-muted-foreground/80 uppercase tracking-widest mb-1.5">
                      OUR MISSION
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To implement sustainable, technology-led operational layers that elevate
                      everyday living, logistics efficiency, and retail accessibility.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-muted rounded-2xl border border-border">
                  <div className="h-10 w-10 bg-primary/5 text-primary rounded-xl grid place-items-center shrink-0 shadow-sm border border-border">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-muted-foreground/80 uppercase tracking-widest mb-1.5">
                      OUR VISION
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To construct Africa's premier consumer and logistical digital highway,
                      sustaining double-digit growth for decades to come.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1" />

            <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-2">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, shadow: "0 10px 15px -3px rgba(0,0,0,0.05)" }}
                    className="p-6 rounded-2xl bg-muted border border-border flex flex-col justify-between h-[180px] transition-all"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary grid place-items-center shadow-sm border border-border">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-3xl font-black text-foreground flex items-baseline leading-none mb-1.5">
                        {stat.value}
                      </div>
                      <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest leading-none">
                        {stat.label}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 3: ACTIVE OPERATIONS (OPERATING PORTFOLIO) */}
      <section id="subsidiaries" className="py-24 bg-muted/20 relative border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase text-conversion tracking-widest block mb-4">
              ACTIVE OPERATIONS
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Operating Portfolio
            </h2>
            <p className="text-muted-foreground mt-4 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              Tindi Group's key businesses satisfy critical economic demand lines—spanning digital
              networks, luxury tourism, automated systems, and high-performance garments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {TINDI_COMPANIES.map((company, index) => {
              const Icon = logoMap[company.icon] || Cpu;

              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-card border border-border/80 rounded-3xl p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.015] pointer-events-none">
                    <Icon className="h-40 w-40 -mr-6 -mt-6" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 grid place-items-center border border-sky-100 shadow-sm shrink-0">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold tracking-tight text-foreground">
                            {company.name}
                          </h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-1 leading-none">
                            {company.industry}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {company.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-border/60 flex items-center justify-between mt-auto">
                      <Link
                        to="/companies"
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors group"
                      >
                        Learn More{" "}
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Strategic Pipeline Growth Teaser */}
          <div className="mt-12 p-8 rounded-2xl bg-card border border-border/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="max-w-xl">
              <span className="text-[10px] font-black uppercase text-conversion tracking-wider block mb-1">
                STRATEGIC PIPELINE
              </span>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                Expanding the Ecosystem Beyond Current Frontiers
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mt-2 font-medium">
                Tindi Group continues to review strategic proposals in Energy hubs, Real Estate
                structures, FinTech APIs, AgriTech automations, and localized artificial
                intelligence.
              </p>
            </div>
            <Link to="/future">
              <Button
                size="sm"
                variant="outline"
                className="font-bold shrink-0 py-5 px-6 rounded-lg text-xs tracking-wider uppercase border-border hover:bg-muted"
              >
                Review Future Opportunities <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* SECTION 4: MARKET SCOPE (INDUSTRIES WE SERVE) */}
      <section className="py-24 bg-gradient-to-br from-[#f0f7ff] to-[#e6f2ff] text-slate-900 relative border-b border-sky-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase text-conversion tracking-widest block mb-4">
                MARKET SCOPE
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground uppercase leading-none">
                Industries We Serve
              </h2>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-6">
                By operating specialized subsidiaries cross-leveraging each other's tech stacks, we
                serve key multi-billion commerce sectors securely and with exceptional efficiency.
              </p>
            </div>
            <Link to="/companies">
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-3 rounded-md shadow-lg shadow-amber-500/10 shrink-0 text-sm uppercase tracking-wider"
              >
                Explore Solutions
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, borderColor: "var(--color-primary)" }}
                  className="p-8 border border-border bg-card rounded-2xl flex flex-col justify-between h-[240px] transition-all relative group shadow-sm hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 border border-border text-primary grid place-items-center shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-extrabold text-base text-foreground tracking-tight uppercase">
                      {ind.title}
                    </h4>
                    <p className="text-muted-foreground text-xs md:text-sm leading-relaxed font-medium">
                      {ind.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border mt-4 h-5">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest group-hover:text-primary transition-colors">
                      Service Layer
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      {/* SECTION 5: ACTIVE STOREFRONT */}
      <section className="py-24 bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="mb-12 border-b border-border pb-6">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-1">
              ACTIVE STOREFRONT
            </span>
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
              Trending From Tindi Apparel & Tech
            </h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-xl font-medium">
              Order directly from our integrated e-commerce catalog featuring state-of-the-art
              electronics, smart home appliances, and custom garments.
            </p>
          </div>

          {/* CATEGORIES GRID CORRESPONDING TO THE SCREENSHOT */}
          <div className="flex justify-between items-center overflow-x-auto gap-4 py-8 px-2 no-scrollbar mb-12 border-b border-slate-100">
            {[
              { name: "Electronics", icon: Laptop },
              { name: "Fashion", icon: Shirt },
              { name: "Shoes", icon: Footprints },
              { name: "Bags", icon: Briefcase },
              { name: "Beauty", icon: Sparkles },
              { name: "Home", icon: Home },
              { name: "Sports", icon: Trophy },
              { name: "Accessories", icon: Glasses },
            ].map((cat) => (
              <div
                key={cat.name}
                onClick={() => navigate({ to: "/shop" })}
                className="flex flex-col items-center gap-3 text-center group cursor-pointer shrink-0 min-w-[76px]"
              >
                <div className="w-16 h-16 rounded-full border border-border hover:border-conversion bg-card shadow-sm flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-md group-hover:bg-muted duration-350">
                  <cat.icon className="h-6 w-6 text-foreground group-hover:text-conversion transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-conversion transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>

          {/* Featured Products Carousel */}
          <div className="mb-16">
            <ProductCarousel title="Flash Deals" subtitle="Limited-time offers, while stocks last">
              {(featuredProducts ?? []).map((p) => (
                <CarouselItem key={p.id}>
                  <ProductCard p={p} />
                </CarouselItem>
              ))}
            </ProductCarousel>
          </div>

          {/* New Arrivals/Best Sellers Carousel */}
          {bestSellers && bestSellers.length > 0 && (
            <div className="mb-16">
              <ProductCarousel title="New Arrivals" subtitle="Fresh drops added to the catalog">
                {bestSellers.map((p) => (
                  <CarouselItem key={p.id}>
                    <ProductCard p={p} />
                  </CarouselItem>
                ))}
              </ProductCarousel>
            </div>
          )}

          <div className="text-center mt-6">
            <Link to="/shop">
              <Button
                size="lg"
                className="font-extrabold rounded-lg px-8 py-4 bg-primary text-primary-foreground text-sm uppercase tracking-wider flex items-center gap-2 mx-auto shadow-md"
              >
                Open Integrated Store Catalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* SECTION 6: STRATEGIC R&D / TINDI INNOVATION LAB */}
      <section className="py-24 bg-muted/30 border-b border-border relative">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-black text-primary uppercase tracking-widest block mb-4">
                  STRATEGIC R&D
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground uppercase">
                  Tindi Innovation Lab
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">
                We combine artificial intelligence, telemetry IoT arrays, and advanced materials
                engineering to future-proof all corporate subsidiaries. From cloud optimization
                algorithms to circular fabric technology, Tindi is dedicated to cutting-edge
                research.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary grid place-items-center mb-4 border border-border shadow-sm">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-foreground mb-2 uppercase tracking-tight">
                    Sovereign Artificial Intelligence
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Processing operational metrics to minimize localized dispatch delays.
                  </p>
                </div>
                <div className="p-6 bg-card border border-border rounded-2xl shadow-sm">
                  <div className="h-8 w-8 rounded-lg bg-primary/5 text-primary grid place-items-center mb-4 border border-border shadow-sm">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-foreground mb-2 uppercase tracking-tight">
                    Biometric Telemetry IoT
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Real-time diagnostics and asset health monitoring loops.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/innovation">
                  <Button
                    size="lg"
                    variant="outline"
                    className="font-bold border-border bg-card shadow-sm hover:bg-muted py-5 rounded-lg px-6 uppercase text-xs tracking-wider"
                  >
                    Enter the Innovation Hub <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-md border border-border/80 group">
              <img
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
                alt="Autonomous Micro-Transit Optimization Engine Motherboard"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-8 text-white">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 font-mono text-[9px] text-green-400 rounded uppercase tracking-widest w-fit mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping inline-block" />
                  Active Lab Project
                </div>
                <h3 className="text-lg font-black tracking-tight uppercase">
                  Autonomous Micro-Transit Optimization Engine
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* SECTION 7: GLOBAL COMMUNICATIONS (NEWS & MEDIA) */}
      <section className="py-24 bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-8 border-b border-border pb-6">
            <div>
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-1">
                GLOBAL COMMUNICATIONS
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Latest News & Media
              </h2>
            </div>
            <Link to="/news">
              <Button
                variant="outline"
                size="sm"
                className="font-bold py-5 px-6 rounded-lg text-xs tracking-wider uppercase border-border hover:bg-muted"
              >
                Visit Media Center <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between bg-muted/20 border border-border/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="h-48 overflow-hidden relative border-b border-border/40">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 text-slate-900 text-[10px] font-black tracking-wider px-2.5 py-1 rounded shadow-sm uppercase font-sans border border-slate-100">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground mb-3 tracking-wider">
                      <span>{item.publishedAt}</span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      <Link to="/news" search={{ slug: item.slug }}>
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                  <Link
                    to="/news"
                    search={{ slug: item.slug }}
                    className="text-xs font-bold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    Read Dispatch <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* SECTION 8: TESTIMONIALS */}
      <section className="py-24 bg-muted/10 border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest block mb-4">
              SYNERGIC ECOSYSTEM
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              What Partners & Investors Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="p-8 rounded-3xl bg-card border border-border/80 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="text-primary text-3xl font-serif leading-none mb-4">“</div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic font-medium">
                    {test.content}
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4 pt-6 border-t border-border/40">
                  {test.image ? (
                    <img
                      src={test.image}
                      alt={test.name}
                      className="h-10 w-10 rounded-full object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 font-bold text-sm grid place-items-center shrink-0 border border-blue-100">
                      {test.name.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-bold text-foreground leading-none">
                      {test.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 font-bold uppercase tracking-wider">
                      {test.role}, {test.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* SECTION 9: CALL TO ACTION */}
      <section className="py-32 bg-gradient-to-b from-[#f8faff] via-[#e6f2ff] to-[#f0f7ff] text-slate-900 text-center relative overflow-hidden border-b border-sky-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.015)_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <span className="text-xs font-black uppercase text-conversion tracking-widest block mb-4">
            JOIN TINDI GROUP
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase text-slate-900">
            Create Sustainable Operations With Us
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Whether you are looking to become an authorized subsidiary, acquire eco-friendly
            logistics leasing or uniforms, invest in green ventures, or join our R&D squads.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <Button
                size="lg"
                className="btn-conversion font-extrabold px-8 py-4 rounded-full flex items-center gap-1 shadow-lg shadow-conversion/20 uppercase tracking-wider text-xs"
              >
                Request Proposal
              </Button>
            </Link>
            <Link to="/careers">
              <Button
                size="lg"
                variant="outline"
                className="text-foreground border-border bg-card/90 hover:bg-muted font-semibold px-8 py-4 rounded-full transition-all uppercase tracking-wider text-xs shadow-sm"
              >
                Work With Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <CorporateFooter />
    </div>
  );
}
