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
      { title: "Innovation Hub — Tindi Group Advanced Materials & Sovereign AI Research" },
      {
        name: "description",
        content:
          "Explore details of Tindi Group's private HPC compute nodes, telemetry architectures, and strategic partnerships.",
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
      desc: "Establishing highly resilient computing farms containing premium server hardware. This infrastructure allows Tindi Tech to process hundreds of thousands of smart home biometric logs daily with supreme speeds, absolute privacy, and complete domestic data sovereignty, completely avoiding dependency on third-party public clouds.",
      status: "In Deployment",
    },
    {
      title: "Predictive Logistics Dispatch Models",
      icon: Brain,
      desc: "Engineered inside Tindi Lab, this artificial intelligence optimization pattern parses Mombasa cargo patterns and wildlife coordinates in Serengeti parks. This calculates and schedules high-efficiency eco-freight corridors with low energy spend.",
      status: "Active on 180 Cruisers",
    },
    {
      title: "Circular Eco-Polymer Textiles",
      icon: Box,
      desc: "In cooperation with material sciences institutions, Tindi Apparel processes recycled marine PET polymers and premium organic bamboo. This produces moisture-wicking and fully bio-degradable fibers suited for extreme conditions.",
      status: "Commercialized",
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
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
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
                Innovation doesn’t manifest in isolated silos. Tindi Group collaborates closely with
                regional technical colleges, wildlife preservation networks, and sustainable polymer
                councils to secure constant flow of verified research metrics straight to our
                manufacturing floors.
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

      {/* R&D metrics */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full text-center max-w-2xl">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            R&D Core Budget
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">
            15% Capital Allocation Manifesto
          </h2>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            As a standard corporate charter rule, Tindi Group commits exactly 15% of all
            consolidated subsidiary gross proceeds back into basic science, sustainable conversions,
            and computing facilities, ensuring we remain decades ahead of regional competitors.
          </p>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
