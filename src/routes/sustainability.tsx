import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cmsStore } from "@/lib/cms-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Leaf,
  Award,
  HeartHandshake,
  Trees,
  Droplet,
  Sun,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Target,
  Zap,
  Wind,
  Recycle,
  BarChart3,
} from "lucide-react";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      {
        title:
          "Sustainability & ESG Roadmap — Tindi Holdings Ltd | 2026–2028 Climate Commitments",
      },
      {
        name: "description",
        content:
          "Review Tindi Holdings Ltd's forward-looking ESG commitments: net-zero logistics targets, circular textile manufacturing, zero food-waste programs, and sovereign clean-compute plans launching Q4 2026.",
      },
      { name: "og:title", content: "Tindi Holdings Ltd — ESG & Sustainability Roadmap" },
      {
        name: "og:description",
        content:
          "Our Scope 1–3 carbon charter, circular materials pledge, and clean-energy sovereign compute plans, built from inception for Q4 2026 operations.",
      },
    ],
  }),
  component: SustainabilityESGPage,
});

function SustainabilityESGPage() {
  const [cartOpen, setCartOpen] = useState(false);

  // Carbon tracker calculator states
  const [susIndustry, setSusIndustry] = useState("logistics");
  const [susInput, setSusInput] = useState(250);
  const [repName, setRepName] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [reprNotes, setReprNotes] = useState("");

  const susCovenants: Record<
    string,
    {
      title: string;
      metricName: string;
      min: number;
      max: number;
      step: number;
      co2Mult: number;
      otherFactorMult: number;
      otherName: string;
      desc: string;
    }
  > = {
    logistics: {
      title: "Tindi Safaris Eco-Logistics",
      metricName: "Weekly Cargo Tonnage Transited (Tons)",
      min: 10,
      max: 2000,
      step: 10,
      co2Mult: 0.14,
      otherFactorMult: 45,
      otherName: "Gallons of Diesel Avoided",
      desc: "Replacing classic continental shipping with solar-charged, whisper-silent EV heavy rigs and logistics route consolidation models — targeted to begin Q4 2026.",
    },
    apparel: {
      title: "Tindi Apparel Verified Threads",
      metricName: "Custom Manufactured Garments (Units)",
      min: 100,
      max: 30000,
      step: 100,
      co2Mult: 0.009,
      otherFactorMult: 1.25,
      otherName: "Kgs of Marine Plastic Recycled",
      desc: "Using zero-water extraction bamboo polymers and ocean marine plastic threads to craft fully circular premium uniforms from day one of operations.",
    },
    eats: {
      title: "Tindi Eats Zero Food-Waste",
      metricName: "Weekly Meals Distributed (Meals)",
      min: 100,
      max: 15000,
      step: 100,
      co2Mult: 0.003,
      otherFactorMult: 1.6,
      otherName: "Kgs Food-Waste Diverted to Compost",
      desc: "Automating cloud storage levels to block inventory rot. Organic food scraps routed directly to farming composting silos from first kitchen opening.",
    },
    tech: {
      title: "Tindi Private Nodes Sovereign Computes",
      metricName: "Average Active Dedicated Cores (VCPUs)",
      min: 8,
      max: 1000,
      step: 8,
      co2Mult: 0.016,
      otherFactorMult: 120,
      otherName: "Kilowatt-Hours Renewable Share",
      desc: "Refusing dependence on mass third-party data grids by routing compute needs through private sovereign solar arrays — planned cluster deployment in 2026.",
    },
  };

  const selectedContract = susCovenants[susIndustry] || susCovenants.logistics;
  const calculatedCo2Offset = Number(
    (susInput * selectedContract.co2Mult).toFixed(2)
  );
  const calculatedAlternative = Math.floor(
    susInput * selectedContract.otherFactorMult
  );

  const handleSusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName || !repEmail) {
      toast.error(
        "Please specify your representative name and partnership email."
      );
      return;
    }
    cmsStore.createTicket({
      name: repName,
      email: repEmail,
      phone: "+254",
      subsidiary: "Tindi Holdings Ltd",
      channel: "Sustainability",
      subject: `ESG Offset Query: ${selectedContract.title}`,
      message: `Calculated Configuration: [Industry: ${selectedContract.title}] [Volume Level: ${susInput}] [CO2 Offset Projected: ${calculatedCo2Offset} Metric Tons] [Secondary Mitigation: ${calculatedAlternative} ${selectedContract.otherName}]. Message from Representative: ${reprNotes || "Interested in compliance credentials."}`,
    });
    toast.success(
      "Offset Blueprint successfully sent to Board! Our ESG compliance desk will connect within 2 business days."
    );
    setRepName("");
    setRepEmail("");
    setReprNotes("");
  };

  const targets = [
    {
      title: "Net Zero Carbon Logistics",
      icon: Trees,
      value: "Target: 2028",
      tag: "Planned",
      tagColor: "text-sky-500 bg-sky-500/10",
      desc: "Aggressive engine conversions planned from Q4 2026. All Serengeti luxury cruisers to transition from combustion systems to custom lithium-ion battery propulsion by FY2028.",
    },
    {
      title: "100% Verified Circular Fabrics",
      icon: Leaf,
      value: "From Inception",
      tag: "Committed",
      tagColor: "text-emerald-500 bg-emerald-500/10",
      desc: "All uniforms, suits, and jackets manufactured by Tindi Apparel designed to use certified organic bamboo polymers or recycled marine PET threads from day-one operations.",
    },
    {
      title: "Zero Food-Waste Diners",
      icon: Droplet,
      value: "Target: Year 1",
      tag: "Planned",
      tagColor: "text-sky-500 bg-sky-500/10",
      desc: "Equipping all Tindi Eats kitchens with modern cloud inventory trackers from launch, preventing storage loss and diverting scrap back to compost mills.",
    },
    {
      title: "Community Fair-Trade Sourcing",
      icon: HeartHandshake,
      value: "Charter Policy",
      tag: "Committed",
      tagColor: "text-emerald-500 bg-emerald-500/10",
      desc: "Contracting directly with rural family farms for coffee beans, cocoa, and grains. Targeting direct farm wages 40%+ above middleman benchmarks from Q1 2027.",
    },
  ];

  // ESG Roadmap timeline milestones
  const roadmap = [
    {
      period: "Q4 2026",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      title: "Operational Launch & ESG Baseline",
      items: [
        "First Scope 1 emissions measurement across all four subsidiaries",
        "Circular fabric mandate activated for Tindi Apparel",
        "Zero food-waste inventory tracking deployed in Tindi Eats pilot kitchens",
        "Private solar compute cluster Phase 1 online (Tindi Tech)",
      ],
    },
    {
      period: "2027",
      icon: Wind,
      color: "text-sky-500 bg-sky-500/10 border-sky-500/30",
      title: "Scope 2 & Fleet Electrification",
      items: [
        "Fleet electrification: 25% of Tindi Safaris vehicles converted to EV",
        "Scope 2 renewable energy procurement certificates secured",
        "Marine PET plastic recycling volume: 15,000 kg target",
        "Fair-trade sourcing contracts active with 12+ rural farm clusters",
      ],
    },
    {
      period: "2028",
      icon: Recycle,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
      title: "Net Zero Logistics & Scope 3 Coverage",
      items: [
        "Net zero carbon logistics: 100% EV Cruiser fleet",
        "Scope 3 supply chain carbon accounting fully reported",
        "80%+ renewable energy share in Tindi Tech compute clusters",
        "First annual ESG Board Report published to stakeholders",
      ],
    },
  ];

  // Scope framework panels
  const scopeFramework = [
    {
      scope: "Scope 1",
      label: "Direct Emissions",
      icon: BarChart3,
      color: "text-rose-500 bg-rose-500/10",
      desc: "Emissions directly from our owned assets — diesel engines in safari vehicles, kitchen gas in Tindi Eats, and on-site generator fallback power. Primary reduction through EV conversion and solar deployment.",
    },
    {
      scope: "Scope 2",
      label: "Energy Emissions",
      icon: Zap,
      color: "text-amber-500 bg-amber-500/10",
      desc: "Electricity purchased from the national grid to power our compute clusters, apparel floors, and restaurant facilities. Offset via renewable energy certificates and private solar installations.",
    },
    {
      scope: "Scope 3",
      label: "Value Chain Emissions",
      icon: Target,
      color: "text-sky-500 bg-sky-500/10",
      desc: "Upstream and downstream emissions across our supply chains — raw material sourcing, finished goods transportation, and customer product use lifecycle. Addressed through circular design and fair-trade sourcing standards.",
    },
  ];

  const metrics = [
    {
      label: "Ocean PET Plastic Target",
      value: "45,000+ Kgs",
      sub: "Annual by 2028",
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "Fleet Electrification Target",
      value: "100% Cruisers",
      sub: "By FY2028",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Lab Clean Energy Target",
      value: "80%+ Renewable",
      sub: "By 2028",
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "ESG Carbon Framework",
      value: "Scope 1–3",
      sub: "Full Charter",
      color: "text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* PRE-LAUNCH DISCLAIMER BANNER */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 py-3 px-4">
        <div className="mx-auto max-w-screen-2xl flex items-start md:items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 md:mt-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            <span className="font-black uppercase tracking-wide">
              Pre-Launch ESG Charter:
            </span>{" "}
            Tindi Holdings Ltd is currently in its pre-operational phase
            (formal launch Q4 2026). All metrics, targets, and certifications
            presented below represent forward-looking ESG commitments and design
            mandates — not historical performance data. They will be measured
            and reported publicly from the first full operating quarter.
          </p>
        </div>
      </div>

      {/* Banner */}
      <section className="bg-gradient-to-b from-[#f3f8ff] dark:from-zinc-950 via-[#e6f2ff] dark:via-zinc-900 to-[#f8faff] dark:to-background text-foreground py-20 text-center relative overflow-hidden border-b border-border animate-fade-in">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Leaf className="h-3 w-3" /> ESG Charter 2026–2028
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Eco-Responsibility & ESG
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Built clean from inception. Our corporate charter mandates
            environmental accountability across transport, materials, food, and
            sovereign compute — from day one of operations in Q4 2026.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/contact">
              <Button className="h-10 px-5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg uppercase tracking-wide">
                Partner on ESG Compliance
              </Button>
            </Link>
            <a href="#roadmap">
              <Button
                variant="outline"
                className="h-10 px-5 text-xs font-bold rounded-lg uppercase tracking-wide"
              >
                View ESG Roadmap <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Forward-looking targets grid */}
      <section className="py-12 bg-muted border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((met, i) => (
              <div
                key={i}
                className="p-6 bg-card border border-border rounded-2xl text-center shadow-sm hover:border-primary/30 transition-colors"
              >
                <span className="text-xs font-bold text-muted-foreground uppercase block tracking-wider">
                  {met.label}
                </span>
                <span
                  className={`text-2xl md:text-3xl font-black block mt-2 ${met.color}`}
                >
                  {met.value}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-medium block mt-1">
                  {met.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Commitment Targets Grid */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            Our Charter Directives
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
            Concentric ESG Commitments
          </h2>
          <p className="text-muted-foreground text-xs mt-2">
            Environmental, social, and governance rules embedded into every
            operational division from founding.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {targets.map((tar, i) => {
            const Icon = tar.icon;
            return (
              <div
                key={i}
                className="p-8 bg-card border border-border hover:border-emerald-500/30 rounded-3xl transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${tar.tagColor}`}
                      >
                        {tar.tag}
                      </span>
                      <span className="text-xs font-mono font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full uppercase tracking-widest">
                        {tar.value}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight text-foreground leading-none">
                    {tar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    {tar.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">
                    ESG Standard Section {i + 1}
                  </span>
                  <Link to="/contact">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 text-emerald-500 hover:text-emerald-600 font-bold text-xs h-auto bg-transparent"
                    >
                      Inquire About Compliance
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scope 1/2/3 Framework Callout */}
      <section className="py-20 bg-muted border-y border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
              Carbon Accounting Standard
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight mt-1">
              GHG Scope 1, 2 & 3 Framework
            </h2>
            <p className="text-muted-foreground text-xs mt-2 leading-relaxed">
              Tindi Holdings Ltd adopts the GHG Protocol Corporate Standard
              from inception — measuring and disclosing all three emission
              scopes across our four operating subsidiaries.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {scopeFramework.map((scope, i) => {
              const Icon = scope.icon;
              return (
                <div
                  key={i}
                  className="p-7 bg-card border border-border rounded-3xl hover:border-emerald-500/30 transition-colors"
                >
                  <div
                    className={`h-12 w-12 rounded-xl grid place-items-center mb-4 ${scope.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      {scope.scope}
                    </span>
                    <span className="text-sm font-extrabold text-foreground">
                      {scope.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {scope.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ESG Roadmap Timeline */}
      <section id="roadmap" className="py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest inline-flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Sustainability Timeline
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              ESG Execution Roadmap
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              A phased 3-year plan to build one of East Africa's most
              transparent and measurable ESG-compliant conglomerates.
            </p>
          </div>

          <div className="space-y-6">
            {roadmap.map((phase, i) => {
              const Icon = phase.icon;
              return (
                <div
                  key={i}
                  className={`p-7 bg-card border rounded-3xl transition-colors ${phase.color.split(" ").find((c) => c.startsWith("border")) || "border-border"}`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`h-12 w-12 rounded-xl grid place-items-center shrink-0 border ${phase.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border ${phase.color}`}
                        >
                          {phase.period}
                        </span>
                        <h3 className="text-base font-extrabold text-foreground">
                          {phase.title}
                        </h3>
                      </div>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {phase.items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-2 text-xs text-muted-foreground font-medium leading-snug"
                          >
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE ESG IMPACT CALCULATOR */}
      <section className="py-20 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest pl-1 font-mono">
              Audit Simulation Room
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1 text-foreground dark:text-white">
              Sovereign Carbon Account Sandbox
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              Model potential Scope 1 & Scope 3 carbon offsets and resource
              diversions instantly by adjusting partner metrics under Tindi's
              corporate covenants.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-7 bg-card border border-border p-6 md:p-8 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                  Step 1: Choose Corporate Division Covenants
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {Object.entries(susCovenants).map(([key, value]) => {
                    const isSelected = susIndustry === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSusIndustry(key);
                          setSusInput(value.min);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 shadow-sm text-emerald-600 dark:text-emerald-400 font-bold"
                            : "bg-card hover:bg-muted text-muted-foreground border-border text-xs"
                        }`}
                      >
                        <span className="text-[11px] uppercase tracking-wider block">
                          {key === "logistics"
                            ? "Freight"
                            : key === "apparel"
                              ? "Apparel"
                              : key === "eats"
                                ? "Dining"
                                : "Compute"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider content */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                    Step 2: Adjust Partner Target Volume
                  </span>
                  <span className="text-sm font-mono font-black text-emerald-500">
                    {susInput.toLocaleString()}{" "}
                    {susIndustry === "logistics"
                      ? "Tons"
                      : susIndustry === "apparel"
                        ? "Pcs"
                        : susIndustry === "eats"
                          ? "Meals"
                          : "Cores"}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-snug">
                  {selectedContract.desc}
                </p>

                <input
                  type="range"
                  min={selectedContract.min}
                  max={selectedContract.max}
                  step={selectedContract.step}
                  value={susInput}
                  onChange={(e) => setSusInput(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
                  <span>{selectedContract.min.toLocaleString()}</span>
                  <span>
                    {Math.floor(selectedContract.max / 2).toLocaleString()}
                  </span>
                  <span>{selectedContract.max.toLocaleString()} Max</span>
                </div>
              </div>
            </div>

            {/* Right Column: Calculations & Form */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Output Display */}
              <div className="bg-gradient-to-br from-card to-primary/5 border border-border text-foreground p-6 md:p-8 rounded-3xl shadow-sm flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 font-mono uppercase tracking-widest block pl-1">
                    Carbon ledger projection
                  </span>

                  <div>
                    <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                      CO2 Offset equivalent:
                    </span>
                    <span className="text-3xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 block mt-1.5 font-sans tracking-tight">
                      {calculatedCo2Offset} Metric Tons
                    </span>
                  </div>

                  <div className="pt-4 border-t border-border mt-1">
                    <span className="text-[11px] text-muted-foreground block uppercase font-medium">
                      {selectedContract.otherName}:
                    </span>
                    <span className="text-lg font-bold font-mono text-foreground block mt-1">
                      +{calculatedAlternative.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-muted/50 border border-border rounded-2xl">
                  <span className="text-[10px] text-muted-foreground leading-relaxed block font-sans font-medium">
                    *Modelled based on GHG Protocol coefficients and regional
                    logistics benchmarks. Illustrative projections only — actual
                    results will be measured from Q4 2026 operations.
                  </span>
                </div>
              </div>

              {/* Inquiry form */}
              <form
                onSubmit={handleSusSubmit}
                className="bg-card border border-border p-6 rounded-3xl space-y-3.5 shadow-sm"
              >
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground pb-1.5 border-b border-border pl-1 select-none">
                  Request Offset Integration Blueprint
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Liaison Name"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="h-8 px-2.5 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Partner Email"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className="h-8 px-2.5 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Sustainability specifications or notes (optional)"
                  value={reprNotes}
                  onChange={(e) => setReprNotes(e.target.value)}
                  className="w-full h-8 px-2.5 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none"
                />
                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg uppercase tracking-wide"
                >
                  Request compliance validation{" "}
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Electric Cruiser Initiative */}
      <section className="py-20 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans font-black">
                Zero-Emissions Transit
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                The Electric Cruiser Initiative
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Diesel engines historically compromise wildlife sanctuaries. To
                prevent this from the first operating day, Tindi Safaris is
                partnering with Tindi Tech design labs to convert all heavy
                diesel land cruisers into custom, solar-assisted electric
                safari vehicles before fleet launch in Q4 2026.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Integrated solar charging canvas roof panels</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>350 km whisper range per battery module (target)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Wildlife noise impact threshold: &lt;35 dB operating</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-xl border">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600"
                alt="Silent Electrified Safari Cruiser — planned for Tindi Safaris Q4 2026"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-6 text-white">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                    Planned: Mombasa Wildlife Corridor
                  </span>
                  <h4 className="text-base font-black mt-1">
                    Whisper-Engine Fleet — Pre-Deployment Design
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eco Certifications */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">
                Targeted Standards
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Eco Certifications We're Working Toward
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tindi Holdings Ltd operating divisions are designed to undergo
                systematic third-party testing from launch to earn and protect
                these environmental credentials.
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 leading-relaxed">
                Certifications will be formally applied for upon commencement
                of Q4 2026 operations.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 bg-card border rounded-xl flex gap-4">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-lg grid place-items-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase">
                    Global Recycled Standard (GRS)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Targeted by Tindi Apparel design floors for circular use of
                    ocean-recovered plastic polymers and bamboo fibers. Applied
                    for in Year 1.
                  </p>
                </div>
              </div>
              <div className="p-5 bg-card border rounded-xl flex gap-4">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-lg grid place-items-center shrink-0">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase">
                    Continental Zero Emission Trust Badge
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Planned for Tindi Safaris upon continuous conversion of
                    heavy freight cabins and tourist vehicles into clean battery
                    rigs — target Year 2 (2027).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
