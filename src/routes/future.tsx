import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import {
  Milestone,
  HelpCircle,
  ArrowUpRight,
  Leaf,
  Shield,
  Landmark,
  HardHat,
  Sprout,
  HeartPulse,
  GraduationCap,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/future")({
  head: () => ({
    meta: [
      {
        title:
          "Future Ventures & Strategic Horizon Pipelines — Tindi Holdings Ltd",
      },
      {
        name: "description",
        content:
          "Explore Tindi Holdings Ltd's long-term venture pipeline: Grid Energy Storage, Sovereign FinTech Micro-Wallets, Smart Urban Real Estate, and AI-driven precision agriculture.",
      },
      {
        name: "og:title",
        content: "Tindi Holdings Ltd — Horizon Ventures & Strategic Joint Pipelines",
      },
      {
        name: "og:description",
        content:
          "Long-term R&D pipelines and joint venture concepts across climate-tech, sovereign AI, and green energy infrastructure.",
      },
    ],
  }),
  component: FutureVenturesPage,
});

function FutureVenturesPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  const futures = [
    {
      title: "Tindi Energy & Grid Storage",
      category: "climate",
      icon: Leaf,
      desc: "R&D plans for mega-scale localized grid batteries, sustainable hydrogen cells, and charging stations to satisfy smart-home clusters.",
      status: "Under Review",
      horizon: "Horizon 2 (2027-2028)",
    },
    {
      title: "Tindi Finance & Sovereign Wallets",
      category: "fintech",
      icon: Landmark,
      desc: "Draft architectures for seamless, API-based credit scoring engines and digital corporate wallets to power direct trade channels.",
      status: "Strategic Drafting",
      horizon: "Horizon 2 (2027-2028)",
    },
    {
      title: "Tindi Real Estate & Smart Urban Nodes",
      category: "urban",
      icon: HardHat,
      desc: "Architectural blueprints for zero-emissions smart offices and co-working towers utilizing biometric entry platforms designed by Tindi Tech.",
      status: "Land Acquisition Plan",
      horizon: "Horizon 3 (2028-2030)",
    },
    {
      title: "Tindi AI Enterprise Automations",
      category: "ai",
      icon: BrainCircuit,
      desc: "Compiling sovereign domain models adjusted to process and automate regional shipping records, customs filings, and supply chains.",
      status: "Internal Prototyping",
      horizon: "Horizon 1 (2026-2027)",
    },
    {
      title: "Tindi Agriculture & Precision Drones",
      category: "climate",
      icon: Sprout,
      desc: "Plans for thermal imaging crop-monitoring quadcopters and sensory, water-saving vertical greenhouse setups.",
      status: "Collaborative Stage",
      horizon: "Horizon 2 (2027-2028)",
    },
    {
      title: "Tindi Health Remote Clinical Systems",
      category: "health",
      icon: HeartPulse,
      desc: "Draft specifications for continuous health-wearables translating patient biometric files directly to automated clinic networks.",
      status: "R&D Modeling",
      horizon: "Horizon 3 (2028-2030)",
    },
    {
      title: "Tindi Education Virtual Training Academies",
      category: "education",
      icon: GraduationCap,
      desc: "Envisioning simulation software layouts and software engineering bootcamps to groom high-potential local regional developers.",
      status: "Curriculum Modeling",
      horizon: "Horizon 2 (2027-2028)",
    },
  ];

  const filteredFutures =
    activeCategory === "all"
      ? futures
      : futures.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-gradient-to-b from-[#f3f8ff] dark:from-zinc-950 via-[#e6f2ff] dark:via-zinc-900 to-[#f8faff] dark:to-background text-foreground py-20 text-center relative overflow-hidden border-b border-border animate-fade-in">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-3.5 py-1.5 rounded-full">
            Horizon Plans
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Future Growth Sectors
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Consistently evaluating long-term opportunities. These concepts represent high-growth
            strategic pipeline horizons for prospective joint ventures.
          </p>
          <div className="mt-5 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-semibold inline-block">
            Note: The sectors listed below are NOT active operating companies. They represent our
            strategic pipeline horizons for prospective joint ventures.
          </div>
        </div>
      </section>

      {/* Layout */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {[
            { id: "all", label: "All Strategic Horizons" },
            { id: "climate", label: "Energy & Climate-Tech" },
            { id: "ai", label: "Sovereign AI & Software" },
            { id: "fintech", label: "FinTech & Wallets" },
            { id: "urban", label: "Smart Urban Spaces" },
            { id: "health", label: "Health & Clinical" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFutures.map((ms, i) => {
            const Icon = ms.icon;
            return (
              <div
                key={i}
                className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-10 w-10 bg-primary/5 group-hover:bg-primary/10 text-primary grid place-items-center rounded-xl transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full uppercase font-mono tracking-widest">
                      {ms.status}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground leading-tight">
                    {ms.title}
                  </h3>
                  <div className="text-[10px] font-mono font-bold text-amber-500 mt-1 uppercase">
                    {ms.horizon}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{ms.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground font-mono">
                    Strategic R&D
                  </span>
                  <Link to="/contact">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 text-primary font-bold text-xs h-auto group-hover:text-primary/80"
                    >
                      Joint Venture Inquiry <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Corporate Strategy Statement */}
      <section className="py-16 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 space-y-4">
              <h3 className="text-2xl font-extrabold tracking-tight">
                Structured Seeding & Joint Venture Selections
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Tindi Holdings Ltd continues to receive, review, and seed innovative pre-Series A
                startups operating in green mobility, climate-tech grids, circular bio-textiles, or
                programmatic food services across the continent. Our holding structure is ready with
                technical consulting, central legal councils, and computational power to support
                prospective joint venture teams.
              </p>
            </div>
            <div className="lg:col-span-4 text-center lg:text-right">
              <Link to="/contact">
                <Button
                  size="lg"
                  className="h-11 px-8 bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wide rounded-xl"
                >
                  Submit Pitch Proposal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
