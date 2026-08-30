import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import {
  Sparkles,
  Brain,
  Code,
  Network,
  Globe,
  HeartHandshake,
  Box,
  Milestone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/innovation")({
  head: () => ({
    meta: [
      {
        title:
          "Innovation Hub — Tindi Holdings Ltd | Sovereign AI, Private Compute & Circular Materials R&D",
      },
      {
        name: "description",
        content:
          "Explore Tindi Holdings Ltd's private HPC compute cluster plans, predictive logistics dispatch models, and circular eco-polymer textile R&D programs launching Q4 2026.",
      },
      {
        name: "og:title",
        content: "Tindi Innovation Hub — Private AI, Clean Logistics & Circular Materials",
      },
      {
        name: "og:description",
        content:
          "Our labs are building East Africa's first sovereign AI compute clusters, zero-emission safari fleet systems, and fully circular textile manufacturing pipelines.",
      },
    ],
  }),
  component: InnovationHubPage,
});

function InnovationHubPage() {
  const [cartOpen, setCartOpen] = useState(false);

  const programs = [
    {
      title: "Private Regional Cloud Clusters",
      id: "labs",
      icon: Network,
      desc: "Establishing highly resilient computing farms containing premium server hardware. This infrastructure will allow Tindi Tech to process hundreds of thousands of smart home biometric logs daily with supreme speeds, absolute privacy, and complete domestic data sovereignty — completely avoiding dependency on third-party public clouds. Deployment begins Q4 2026.",
      status: "Pre-Deployment",
      statusColor: "bg-amber-500/10 text-amber-500",
    },
    {
      title: "Predictive Logistics Dispatch Models",
      id: "logistics",
      icon: Brain,
      desc: "Engineered inside Tindi Labs, this AI optimization system will parse Mombasa cargo patterns and wildlife coordinates to calculate and schedule high-efficiency eco-freight corridors with low energy spend. Initial deployment targeted alongside Tindi Safaris Q4 2026 fleet launch.",
      status: "In Development",
      statusColor: "bg-sky-500/10 text-sky-500",
    },
    {
      title: "Circular Eco-Polymer Textiles",
      id: "materials",
      icon: Box,
      desc: "In cooperation with material sciences institutions, Tindi Apparel is designing processes to use recycled marine PET polymers and premium organic bamboo to produce moisture-wicking, fully bio-degradable fibers suited for extreme conditions. Production designed from inception for Q4 2026.",
      status: "Design Complete",
      statusColor: "bg-emerald-500/10 text-emerald-500",
    },
  ];

  const partners = [
    { name: "Nairobi Institute of Materials Science", scope: "Circular Fiber Polymers research" },
    {
      name: "Continental Logistics & Security Council",
      scope: "Sovereign threat Pen-testing matrices",
    },
    {
      name: "Serengeti Ecological Conservancy",
      scope: "Zero-emissions electric safari Cruiser diagnostics",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-muted border-b border-border py-20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
            Tindi Labs
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tighter text-foreground uppercase">
            The Innovation Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Pioneering autonomous computer networks, circular material systems, and heavy transit
            telemetry. Our labs are dedicated to advanced research and development.
          </p>
        </div>
      </section>

      {/* Program list */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="space-y-12">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <div
                key={i}
                id={prog.id}
                className="grid lg:grid-cols-12 gap-8 items-center bg-card border rounded-3xl p-8 hover:border-primary/40 transition-colors"
              >
                <div className="lg:col-span-1 flex justify-center">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
                <div className="lg:col-span-8 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-extrabold tracking-tight text-foreground dark:text-white leading-none">
                      {prog.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${prog.statusColor}`}>
                      {prog.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{prog.desc}</p>
                </div>
                <div className="lg:col-span-3 text-center lg:text-right">
                  <Link to="/contact">
                    <Button
                      variant="outline"
                      className="text-xs font-bold border-stone-300 dark:border-stone-700 h-9 px-4 rounded-lg"
                    >
                      Inquire About Licensing
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Strategic partnerships */}
      <section id="partnerships" className="py-20 bg-muted border-y border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">
                Interlocked Networks
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Strategic Research Partnerships
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Innovation doesn’t manifest in isolated silos. Tindi Holdings Ltd collaborates
                closely with regional technical colleges, wildlife preservation networks, and
                sustainable polymer councils to secure constant flow of verified research metrics
                straight to our manufacturing floors.
              </p>
              <div className="pt-2">
                <Link to="/contact">
                  <Button className="h-10 px-5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-lg uppercase tracking-wide">
                    Request Joint Venture Seeding
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-4 bg-card border rounded-3xl p-6 md:p-8">
              <h4 className="font-extrabold text-sm uppercase tracking-wider mb-4 border-b pb-2">
                Institution Partnerships
              </h4>
              {partners.map((p, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-muted rounded-xl">
                  <HeartHandshake className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-foreground dark:text-white uppercase leading-none">
                      {p.name}
                    </h5>
                    <p className="text-[11px] text-muted-foreground mt-1.5">{p.scope}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full text-center max-w-2xl">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            R&D Core Budget
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">
            15% Capital Allocation Mandate
          </h2>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-2xl mx-auto">
            As a foundational corporate charter rule, Tindi Holdings Ltd commits exactly{" "}
            <strong>15% of all consolidated subsidiary gross proceeds</strong> back into
            basic science, sustainable conversions, and computing facilities from Year 1.
            This ensures we remain decades ahead of regional competitors and never
            compromise on innovation to chase short-term margins.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 bg-card border rounded-2xl text-center">
              <span className="text-2xl font-black text-primary block">15%</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide block mt-1">Revenue Committed</span>
            </div>
            <div className="p-4 bg-card border rounded-2xl text-center">
              <span className="text-2xl font-black text-amber-500 block">3</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide block mt-1">Active R&D Tracks</span>
            </div>
            <div className="p-4 bg-card border rounded-2xl text-center">
              <span className="text-2xl font-black text-emerald-500 block">Year 1</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide block mt-1">From Q4 2026</span>
            </div>
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
