import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Sparkles,
  Award,
  Target,
  Eye,
  Users,
  Layers,
  Trophy,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Tindi Holdings Ltd — Structured Leadership, Mission & Values" },
      {
        name: "description",
        content:
          "Learn about the rich history, executive board, values, and milestone roadmap of Tindi Holdings Ltd.",
      },
    ],
  }),
  component: AboutPageMessage,
});

function AboutPageMessage() {
  const [cartOpen, setCartOpen] = useState(false);

  const leadership = [
    {
      name: "Evans Njenga Matindi",
      role: "Founder & Chief Executive Officer",
      bio: "Enterprise Architect with 15+ years experience directing multi-sector logistical and technology holdings across Europe and East Africa.",
      image:
        "https://tyhdjsgnyccpsihfvstr.supabase.co/storage/v1/object/public/uploads/web%20uploads/ceo%20and%20director.jpeg",
    },
    {
      name: "Dr. Amanda Kipchumba",
      role: "Group Managing Director",
      bio: "Former Infrastructure Director at regional investment funds specializing in high-concurrence agritech and commercial smart networks.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    },
    {
      name: "Leonard Sylvanus",
      role: "Head of AI & Software Systems",
      bio: "IoT integration specialist. Directing the sovereign HPC computing infrastructure of Tindi Tech.",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
    },
    {
      name: "Sonia Gakii",
      role: "Chief Sustainable Officer (CSO)",
      bio: "Spearheading the bio-safe uniform polymers research at Tindi Apparel and Serengeti electric cruiser initiatives.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
    },
  ];

  const milestones = [
    {
      year: "2014",
      title: "Inception",
      desc: "Tindi Safaris established with a single custom-fitted cruiser in Mombasa.",
    },
    {
      year: "2017",
      title: "Consolidated Transit Solutions",
      desc: "Launched multinational cross-border supply hubs and full cold-chain transport fleet.",
    },
    {
      year: "2020",
      title: "Tech & Homes Division",
      desc: "Tindi Tech engineered custom home automation dashboards, securing regional property contracts.",
    },
    {
      year: "2023",
      title: "Hospitality & Apparel Expansion",
      desc: "Launched Tindi Eats culinary cafes and Tindi Apparel's eco-conscious circular fiber suiting lines.",
    },
    {
      year: "2026",
      title: "The Sovereign AI Cluster",
      desc: "Committed $50M to private high-performance servers, eliminating external cloud dependency.",
    },
  ];

  const awards = [
    { year: "2024", name: "ESG Excellence Award", issuer: "Regional Green Initiatives Capital" },
    {
      year: "2025",
      name: "Next-Gen Tech Conglomerate of the Year",
      issuer: "East African Innovation Forum",
    },
    {
      year: "2025",
      name: "Safest Luxury Carrier of the Season",
      issuer: "Hospitality Association Review",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-muted border-b border-border py-20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
            Holding History
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tighter text-foreground uppercase">
            About Tindi Holdings Ltd Companies
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed font-medium">
            Consolidating capital resources, innovative tech platforms, and high-performance
            personnel to deliver uncompromised luxury and efficiency.
          </p>
        </div>
      </section>

      {/* Mission Vision */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 bg-card border rounded-3xl space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary grid place-items-center rounded-2xl">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Consolidated Mission</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We construct integrated, sustainable systems across transport, automated technology,
              premium hospitality, and bio-safe wearables—satisfying real consumer demand while
              keeping zero-emissions metrics at the core of all operations.
            </p>
          </div>
          <div className="p-8 bg-card border rounded-3xl space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary grid place-items-center rounded-2xl">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Strategic Vision</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              To build a digital-led multinational holding organization capable of maintaining
              operations without reliance on third-party frameworks. Placing sovereign cloud
              clusters and real-time trackers at the center of East Africa's economic highway.
            </p>
          </div>
          <div className="p-8 bg-card border rounded-3xl space-y-4">
            <div className="h-12 w-12 bg-amber-500/10 text-amber-500 grid place-items-center rounded-2xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">Corporate Values</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We believe in Absolute Integrity, Digital Autonomy, Eco-Responsibility, and Elegant
              Usability. Every product in store and every vehicle on route fits tight certification
              guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="py-20 bg-muted border-y border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Historical Growth
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              Timeline & Milestones
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              A decade of systematic integration and market acquisition.
            </p>
          </div>

          <div className="relative border-l border-border ml-4 md:ml-32 space-y-12">
            {milestones.map((ms, i) => (
              <div key={i} className="relative pl-8 md:pl-12 group">
                <div className="absolute -left-3 top-1.5 h-6 w-6 rounded-full bg-white border-2 border-primary grid place-items-center font-mono text-[9px] font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  {i + 1}
                </div>
                <div className="md:absolute md:-left-32 md:top-1.5 text-right font-black font-mono text-xl text-primary md:w-24">
                  {ms.year}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-foreground dark:text-white group-hover:text-primary transition-colors">
                    {ms.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-2xl">
                    {ms.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership board */}
      <section id="leadership" className="py-20 bg-background">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Strategic Minds
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-1">
              Executive Board Directors
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              Guiding the diverse subsidiaries through high-performance frameworks.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {leadership.map((lead, i) => (
              <div
                key={i}
                className="group bg-white border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all"
              >
                <div className="h-64 overflow-hidden bg-muted">
                  <img
                    src={lead.image}
                    alt={lead.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h4 className="font-extrabold text-base text-foreground dark:text-white leading-none">
                    {lead.name}
                  </h4>
                  <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block mt-1.5">
                    {lead.role}
                  </span>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{lead.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate structure diagram */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Agile Conglomerate
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Corporate Architecture</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tindi Holdings Ltd operates a unique matrix system where each division owns its
                product listings, cargo dispatch routing, or kitchen inventories, while sharing
                unified cloud structures designed by Tindi Tech. This reduces redundant developer
                expenses and elevates organizational synergy.
              </p>
              <div className="p-6 bg-muted rounded-2xl border flex gap-4 items-start">
                <Layers className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase">Sovereign Data Loop</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All logistics statuses are computed inside the central server cache prior to
                    dispatch, ensuring safe cross-board logs.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card border border-dashed rounded-3xl space-y-6">
              <div className="p-4 bg-primary text-primary-foreground font-sans font-extrabold text-xs text-center uppercase tracking-widest rounded-xl">
                TINDI HOLDINGS LTD (Central Board)
              </div>
              <div className="flex justify-center">
                <div className="h-6 w-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white border text-center rounded-xl space-y-1">
                  <span className="text-xs font-bold">Capital Allocation</span>
                  <p className="text-[10px] text-muted-foreground">
                    Venture seeding & risk mitigation
                  </p>
                </div>
                <div className="p-4 bg-white border text-center rounded-xl space-y-1">
                  <span className="text-xs font-bold">Technology R&D</span>
                  <p className="text-[10px] text-muted-foreground">
                    Custom components & AI compute
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="h-6 w-px bg-border" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["Tindi Tech", "Tindi Safaris", "Tindi Eats", "Tindi Apparel"].map((nm) => (
                  <div
                    key={nm}
                    className="p-2.5 bg-primary/10 border-primary/20 text-primary border text-center rounded-lg text-[10px] font-bold uppercase leading-tight"
                  >
                    {nm}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Trophies & Badges
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Achievements & Awards</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are proud of our milestones in environmental compliance, transport safeties, and
                digital engineering frameworks.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {awards.map((aw, i) => (
                <div
                  key={i}
                  className="p-5 bg-white border rounded-xl flex justify-between items-center hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-amber-500/10 text-amber-500 grid place-items-center rounded-lg shrink-0">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground dark:text-white">
                        {aw.name}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{aw.issuer}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-medium text-amber-500 bg-amber-500/5 px-2.5 py-1 rounded-full">
                    {aw.year}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
