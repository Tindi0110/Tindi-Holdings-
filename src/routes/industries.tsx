import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import {
  Layers,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Compass,
  Utensils,
  Shirt,
  Globe,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries Served — Tindi Holdings Ltd Commercial Architectures" },
      {
        name: "description",
        content:
          "Explore the different retail, digital, logistical, hospitality and technological sectors powered by Tindi Holdings Ltd.",
      },
    ],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  const [cartOpen, setCartOpen] = useState(false);

  const indList = [
    {
      title: "Information Technology & IoT Hardware",
      icon: Cpu,
      overview:
        "Driving sovereign regional networks, biometric security integration, and centralized Cloud/SaaS operations.",
      solutions: [
        "Sovereign High-Performance Compute",
        "State-grade Threat Vector Minimization",
        "Continuous Deployment API Layering",
      ],
      projectsCount: 140,
      growth:
        "Transitioning all cloud architectures to zero-dependency domestic processing clusters, serving regional micro-finance banks.",
    },
    {
      title: "Smart Homes & Automation",
      icon: Layers,
      overview:
        "Creating unified living protocols that tie lighting, HVAC climate control, audio, and door access into singular, gorgeous apps.",
      solutions: [
        "Architectural Home Control Panels",
        "Unified Biometric Authentication",
        "Sensory Energy-Savings Modules",
      ],
      projectsCount: 320,
      growth:
        "Integrating smart appliances directly with localized predictive heating models in green-energy residential arrays.",
    },
    {
      title: "Transportation & Sustainable Logistics",
      icon: Compass,
      overview:
        "Forming heavy multinational commercial shipping corridors and carbon-neutral freight logistics assets.",
      solutions: [
        "Cold-Chain Temperature Controlled Freights",
        "Fleet Telemetry Custom Dashboards",
        "Cross-Border Transit Sledgers",
      ],
      projectsCount: 180,
      growth:
        "Electrification of wildlife touring cruisers in Mombasa and Serengeti sectors to maintain silent, smoke-free animal paths.",
    },
    {
      title: "Hospitality & Food Services Technology",
      icon: Utensils,
      overview:
        "Pioneering chef-caliber rooftop venues, automated cloud kitchens optimized for delivery, and eco-friendly catering.",
      solutions: [
        "Interactive Sensory Fine-Dining Spaces",
        "Accelerated 8-Minute Delivery Cloud Kitchens",
        "ESG-Compliant Organic Sourcing Protocols",
      ],
      projectsCount: 95,
      growth:
        "Direct trade agreements with rural farm cooperatives to trace raw ingredients digitally via retail QR codes.",
    },
    {
      title: "Premium Fashion & Circular Textiles",
      icon: Shirt,
      overview:
        "Manufacturing custom high-grade corporate uniforms and executive double-breasted suits with ecological fibers.",
      solutions: [
        "Recycled Ocean Polymer Activewear",
        "Bio-degradable Organic Bamboo Uniforms",
        "Bespoke Italian-Cut Executive Suitings",
      ],
      projectsCount: 45,
      growth:
        "Lookbook releases in Paris and Milan leveraging direct logistic connections with Tindi travel corridors.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-muted border-b border-border py-20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
            Consolidated Reach
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tighter text-foreground uppercase">
            Industries We Serve
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Delivering high-performance solutions in sectors supporting critical economic value.
            Bridging advanced technology, heavy freight logistics, fine food hospitality, and
            circular textiles.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="grid md:grid-cols-2 gap-8">
          {indList.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <div
                key={i}
                className="group p-8 bg-white border hover:border-primary/40 rounded-3xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-md font-mono">
                      {ind.projectsCount}+ Projects Completed
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight text-foreground dark:text-white leading-none group-hover:text-primary transition-colors">
                    {ind.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {ind.overview}
                  </p>

                  <div className="mt-6 space-y-2">
                    <h5 className="text-[11px] font-black uppercase text-primary tracking-wider">
                      Strategic Solutions:
                    </h5>
                    <ul className="space-y-1">
                      {ind.solutions.map((sol, j) => (
                        <li key={j} className="flex items-center gap-2 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border bg-muted p-4 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-500 uppercase tracking-widest">
                    <TrendingUp className="h-3.5 w-3.5" /> Future Growth Pipeline:
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{ind.growth}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact board */}
      <section className="py-16 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full text-center max-w-3xl">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            Industrial Engagement
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2">
            Looking for an Industrial-Scale Operations Partner?
          </h2>
          <p className="text-xs text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Tindi Holdings Ltd’s engineering labs deliver custom, ISO-certified operating networks to
            optimize logistics metrics, architectural smart installations, and textile designs for
            companies worldwide.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/contact">
              <Button
                size="lg"
                className="h-11 px-8 font-bold bg-primary hover:bg-primary/95 text-white rounded-xl text-xs uppercase tracking-wide"
              >
                Consult With Our Board
              </Button>
            </Link>
            <Link to="/companies">
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-8 font-bold border-primary text-primary hover:bg-primary/5 rounded-xl text-xs uppercase tracking-wide bg-transparent"
              >
                Read Subsidiary Case-Studies
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
