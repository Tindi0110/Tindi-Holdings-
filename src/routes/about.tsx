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
  Download,
  FileCheck,
  Lock,
  Compass,
  Cpu,
  CheckCircle2,
  Calendar,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title:
          "About Tindi Holdings Ltd — Executive Leadership, Corporate Charter & Pre-Launch Roadmap",
      },
      {
        name: "description",
        content:
          "Discover the founding vision, executive leadership board, corporate governance charter, and pre-launch Q4 2026 roadmap of Tindi Holdings Ltd.",
      },
      {
        name: "og:title",
        content: "About Tindi Holdings Ltd — Sustainable Innovation & Sovereign Infrastructure",
      },
      {
        name: "og:description",
        content:
          "Leading East Africa's multi-subsidiary ecosystem across sovereign AI compute, zero-emission logistics, luxury safaris, and circular apparel.",
      },
    ],
  }),
  component: AboutPageMessage,
});

function AboutPageMessage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeMilestoneFilter, setActiveMilestoneFilter] = useState<string>("all");

  const leadership = [
    {
      name: "Evans Njenga Matindi",
      role: "Founder & Chief Executive Officer",
      bio: "Enterprise Architect with 15+ years of systems engineering experience directing multi-sector logistical, software, and industrial automation architectures across Europe and East Africa.",
      image:
        "https://tyhdjsgnyccpsihfvstr.supabase.co/storage/v1/object/public/uploads/web%20uploads/ceo%20and%20director.jpeg",
      expertise: "Enterprise Architecture • Strategic Capital • AI Systems",
    },
    {
      name: "Dr. Amanda Kipchumba",
      role: "Group Managing Director",
      bio: "Former Infrastructure Director specializing in high-concurrence agritech distribution, regulatory compliance, and regional supply chain development.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
      expertise: "Supply Chain • Operations • Pan-African Expansion",
    },
    {
      name: "Leonard Sylvanus",
      role: "Head of AI & Sovereign Systems",
      bio: "IoT and edge computing specialist leading the high-resilience computing infrastructure and telemetry data pipelines for Tindi Tech.",
      image:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300",
      expertise: "Sovereign Cloud • Telemetry • Edge ML",
    },
    {
      name: "Sonia Gakii",
      role: "Chief Sustainability Officer (CSO)",
      bio: "Spearheading circular bio-polymer textile research at Tindi Apparel, solar microgrid conversions, and fleet decarbonization programs.",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
      expertise: "Circular Materials • ESG Compliance • Clean Mobility",
    },
  ];

  const milestones = [
    {
      phase: "Phase 1",
      category: "architecture",
      year: "2024",
      status: "Completed",
      title: "Strategic Holding Architecture",
      desc: "Conceptualized the unified multi-sector holding structure to bridge high-growth technology, zero-emission logistics, premium safari hospitality, and circular sustainable apparel across East Africa.",
    },
    {
      phase: "Phase 2",
      category: "structuring",
      year: "2025",
      status: "Completed",
      title: "Corporate & Legal Structuring",
      desc: "Established legal charters, subsidiary capital allocation mechanisms, intellectual property protections, and strict ESG compliance standards across all 4 core operating entities.",
    },
    {
      phase: "Phase 3",
      category: "engineering",
      year: "Early 2026",
      status: "Completed",
      title: "Core Platform & Sovereign Tech Engineering",
      desc: "Tindi Tech engineered custom automation architectures, local telemetry stacks, edge IoT hubs, and sovereign ERP modules with zero reliance on external public clouds.",
    },
    {
      phase: "Phase 4",
      category: "pre-launch",
      year: "Mid 2026",
      status: "Active",
      title: "Pre-Launch Ecosystem Integration & Pilot Audits",
      desc: "Currently executing institutional partnerships, procurement alignments, supplier contracts, and beta trials in anticipation of formal commercial operations.",
    },
    {
      phase: "Phase 5",
      category: "rollout",
      year: "Q4 2026",
      status: "Upcoming",
      title: "Commercial Launch & Operating Rollout",
      desc: "Simultaneous phased opening of Tindi Tech Enterprise Services, Tindi Safaris zero-emission safari bookings, Tindi Apparel initial catalog, and Tindi Eats hubs.",
    },
    {
      phase: "Phase 6",
      category: "rollout",
      year: "2027+",
      status: "Upcoming",
      title: "Pan-African Scaling & Regional Corridors",
      desc: "Expanding green freight corridors through Mombasa and Dar es Salaam, scaling private AI compute clusters, and expanding retail outlets across major African hubs.",
    },
  ];

  const filteredMilestones =
    activeMilestoneFilter === "all"
      ? milestones
      : milestones.filter((m) => m.category === activeMilestoneFilter || (activeMilestoneFilter === "completed" && m.status === "Completed"));

  const commitments = [
    { year: "Governance", name: "AAA Risk Charter & ESG Compliance", issuer: "Institutional Standard" },
    {
      year: "Technology",
      name: "Sovereign Private Infrastructure",
      issuer: "Zero Third-Party Cloud Reliance",
    },
    {
      year: "Sustainability",
      name: "Circular Fibers & Clean Mobility",
      issuer: "Eco-Conversion Framework",
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
      <section id="timeline" className="py-20 bg-muted/40 border-y border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Strategic Roadmap
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              Holding Milestones & Evolution
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              From architectural blueprint to imminent Q4 2026 multi-subsidiary deployment.
            </p>
          </div>

          {/* Milestone Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: "all", label: "All Phases" },
              { id: "completed", label: "Completed Foundations" },
              { id: "pre-launch", label: "Current Pre-Launch" },
              { id: "rollout", label: "Commercial Rollout (Q4 2026+)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMilestoneFilter(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeMilestoneFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative border-l border-border/80 ml-4 md:ml-36 space-y-10 max-w-4xl mx-auto">
            {filteredMilestones.map((ms, i) => (
              <div key={i} className="relative pl-8 md:pl-12 group">
                <div
                  className={`absolute -left-3 top-1.5 h-6 w-6 rounded-full border-2 grid place-items-center font-mono text-[9px] font-black transition-all ${
                    ms.status === "Completed"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                      : ms.status === "Active"
                        ? "bg-amber-500/10 border-amber-500 text-amber-500 ring-4 ring-amber-500/20"
                        : "bg-background border-primary text-primary"
                  }`}
                >
                  {i + 1}
                </div>
                <div className="md:absolute md:-left-36 md:top-1.5 text-right md:w-28 space-y-0.5">
                  <div className="font-black font-mono text-sm text-primary">{ms.year}</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">{ms.phase}</div>
                </div>
                <div className="p-5 bg-card border border-border rounded-2xl group-hover:border-primary/40 transition-all shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h4 className="text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {ms.title}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ms.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : ms.status === "Active"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse"
                            : "bg-primary/10 text-primary border border-primary/20"
                      }`}
                    >
                      {ms.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all flex flex-col"
              >
                <div className="h-64 overflow-hidden bg-muted relative">
                  <img
                    src={lead.image}
                    alt={lead.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-foreground leading-none">
                      {lead.name}
                    </h4>
                    <span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider block mt-1.5">
                      {lead.role}
                    </span>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{lead.bio}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <span className="text-[10px] font-mono text-primary font-bold block">{lead.expertise}</span>
                  </div>
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
              <div className="p-6 bg-muted rounded-2xl border border-border flex gap-4 items-start">
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

            <div className="p-8 bg-card border border-border border-dashed rounded-3xl space-y-6">
              <div className="p-4 bg-primary text-primary-foreground font-sans font-extrabold text-xs text-center uppercase tracking-widest rounded-xl">
                TINDI HOLDINGS LTD (Central Board)
              </div>
              <div className="flex justify-center">
                <div className="h-6 w-px bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border border-border text-center rounded-xl space-y-1">
                  <span className="text-xs font-bold">Capital Allocation</span>
                  <p className="text-[10px] text-muted-foreground">
                    Venture seeding & risk mitigation
                  </p>
                </div>
                <div className="p-4 bg-card border border-border text-center rounded-xl space-y-1">
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

      {/* Commitments & Standards section */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                Governance & Standards
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">Institutional Standards</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our operations, data privacy protocols, and carbon reduction initiatives adhere to
                highest-tier enterprise governance and African sustainable commerce frameworks.
              </p>
              <div className="p-6 bg-card border border-border rounded-2xl space-y-3">
                <div className="flex items-center gap-3 text-primary">
                  <FileCheck className="h-5 w-5 shrink-0" />
                  <h4 className="text-xs font-bold uppercase">Corporate Charter Disclosures</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Review our complete foundational governance structure, audit protocols, and executive accountability mandates.
                </p>
                <a
                  href="/corporate-charter.pdf"
                  download="Tindi-Holdings-Corporate-Charter.pdf"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline pt-1"
                >
                  <Download className="h-3.5 w-3.5" /> Download Governance Charter (PDF)
                </a>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {commitments.map((com, i) => (
                <div
                  key={i}
                  className="p-5 bg-card border border-border rounded-xl flex justify-between items-center hover:border-sky-400/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-sky-500/10 text-sky-600 dark:text-sky-400 grid place-items-center rounded-lg shrink-0">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {com.name}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">{com.issuer}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-medium text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full">
                    {com.year}
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
