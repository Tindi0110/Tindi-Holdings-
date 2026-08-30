import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { CompanyStack } from "@/components/CompanyStack";
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/lib/catalog.functions";
import { cmsStore, CorporateCompany } from "@/lib/cms-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { EntityStatusBadge, MetricBadge } from "@/components/shared/StatusBadges";
import {
  Cpu,
  Compass,
  Utensils,
  Shirt,
  Flame,
  CheckCircle,
  Truck,
  DollarSign,
  Briefcase,
  Mail,
  Phone,
  ArrowRight,
  ListRestart,
  Scissors,
  Coffee,
  MapPin,
  CalendarDays,
  Send,
  Building,
} from "lucide-react";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Our Companies — Tindi Holdings Ltd Subsidiaries & Operational Sectors" },
      {
        name: "description",
        content:
          "Explore details, services, custom calculators, and booking channels for all Tindi Holdings Ltd subsidiaries.",
      },
    ],
  }),
  component: OurCompaniesPage,
});

const logoMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Compass,
  Utensils,
  Shirt,
};

function OurCompaniesPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const companies = cmsStore.getCompanies();

  const [activeTab, setActiveTab] = useState<string>(companies[0]?.id ?? "comp-tech");

  const company = companies.find((c) => c.id === activeTab) ?? companies[0];

  // Forms states
  // 1. Tindi Tech quotation
  const [techSvc, setTechSvc] = useState("Enterprise Software Development");
  const [techScope, setTechScope] = useState("Small Business (Under 100 personnel)");
  const [techContact, setTechContact] = useState({ name: "", email: "", specs: "" });

  const techEstCost = () => {
    let base = 5000;
    if (techSvc === "Smart Homes & Automation") base = 12000;
    if (techSvc === "Cybersecurity Pen-Testing") base = 8000;
    if (techScope === "Corporate Conglomerate / High-Scale") base *= 4;
    if (techScope === "Midsize Enterprise") base *= 2;
    return base;
  };

  const handleTechQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techContact.name || !techContact.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    cmsStore.createTicket({
      name: techContact.name,
      email: techContact.email,
      phone: "+254",
      subsidiary: "Tindi Tech & Smart Homes",
      channel: "Support",
      subject: `Quotation Request: ${techSvc}`,
      message: `System Specs Required: [Scope: ${techScope}] [Est. Budget: $${techEstCost()}] - ${techContact.specs}`,
    });
    toast.success("Quotation request submitted to Tindi Tech accounts team!");
    setTechContact({ name: "", email: "", specs: "" });
  };

  // 2. Tindi Safaris Booking
  const [safOrigin, setSafOrigin] = useState("Nairobi HQ");
  const [safDest, setSafDest] = useState("Mombasa Port");
  const [safCargoType, setSafCargoType] = useState("Cold-Chain / Vaccine Cargo");
  const [safTons, setSafTons] = useState(5);
  const [safContact, setSafContact] = useState({ name: "", email: "", date: "" });

  const safEstCost = () => {
    let multiplier = 120;
    if (safCargoType === "Cold-Chain / Vaccine Cargo") multiplier = 200;
    if (safCargoType === "Bespoke Land Cruiser Safari Tour") multiplier = 350;
    return safTons * multiplier;
  };

  const handleSafarisBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!safContact.name || !safContact.email || !safContact.date) {
      toast.error("Please fill in your contact information and date.");
      return;
    }
    cmsStore.createTicket({
      name: safContact.name,
      email: safContact.email,
      phone: "+254",
      subsidiary: "Tindi Safaris & Logistics",
      channel: "Partnership",
      subject: `Transit Booking: ${safCargoType}`,
      message: `Transit Route: ${safOrigin} to ${safDest}. Shipping ${safTons} tons. Schedule date: ${safContact.date}.`,
    });
    toast.success("Logistal freight slot pre-booked successfully!");
    setSafContact({ name: "", email: "", date: "" });
  };

  // 3. Tindi Eats Reservation
  const [eatsVenue, setEatsVenue] = useState("Tindi Heights Rooftop Diner (Riverside Drive)");
  const [eatsSeats, setEatsSeats] = useState(2);
  const [eatsTime, setEatsTime] = useState("19:00");
  const [eatsContact, setEatsContact] = useState({ name: "", email: "", menuRequests: "" });

  const handleEatsReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eatsContact.name || !eatsContact.email) {
      toast.error("Contact details missing.");
      return;
    }
    cmsStore.createTicket({
      name: eatsContact.name,
      email: eatsContact.email,
      phone: "+254",
      subsidiary: "Tindi Eats",
      channel: "General",
      subject: `Diner Reservation: ${eatsVenue}`,
      message: `Table of ${eatsSeats} at ${eatsTime}. Gourmet requests: ${eatsContact.menuRequests}`,
    });
    toast.success("Dining table successfully placeholder-reserved!");
    setEatsContact({ name: "", email: "", menuRequests: "" });
  };

  // 4. Tindi Apparel Lookbook
  const [appFabric, setAppFabric] = useState("Organic Circular Bamboo Fiber");
  const [appUniformType, setAppUniformType] = useState("Executive Business Blazer");
  const [appQty, setAppQty] = useState(50);
  const [appContact, setAppContact] = useState({ name: "", email: "", brandingLogoUrl: "" });

  const handleApparelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appContact.name || !appContact.email) {
      toast.error("Contact details are mandatory.");
      return;
    }
    cmsStore.createTicket({
      name: appContact.name,
      email: appContact.email,
      phone: "+254",
      subsidiary: "Tindi Apparel",
      channel: "Partnership",
      subject: `Uniform Suite Customization: ${appUniformType}`,
      message: `Fabric Choice: ${appFabric}. Quantity requested: ${appQty}. logo details: ${appContact.brandingLogoUrl || "None provided"}`,
    });
    toast.success("Bespoke custom textile request filed with design room!");
    setAppContact({ name: "", email: "", brandingLogoUrl: "" });
  };

  if (!company) {
    return <div className="text-center py-20 text-muted-foreground">Ecosystem loading…</div>;
  }

  const IconComponent = logoMap[company.logo] || Cpu;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Hero */}
      <section className="bg-muted border-b border-border py-16 md:py-24 relative overflow-hidden">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 flex flex-col items-center text-center relative z-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-primary/10 px-3.5 py-1.5 rounded-full">
            Operating Assets
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 tracking-tighter text-foreground uppercase">
            Our Subsidiary Portfolios
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-4 max-w-2xl leading-relaxed font-medium">
            Click any subsidiary panel below to explore organizational divisions, portfolio
            statistics, landmark projects, and customized corporate booking tools.
          </p>

          {/* Stacking Cards */}
          <CompanyStack companies={companies} />
        </div>
      </section>

      {/* main view */}
      <section className="py-16 mx-auto max-w-screen-2xl px-4 md:px-6 w-full" id={`detail-${company.id}`}>
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left panel: Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                  <IconComponent className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-none">
                    {company.name}
                  </h2>
                  <span className="text-xs text-amber-500 font-bold block mt-2 uppercase tracking-widest">
                    {company.industry}
                  </span>
                </div>
              </div>
              <EntityStatusBadge status="PRE_LAUNCH" size="md" />
            </div>

            {company.statusNote && (
              <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-300">
                📌 <strong>Pre-Launch Operational Note:</strong> {company.statusNote}
              </div>
            )}

            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {company.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {company.statistics.map((st, i) => (
                <div key={i} className="p-4 bg-card border border-border rounded-xl relative overflow-hidden">
                  {st.isTarget && (
                    <div className="absolute top-2 right-2">
                      <MetricBadge classification="TARGET" size="xs" />
                    </div>
                  )}
                  <div className="text-xl font-black text-primary leading-none mt-1">{st.value}</div>
                  <div className="text-[10px] uppercase text-muted-foreground font-semibold mt-1.5 tracking-wider">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Divisions list */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm uppercase text-foreground tracking-widest">
                Organizational Divisions
              </h4>
              <div className="grid sm:grid-cols-2 gap-2">
                {company.divisions.map((div, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2.5 bg-card border border-border rounded-lg text-xs font-semibold"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{div}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Services */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm uppercase text-foreground tracking-widest">
                Signature Solutions Offered
              </h4>
              <div className="space-y-3">
                {company.services.map((svc, i) => (
                  <div key={i} className="p-5 bg-card border border-border rounded-2xl">
                    <h5 className="font-bold text-sm text-primary">{svc.name}</h5>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Landmark Projects gallery */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm uppercase text-foreground tracking-widest">
                Landmark Operational Portfolio
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {company.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="border border-border bg-card rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="h-40 overflow-hidden bg-muted">
                      <img
                        src={proj.image}
                        alt={proj.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h5 className="font-bold text-xs text-foreground uppercase leading-tight">
                        {proj.name}
                      </h5>
                      <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Custom booking engine tool */}
          <div className="lg:col-span-5 self-start sticky top-28 bg-card border border-border p-6 md:p-8 rounded-3xl shadow-xl shadow-black/5">
            {/* Conditional renders based on active tab */}
            {company.id === "comp-tech" && (
              <form onSubmit={handleTechQuoteSubmit} className="space-y-5">
                <div className="border-b pb-4 mb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Automation Calculator
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1 text-foreground dark:text-white">
                    Request Quotation Proposal
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimate operational licensing or hardware setup cost instantly.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Division Category
                  </label>
                  <select
                    value={techSvc}
                    onChange={(e) => setTechSvc(e.target.value)}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Enterprise Software Development">
                      Software & Custom API Architectures
                    </option>
                    <option value="Smart Homes & Automation">Smart Homes & IoT Engineering</option>
                    <option value="Cybersecurity Pen-Testing">
                      Cybersecurity Vulnerability Audit
                    </option>
                    <option value="Biometric Security Panels">
                      Biometric Biologistic Scannings
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Enterprise Operational Scope
                  </label>
                  <select
                    value={techScope}
                    onChange={(e) => setTechScope(e.target.value)}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Small Business (Under 100 personnel)">
                      Small scale / 1 estate wing
                    </option>
                    <option value="Midsize Enterprise">Medium scale / 4 estate blocks</option>
                    <option value="Corporate Conglomerate / High-Scale">
                      Enterprise scale / Unlimited node matrix
                    </option>
                  </select>
                </div>

                <div className="p-4 bg-muted border border-border rounded-xl flex items-center justify-between text-xs font-extrabold uppercase">
                  <span>Estimated Project Cost:</span>
                  <span className="text-sm text-primary font-black font-mono">
                    ${techEstCost().toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name / Representative"
                    value={techContact.name}
                    onChange={(e) => setTechContact({ ...techContact, name: e.target.value })}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Representative Email"
                    value={techContact.email}
                    onChange={(e) => setTechContact({ ...techContact, email: e.target.value })}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <textarea
                    placeholder="List specific custom integration parameters..."
                    rows={3}
                    value={techContact.specs}
                    onChange={(e) => setTechContact({ ...techContact, specs: e.target.value })}
                    className="w-full p-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-bold bg-primary hover:bg-primary/95 text-white text-xs uppercase tracking-wide rounded-lg"
                >
                  Submit Quotation Contract <Send className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            {company.id === "comp-safaris" && (
              <form onSubmit={handleSafarisBook} className="space-y-5">
                <div className="border-b pb-4 mb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Supply Chain & Booking
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1 text-foreground dark:text-white">
                    Freight Schedule Booking
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Book cross-border fleet dispatch slots dynamically.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                      Origin Terminal
                    </label>
                    <select
                      value={safOrigin}
                      onChange={(e) => setSafOrigin(e.target.value)}
                      className="w-full h-9 px-2 border text-xs bg-card focus:outline-none rounded-lg"
                    >
                      <option value="Nairobi HQ">Nairobi Hub</option>
                      <option value="Mombasa Habour">Mombasa Port</option>
                      <option value="Kampala Hub">Kampala Terminal</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                      Destination
                    </label>
                    <select
                      value={safDest}
                      onChange={(e) => setSafDest(e.target.value)}
                      className="w-full h-9 px-2 border text-xs bg-card focus:outline-none rounded-lg"
                    >
                      <option value="Mombasa Port">Mombasa Harbour</option>
                      <option value="Dar es Salaam Terminal">Dar es Salaam</option>
                      <option value="Kigali Transit Hub">Kigali Terminal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Transit Cargo Type
                  </label>
                  <select
                    value={safCargoType}
                    onChange={(e) => setSafCargoType(e.target.value)}
                    className="w-full h-9 px-2 border text-xs bg-card focus:outline-none rounded-lg"
                  >
                    <option value="Cold-Chain / Vaccine Cargo">
                      Cold-Chain logistics / Refrigerated
                    </option>
                    <option value="Standard Heavy Container Freight">
                      Standard Heavy Container freight
                    </option>
                    <option value="Bespoke Land Cruiser Safari Tour">
                      Bespoke luxury safari touring vehicle
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Payload Capacity (Tons / Cruise days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={safTons}
                    onChange={(e) => setSafTons(Number(e.target.value))}
                    className="w-full h-9 px-3 border text-xs bg-card focus:outline-none rounded-lg"
                  />
                </div>

                <div className="p-4 bg-muted border rounded-xl flex justify-between items-center text-xs font-extrabold uppercase">
                  <span>Estimated Shipping Fee:</span>
                  <span className="text-sm text-primary font-black font-mono">
                    ${safEstCost().toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name / Logistics Rep"
                    value={safContact.name}
                    onChange={(e) => setSafContact({ ...safContact, name: e.target.value })}
                    className="w-full h-9 px-3 border text-xs rounded-lg"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Logistics Contact Email"
                    value={safContact.email}
                    onChange={(e) => setSafContact({ ...safContact, email: e.target.value })}
                    className="w-full h-9 px-3 border text-xs rounded-lg"
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase block pl-1">
                      Transit Schedule Date
                    </label>
                    <input
                      type="date"
                      required
                      value={safContact.date}
                      onChange={(e) => setSafContact({ ...safContact, date: e.target.value })}
                      className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-bold bg-primary hover:bg-primary/95 text-white text-xs uppercase tracking-wide rounded-lg"
                >
                  Book Shipping Dispatch Slot <Truck className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            {company.id === "comp-eats" && (
              <form onSubmit={handleEatsReserve} className="space-y-5">
                <div className="border-b border-border pb-4 mb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Culinary Booking Desk
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1 text-foreground">
                    Reserve Dining Venue
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Book fine-dining table or gourmet catering slot instantly.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Restaurant Outlet
                  </label>
                  <select
                    value={eatsVenue}
                    onChange={(e) => setEatsVenue(e.target.value)}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none"
                  >
                    <option value="Tindi Heights Rooftop Diner (Riverside Drive)">
                      Tindi Heights Rooftop Diner (Riverside HQ)
                    </option>
                    <option value="The Savannah Cafe & Lounge (Mombasa branch)">
                      The Savannah Cafe & Lounge (Mombasa Marina)
                    </option>
                    <option value="Tindi cloud-kitchen node #4 Catering">
                      Gourmet Catering Event Space
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                      Seats Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={eatsSeats}
                      onChange={(e) => setEatsSeats(Number(e.target.value))}
                      className="w-full h-9 px-3 border border-border text-xs bg-background text-foreground focus:outline-none rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                      Reservation Time
                    </label>
                    <input
                      type="time"
                      value={eatsTime}
                      onChange={(e) => setEatsTime(e.target.value)}
                      className="w-full h-9 px-3 border border-border text-xs bg-background text-foreground focus:outline-none rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Guest Leader Full Name"
                    value={eatsContact.name}
                    onChange={(e) => setEatsContact({ ...eatsContact, name: e.target.value })}
                    className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Confirmation Email Address"
                    value={eatsContact.email}
                    onChange={(e) => setEatsContact({ ...eatsContact, email: e.target.value })}
                    className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                  />
                  <textarea
                    placeholder="Mention custom allergies, gourmet wine lists, or birthday settings..."
                    rows={3}
                    value={eatsContact.menuRequests}
                    onChange={(e) =>
                      setEatsContact({ ...eatsContact, menuRequests: e.target.value })
                    }
                    className="w-full p-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-bold bg-primary hover:bg-primary/95 text-white text-xs uppercase tracking-wide rounded-lg"
                >
                  Place Dine Reservation <Coffee className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            )}

            {company.id === "comp-apparel" && (
              <form onSubmit={handleApparelOrder} className="space-y-5">
                <div className="border-b border-border pb-4 mb-4">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Sustainable Fashion House
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight mt-1 text-foreground">
                    Custom Apparel Branding
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Design looking-glass suites crafted with bio-circular fibers.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Eco Fabric Selection
                  </label>
                  <select
                    value={appFabric}
                    onChange={(e) => setAppFabric(e.target.value)}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none"
                  >
                    <option value="Organic Circular Bamboo Fiber">
                      Recycled Ocean Polymers & Bamboo loop
                    </option>
                    <option value="Pure Imperial Llama Wool">
                      Pure Fine Italian Merino Thread
                    </option>
                    <option value="High-Performance Synthetic Bio-Weave">
                      Biometric moisture-wicking bio-weave
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Lookbook Garment Design
                  </label>
                  <select
                    value={appUniformType}
                    onChange={(e) => setAppUniformType(e.target.value)}
                    className="w-full h-10 px-3 border border-border text-xs rounded-lg bg-background text-foreground focus:outline-none"
                  >
                    <option value="Executive Business Blazer">
                      Corporate Suited Double-Breasted Blazer
                    </option>
                    <option value="Logistical Weatherproof Uniform">
                      Logistical Breathable Weatherproof Coat
                    </option>
                    <option value="Smart Biometric Athletic Wear">
                      Athletic Smart Biometric Fit Suite
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground tracking-wide">
                    Batch Order Volume (Min 10)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={appQty}
                    onChange={(e) => setAppQty(Number(e.target.value))}
                    className="w-full h-9 px-3 border border-border text-xs bg-background text-foreground focus:outline-none rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Representative Name"
                    value={appContact.name}
                    onChange={(e) => setAppContact({ ...appContact, name: e.target.value })}
                    className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Corporate Email Address"
                    value={appContact.email}
                    onChange={(e) => setAppContact({ ...appContact, email: e.target.value })}
                    className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Branding Logo reference URL (Optional)"
                    value={appContact.brandingLogoUrl}
                    onChange={(e) =>
                      setAppContact({ ...appContact, brandingLogoUrl: e.target.value })
                    }
                    className="w-full h-9 px-3 border border-border text-xs rounded-lg bg-background text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 font-bold bg-primary hover:bg-primary/95 text-white text-xs uppercase tracking-wide rounded-lg"
                >
                  Submit Branding Spec Sheet <Scissors className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Integration shop CTA section */}
      <section className="py-20 bg-muted border-t border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full text-center max-w-3xl">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
            Connect Seamlessly
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-2">
            Ready to Standard-Order Commercial Items?
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Our global unified e-commerce platform links directly with our operating warehouses.
            Browse and purchase active products currently managed by Tindi Apparel and Tindi Tech.
          </p>
          <div className="mt-8">
            <Link to="/shop">
              <Button
                size="lg"
                className="h-12 px-8 font-bold bg-primary hover:bg-primary/95 rounded-xl text-white"
              >
                Open Store Catalog <ArrowRight className="ml-1.5 h-4 w-4" />
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
