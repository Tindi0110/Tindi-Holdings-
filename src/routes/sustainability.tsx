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
  ShieldAlert,
  CheckCircle,
  FlameKindling,
  Droplet,
  Sun,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability & Carbon Accounting — Tindi Holdings Ltd" },
      {
        name: "description",
        content:
          "Review ESG metrics, wildlife preservation corridors, and circular textile manufacturing from Tindi Holdings Ltd.",
      },
    ],
  }),
  component: SustainabilityESGPage,
});

function SustainabilityESGPage() {
  const [cartOpen, setCartOpen] = useState(false);

  // Carbon tracker calculator states
  const [susIndustry, setSusIndustry] = useState("logistics");
  const [susInput, setSusInput] = useState(250); // slider
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
      otherName: "Gallons of Diesel Saved",
      desc: "Replacing classic continental shipping with solar-charged, whisper-silent EV heavy rigs and logistics route consolidation models.",
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
      desc: "Using zero-water extraction bamboo polymers and ocean marine plastic threads to craft fully circular premium uniforms.",
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
      desc: "Automating cloud storage levels to block inventory rot. Organic food scraps are routed directly to farming composting silos.",
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
      desc: "Refusing dependence on mass third-party data grids by routing compute needs through private sovereign solar arrays.",
    },
  };

  const selectedContract = susCovenants[susIndustry] || susCovenants.logistics;
  const calculatedCo2Offset = Number((susInput * selectedContract.co2Mult).toFixed(2));
  const calculatedAlternative = Math.floor(susInput * selectedContract.otherFactorMult);

  const handleSusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName || !repEmail) {
      toast.error("Please specify your representative name and partnership email.");
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
      "Offset Blueprint successfully sent to Board! Our ESG compliance desk will connect within 2 business days.",
    );
    setRepName("");
    setRepEmail("");
    setReprNotes("");
  };

  const targets = [
    {
      title: "Net Zero Carbon Logistics",
      icon: Trees,
      value: "Goal: 2028",
      desc: "Aggressive engine conversions. Transitioning all Serengeti luxury cruisers from combustion systems to custom lithium-ion battery propulsion by FY2028.",
    },
    {
      title: "100% Verified Circular Fabrics",
      icon: Leaf,
      value: "Goal: Achieved",
      desc: "Ensuring all uniforms, suits, and jackets manufactured by Tindi Apparel use certified organic bamboo polymers or recycled marine PET threads.",
    },
    {
      title: "Zero Food-Waste Diners",
      icon: Droplet,
      value: "Goal: 95% complete",
      desc: "Equipping all Tindi Eats kitchens with modern cloud inventory trackers, preventing storage loss and diverting scrap back to compost mills.",
    },
    {
      title: "Community Fair-Trade Sourcing",
      icon: HeartHandshake,
      value: "Goal: Active",
      desc: "Contracting directly with rural family farms for coffee beans, cocoa, and grains. Raising direct farm wages by 42% over middle-man benchmarks.",
    },
  ];

  const metrics = [
    { label: "Ocean PET Plastic Recovered", value: "45,000+ Kgs", color: "text-blue-500" },
    { label: "Wildlife Safaris Electrified", value: "48% of Fleet", color: "text-emerald-500" },
    { label: "Renewable Energy Share", value: "82% in Labs", color: "text-amber-500" },
    { label: "Indirect ESG Compliance", value: "Scope 3 Checked", color: "text-indigo-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-gradient-to-b from-[#f3f8ff] via-[#e6f2ff] to-[#f8faff] text-slate-900 py-20 text-center relative overflow-hidden border-b border-sky-100 animate-fade-in">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-widest bg-sky-50 border border-sky-100 px-3.5 py-1.5 rounded-full">
            ESG Board Report
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Eco-Responsibility & ESG
          </h1>
          <p className="text-slate-600 text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Committing to clean operations across transport cargo corridors, material sciences, food
            delivery routes, and sovereign computing servers.
          </p>
        </div>
      </section>

      {/* Figures panel */}
      <section className="py-12 bg-muted border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((met, i) => (
              <div
                key={i}
                className="p-6 bg-white border rounded-2xl text-center shadow-sm hover:border-primary/30 transition-colors"
              >
                <span className="text-xs font-bold text-muted-foreground uppercase block tracking-wider">
                  {met.label}
                </span>
                <span className={`text-2xl md:text-3xl font-black block mt-2 ${met.color}`}>
                  {met.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Targets Grid */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            Our Directives
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
            Concentric ESG Programs
          </h2>
          <p className="text-muted-foreground text-xs mt-2">
            Enforcing tight environmental, social, and governance rules in every operational
            division.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {targets.map((tar, i) => {
            const Icon = tar.icon;
            return (
              <div
                key={i}
                className="p-8 bg-white border hover:border-emerald-500/30 rounded-3xl transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 grid place-items-center">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-mono font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full uppercase tracking-widest">
                      {tar.value}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold tracking-tight text-foreground dark:text-white leading-none">
                    {tar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{tar.desc}</p>
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

      {/* SECTION: INTERACTIVE ESG IMPACT CALCULATOR */}
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
              Model potential Scope 1 & Scope 3 carbon offsets and resource diversions instantly by
              adjusting partner metrics under Tindi's corporate covenants.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Interactive Controls */}
            <div className="lg:col-span-7 bg-card border border-border p-6 md:p-8 rounded-3xl space-y-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">
                  Step 1: Choose Corporate Division Covenants
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
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
                            : "bg-white hover:bg-muted text-muted-foreground border-border text-xs"
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
                  <span>{Math.floor(selectedContract.max / 2).toLocaleString()}</span>
                  <span>{selectedContract.max.toLocaleString()} Max</span>
                </div>
              </div>
            </div>

            {/* Right Column: Calculations & Form */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              {/* Output Display */}
              <div className="bg-gradient-to-br from-white to-sky-50/40 border border-sky-100 text-slate-900 p-6 md:p-8 rounded-3xl shadow-sm flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-sky-600 font-mono uppercase tracking-widest block pl-1">
                    Carbon ledger projection
                  </span>

                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">
                      CO2 Offset equivalent:
                    </span>
                    <span className="text-3xl md:text-4xl font-black text-emerald-600 block mt-1.5 font-sans tracking-tight">
                      {calculatedCo2Offset} Metric Tons
                    </span>
                  </div>

                  <div className="pt-4 border-t border-sky-100 mt-1">
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">
                      {selectedContract.otherName}:
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-800 block mt-1">
                      +{calculatedAlternative.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-sky-50/50 border border-sky-100 rounded-2xl">
                  <span className="text-[10px] text-slate-600 leading-relaxed block font-sans font-medium">
                    *Compounded based on Nairobi Materials Institute & Continental Logistics Council
                    verified carbon credit coefficients.
                  </span>
                </div>
              </div>

              {/* Inquiry form */}
              <form
                onSubmit={handleSusSubmit}
                className="bg-white border p-6 rounded-3xl space-y-3.5 shadow-sm"
              >
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground dark:text-white pb-1.5 border-b border-border pl-1 select-none">
                  Request Offset Integration Blueprint
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Liaison Name"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="h-8 px-2.5 border border-border bg-white text-xs rounded-lg focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Partner Email"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className="h-8 px-2.5 border border-border bg-white text-xs rounded-lg focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Sustainability specifications or notes (optional)"
                  value={reprNotes}
                  onChange={(e) => setReprNotes(e.target.value)}
                  className="w-full h-8 px-2.5 border border-border bg-white text-xs rounded-lg focus:outline-none"
                />
                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg uppercase tracking-wide"
                >
                  Request compliance validation <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Serengeti clean conversions text block */}
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
                Logistics and diesel engines have historically compromised wildlife sanctuaries. To
                solve this, Tindi Safaris teamed up with Tindi Tech design labs to convert older
                heavy diesel land cruisers into custom, solar-assisted electric safari vehicles.
                Operates with silent whisper mechanics allowing tourists to encounter wildlife
                without fumes or mechanical racket.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Integrated solar charging canvas roof blocks</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  <span>350km whisper range per battery module</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-video shadow-xl border">
              <img
                src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600"
                alt="Silent Electrified Safari Cruiser"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-6 text-white">
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                    Mombasa Wildlife Corridor
                  </span>
                  <h4 className="text-base font-black mt-1">Whisper-Engine Fleet Conversion #14</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable certification list */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">
                Verified Badges
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Eco Certifications & Standards
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tindi Holdings Ltd operating divisions undergo systematic third-party testing to
                earn and protect environmental credentials.
              </p>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 bg-card border rounded-xl flex gap-4">
                <div className="h-10 w-10 bg-emerald-550/10 text-emerald-500 rounded-lg grid place-items-center shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase">
                    Global Recycled Standard (GRS)
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Attained by Tindi Apparel design floors for complete circular use of ocean
                    recovered plastic polymers and bamboo fibers.
                  </p>
                </div>
              </div>
              <div className="p-5 bg-card border rounded-xl flex gap-4">
                <div className="h-10 w-10 bg-emerald-550/10 text-emerald-500 rounded-lg grid place-items-center shrink-0">
                  <Sun className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm uppercase">
                    Continental Zero Emission Trust Badge
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Awarded to Tindi Safaris for continuous conversion of heavy freight cabins and
                    tourist vehicles into clean battery rigs.
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
