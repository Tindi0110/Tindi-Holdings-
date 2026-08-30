import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cmsStore } from "@/lib/cms-store";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MetricBadge } from "@/components/shared/StatusBadges";
import {
  Download,
  FileText,
  Landmark,
  ShieldCheck,
  PieChart,
  TrendingUp,
  Users,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/investors")({
  head: () => ({
    meta: [
      { title: "Investor Relations & Holding Governance — Tindi Holdings Ltd" },
      {
        name: "description",
        content:
          "Review consolidated financial growth charts, chairman's letter, audit reports, and presentation PDF downloads.",
      },
    ],
  }),
  component: InvestorRelationsPage,
});

function InvestorRelationsPage() {
  const [cartOpen, setCartOpen] = useState(false);

  // Co-investment simulation states
  const [investAmount, setInvestAmount] = useState(250000);
  const [investYears, setInvestYears] = useState(5);
  const [investSector, setInvestSector] = useState("balanced");
  const [coName, setCoName] = useState("");
  const [coEmail, setCoEmail] = useState("");
  const [coNotes, setCoNotes] = useState("");

  const sectorCagr: Record<string, { name: string; cagr: number; desc: string }> = {
    balanced: {
      name: "Diversified Holdings Portfolio",
      cagr: 0.315,
      desc: "Aggregated growth across all operating subsidiaries, blending high-growth AI labs with stable logistics and cash-flowing retail nodes.",
    },
    tech: {
      name: "Sovereign Cloud & AI Labs (Tindi Tech)",
      cagr: 0.382,
      desc: "High-yield division centering edge-automation, smart smart-appliances, biometric terminals, and secure enterprise APIs.",
    },
    logistics: {
      name: "Eco-Freight Corridors (Tindi Safaris)",
      cagr: 0.258,
      desc: "Robust capital growth covering cross-border heavy transits, container forwarding, and heavy whisper-fleet electric conversions.",
    },
    retail: {
      name: "Eco-Fashion & Food (Tindi Apparel/Eats)",
      cagr: 0.194,
      desc: "Direct-to-consumer circular bamboo clothing lines integrated with high-density automated cloud-dining outlets.",
    },
  };

  const selectedSector = sectorCagr[investSector] || sectorCagr.balanced;
  const targetCagr = selectedSector.cagr;
  const finalEstValue = Math.floor(investAmount * Math.pow(1 + targetCagr, investYears));
  const totalGain = finalEstValue - investAmount;

  const handleCoInvestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coName || !coEmail) {
      toast.error("Please supply representative name and corporate email.");
      return;
    }
    cmsStore.createTicket({
      name: coName,
      email: coEmail,
      phone: "+254",
      subsidiary: "Tindi Holdings Ltd",
      channel: "Partnership",
      subject: `Co-Investment Prospect: $${investAmount.toLocaleString()}`,
      message: `Simulated Configuration: [Sector: ${selectedSector.name}] [CAGR: ${(targetCagr * 100).toFixed(1)}%] [Span: ${investYears} years] [Calculated Target Valuation: $${finalEstValue.toLocaleString()}] [Estimated Capital Accrual: $${totalGain.toLocaleString()}]. Message from representative: ${coNotes || "Ready to evaluate term-sheet guidelines."}`,
    });
    toast.success(
      "Expression of Interest successfully received! Evans Njenga Matindi's corporate development board will schedule a formal term briefing.",
    );
    setCoName("");
    setCoEmail("");
    if (coNotes) {
      setCoNotes("");
    }
  };

  // Financial chart data
  const financialData = [
    { year: "2021", Tech: 4.2, Logistics: 5.8, Retail: 2.1, holdingTotal: 12.1 },
    { year: "2022", Tech: 6.8, Logistics: 7.2, Retail: 3.5, holdingTotal: 17.5 },
    { year: "2023", Tech: 11.5, Logistics: 10.4, Retail: 5.2, holdingTotal: 27.1 },
    { year: "2024", Tech: 17.2, Logistics: 12.8, Retail: 8.4, holdingTotal: 38.4 },
    { year: "2025", Tech: 24.5, Logistics: 16.5, Retail: 12.0, holdingTotal: 53.0 },
    { year: "2026 (Est)", Tech: 32.0, Logistics: 22.0, Retail: 16.8, holdingTotal: 70.8 },
  ];

  const handleDownloadReport = (rep: string) => {
    toast.success(`Briefing download simulation completed successfully: ${rep}`);
  };

  const reports = [
    {
      title: "Tindi Holdings Ltd 2025 Consolidated Annual Financial Report",
      size: "4.8 MB",
      type: "PDF Document",
    },
    {
      title: "Strategic 5-Year Expansion Seeding Prospectus (2026-2031)",
      size: "12.4 MB",
      type: "Keynote / PDF Briefing",
    },
    {
      title: "Audit Commission Risk Mitigation Handbooks & Charter Guidelines",
      size: "2.1 MB",
      type: "Governance PDF",
    },
    {
      title: "Q1 2026 Board Earnings Conference Call Slide Deck",
      size: "1.8 MB",
      type: "Slides PDF",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-gradient-to-b from-[#f3f8ff] dark:from-zinc-950 via-[#e6f2ff] dark:via-zinc-900 to-[#f8faff] dark:to-background text-foreground py-20 text-center relative overflow-hidden border-b border-border animate-fade-in">
        <div className="mx-auto max-w-4xl px-6 relative">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 px-3.5 py-1.5 rounded-full">
            Shareholder Desk • Pre-Launch Information
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Investor Relations
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Strategic investment briefings, capital expansion roadmap, and operational governance
            for partners and institutional stakeholders.
          </p>
        </div>
      </section>

      {/* Regulatory Pre-Launch Notice */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3.5 px-4">
        <div className="mx-auto max-w-screen-2xl flex items-center justify-center gap-3 text-xs text-amber-800 dark:text-amber-300 font-medium text-center flex-wrap">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Pre-Launch Regulatory Disclaimer:</strong> Tindi Holdings Ltd is currently in pre-launch preparation. All financial models, CAGR scenarios, and forecasts presented on this portal are illustrative projections for prospective partners and do not represent historical audited returns.
          </span>
        </div>
      </div>

      {/* Chairman Message */}
      <section className="py-20 mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden aspect-square border">
            <img
              src="https://tyhdjsgnyccpsihfvstr.supabase.co/storage/v1/object/public/uploads/web%20uploads/ceo.jpeg"
              alt="Evans Njenga Matindi - Chairman"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                Founder & CEO
              </span>
              <h4 className="text-lg font-black mt-1.5">Evans Njenga Matindi</h4>
              <p className="text-[11px] text-slate-300 leading-normal mt-1">
                "Aligning advanced private node compute arrays with heavy shipping operations to
                maintain sovereign high double-digit margins."
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-conversion uppercase tracking-widest">
              Chairman's Strategic Briefing
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Consolidation, Digital Sovereignty, and Multi-Industry Security
            </h2>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
              <p>Dear Shareholders, Co-Investors, and Strategic Partners,</p>
              <p>
                Tindi Holdings Ltd is preparing its market entrance with robust structural foundations. By centering technological development in our Tindi Tech software engineering labs, we build sovereign infrastructure where our applications, telemetry, and customer platforms operate with high security and low third-party dependency.
              </p>
              <p>
                This digital autonomy will empower our multi-sector operations—spanning freight supply corridors, curated travel experiences, smart urban technologies, and sustainable fashion lines. We are actively establishing long-term strategic relationships with partners who share our dedication to high-efficiency African commerce.
              </p>
              <p className="font-serif italic font-bold text-foreground dark:text-white pt-2">
                — Evans Njenga Matindi, Founder & Chief Executive Officer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial charts */}
      <section id="highlights" className="py-20 bg-muted border-y border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                Growth Projections
              </span>
              <MetricBadge classification="PROJECTED" size="xs" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              Illustrative Revenue Forecasts
            </h2>
            <p className="text-muted-foreground text-xs mt-2">
              Multi-year projected holding earnings model by operating subsidiary ($ Millions Target).
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 p-6 bg-card border border-border rounded-3xl shadow-sm h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={financialData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="year" stroke="#888888" fontSize={11} fontStyle="bold" />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip formatter={(value) => [`$${value}M`, undefined]} />
                  <Area
                    type="monotone"
                    dataKey="Tech"
                    stackId="1"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.25}
                    name="Tindi Tech"
                  />
                  <Area
                    type="monotone"
                    dataKey="Logistics"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.25}
                    name="Tindi Safaris"
                  />
                  <Area
                    type="monotone"
                    dataKey="Retail"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.25}
                    name="Apparel/Eats"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="flex gap-3 items-start">
                  <div className="h-9 w-9 bg-primary/10 text-primary grid place-items-center rounded-lg shrinkage-0 mt-0.5">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase">Consolidated Compound CAGR</h4>
                    <span className="text-2xl font-black text-primary block mt-1">36.4%</span>
                    <p className="text-[11px] text-muted-foreground leading-normal mt-1">
                      Aggregated year-over-year corporate proceed escalation since FY2021.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-card border border-border rounded-xl">
                <div className="flex gap-3 items-start">
                  <div className="h-9 w-9 bg-conversion/10 text-conversion grid place-items-center rounded-lg shrinkage-0 mt-0.5">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase">Fitch / AAA Credit Rating</h4>
                    <span className="text-2xl font-black text-conversion block mt-1">
                      Excellent
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-normal mt-1">
                      Superb debt-to-equity ratios maintained within rigid risk guardrails.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: CO-INVESTMENT GROWTH PROJECTOR PLATFORM */}
      <section className="py-20 bg-background border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left side: Interactive Controls */}
            <div className="lg:col-span-7 space-y-8 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-conversion uppercase tracking-widest bg-sky-900/10 px-3 py-1 rounded-full dark:bg-sky-950/60">
                  Interactive Capital Sandbox
                </span>
                <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-foreground dark:text-white">
                  Co-Investment Growth Projector
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Configure mock capital deployment parameters across Tindi's core high-growth
                  sectors to forecast compounded returns over time.
                </p>
              </div>

              {/* Slider 1: Amount */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Initial Principal Selection</span>
                  <span className="font-mono text-sm text-primary font-black">
                    ${investAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="5000000"
                  step="25000"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/75">
                  <span>$25K</span>
                  <span>$1.5M</span>
                  <span>$3.2M</span>
                  <span>$5M Max</span>
                </div>
              </div>

              {/* Slider 2: Years */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Holding Investment Span</span>
                  <span className="font-mono text-sm text-conversion font-black">
                    {investYears} {investYears === 1 ? "Year" : "Years"}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={investYears}
                  onChange={(e) => setInvestYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-conversion"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground/75">
                  <span>1 Yr</span>
                  <span>3 Yrs</span>
                  <span>5 Yrs</span>
                  <span>10 Yrs Max</span>
                </div>
              </div>

              {/* Grid selectors for target sector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Select Target Industry Allocation
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(sectorCagr).map(([key, info]) => {
                    const isSelected = investSector === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setInvestSector(key)}
                        className={`text-left p-4.5 rounded-2xl border text-xs transition-colors transition-transform font-sans ${
                          isSelected
                            ? "bg-muted border-primary shadow-sm ring-1 ring-primary/20 scale-[1.01]"
                            : "bg-card hover:bg-muted border-border"
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="font-extrabold text-sm uppercase leading-tight text-foreground dark:text-white">
                            {key === "balanced"
                              ? "Balanced"
                              : key === "tech"
                                ? "Tech"
                                : key === "logistics"
                                  ? "Freight"
                                  : "Consumer"}
                          </span>
                          <span className="text-xs font-mono font-bold text-primary shrink-0">
                            +{(info.cagr * 100).toFixed(1)}% CAGR
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug line-clamp-2">
                          {info.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: Real-time projections & Expression Form */}
            <div className="lg:col-span-5 space-y-6 self-stretch flex flex-col justify-between">
              {/* Projections Card */}
              <div className="bg-gradient-to-br from-card to-primary/5 border border-border p-6 md:p-8 rounded-3xl text-foreground shadow-sm flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary font-mono block pl-1">
                    Compound Forecast Output
                  </span>
                  <div>
                    <span className="text-xs text-muted-foreground uppercase block font-medium">
                      Estimated Capital Accrual:
                    </span>
                    <span className="text-4xl md:text-5xl font-black font-sans tracking-tight text-foreground block mt-1.5 leading-none">
                      ${finalEstValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 mt-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                        Principal:
                      </span>
                      <span className="text-xs font-mono font-bold text-foreground">
                        ${investAmount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                        Compound Gain:
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        +${totalGain.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro metrics */}
                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <span className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed block font-medium">
                    ⚡ <strong>Simulation Notice:</strong> This forecast is an illustrative simulation based on targeted compound growth models and strategic targets. It does not constitute financial advice or guaranteed yield.
                  </span>
                </div>
              </div>

              {/* Express Interest form */}
              <form
                onSubmit={handleCoInvestSubmit}
                className="bg-card border border-border p-6 rounded-3xl space-y-3 shadow-md"
              >
                <h4 className="font-extrabold text-xs uppercase text-foreground dark:text-white tracking-widest block pl-1 pb-1 border-b border-border">
                  Corporate Briefing Mandate
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={coName}
                    onChange={(e) => setCoName(e.target.value)}
                    className="w-full h-8 px-2.5 border border-border text-xs rounded-lg bg-background focus:outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Brand Email"
                    value={coEmail}
                    onChange={(e) => setCoEmail(e.target.value)}
                    className="w-full h-8 px-2.5 border border-border text-xs rounded-lg bg-background focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Additional parameters or notes (optional)"
                  value={coNotes}
                  onChange={(e) => setCoNotes(e.target.value)}
                  className="w-full h-8 px-2.5 border border-border text-xs rounded-lg bg-background focus:outline-none"
                />
                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-bold btn-conversion rounded-lg uppercase tracking-wide border border-transparent shadow"
                >
                  Schedule Term-Sheet Review <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Briefings PDF list */}
      <section id="briefings" className="py-20 bg-background">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-4">
              <span className="text-xs font-bold text-conversion uppercase tracking-widest block font-sans">
                Corporate Materials
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Shareholder Resource Library
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Download verified annual statements, board slide-decks, governance charters, and
                strategic prospecting literature instantly.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              {reports.map((rep, i) => (
                <div
                  key={i}
                  className="p-5 bg-card border border-border hover:border-primary/40 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 text-primary grid place-items-center rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground dark:text-white leading-snug">
                        {rep.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground underline tracking-wide font-medium block mt-1">
                        {rep.type} • {rep.size}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownloadReport(rep.title)}
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-xs font-bold text-primary border-stone-300 dark:border-stone-700 hover:bg-primary/5 select-none"
                  >
                    Download <Download className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Corporate governance */}
      <section className="py-20 bg-background border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-conversion uppercase tracking-widest block font-sans">
                Operational Charter
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight">
                High Risk Governance & Compliance Standards
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tindi Holdings Ltd operates strictly within national and continental trade
                boundaries. To assure absolute compliance, every financial dispatch and operational
                tax report undergoes double independent third-party audits annually. Our board is
                overseen by independent directors holding no stakes inside localized operational
                subsidiaries.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-muted rounded-xl border">
                  <h4 className="font-extrabold text-xs uppercase text-slate-800 dark:text-slate-200">
                    Independent Directors
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    60% of voting board seats are allocated to independent compliance figures.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-xl border">
                  <h4 className="font-extrabold text-xs uppercase text-slate-800 dark:text-slate-200">
                    Audit Consistency
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    Delivered to international banking associations within 40 days of standard
                    fiscal closing.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-card border border-border border-dashed rounded-3xl space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary">
                Board Governance Commitees
              </h4>
              <div className="space-y-2.5">
                {[
                  "Audit & Capital Resource Management Committee (ACRMC)",
                  "Compensation & Executive Leadership Committee (CELC)",
                  "Science, Sustainable Design & Innovation Taskforce (SSDIT)",
                  "ESG Integration & Wildlife Protection Regulatory Council",
                ].map((comm, i) => (
                  <div
                    key={i}
                    className="flex gap-2.5 p-3 bg-muted border rounded-lg text-xs font-semibold"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{comm}</span>
                  </div>
                ))}
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
