import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CorporateHeader } from "@/components/store/CorporateHeader";
import { CorporateFooter } from "@/components/store/CorporateFooter";
import { CartDrawer } from "@/components/store/CartDrawer";
import { cmsStore, JobPosting } from "@/lib/cms-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Briefcase,
  MapPin,
  ArrowRight,
  UploadCloud,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Sparkles,
  Users,
  GraduationCap,
  ChevronRight,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      {
        title:
          "Careers Portal — Tindi Holdings Ltd | Join Our Founding Team (Hiring Q4 2026)",
      },
      {
        name: "description",
        content:
          "Register your interest to join Tindi Holdings Ltd's founding team across Tindi Tech, Tindi Apparel, Tindi Safaris, and Tindi Eats. Full talent acquisition opens Q4 2026.",
      },
      {
        name: "og:title",
        content: "Careers at Tindi Holdings Ltd — Founding Team Recruitment",
      },
      {
        name: "og:description",
        content:
          "We're building a world-class conglomerate launching Q4 2026. Register your interest now and be first in line for software, logistics, hospitality, and fashion roles.",
      },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const jobs = cmsStore.getJobs();

  // Filters
  const [selectedSub, setSelectedSub] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  const [activeJob, setActiveJob] = useState<JobPosting | null>(null);
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);

  // Application Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cover, setCover] = useState("");
  const [resumeName, setResumeName] = useState("");

  // Expression of Interest (pre-launch talent pipeline)
  const [eoiOpen, setEoiOpen] = useState(false);
  const [eoiName, setEoiName] = useState("");
  const [eoiEmail, setEoiEmail] = useState("");
  const [eoiRole, setEoiRole] = useState("Software Engineering");
  const [eoiUnit, setEoiUnit] = useState("Tindi Tech & Smart Homes");
  const [eoiNote, setEoiNote] = useState("");

  const subsidiaries = [
    "All",
    "Tindi Tech & Smart Homes",
    "Tindi Apparel",
    "Tindi Safaris & Logistics",
    "Tindi Eats",
  ];
  const jobTypes = ["All", "Full-Time", "Part-Time", "Contract", "Internship"];

  const eoiDisciplines = [
    "Software Engineering",
    "Hardware & IoT",
    "AI & Machine Learning",
    "Textile & Fashion Design",
    "Supply Chain & Logistics",
    "Hospitality & Culinary",
    "Wildlife & Eco-Tourism",
    "Finance & Accounting",
    "Marketing & Brand",
    "Legal & Compliance",
    "Operations",
    "Other",
  ];

  const filteredJobs = jobs.filter((j) => {
    const matchesSub = selectedSub === "All" || j.subsidiary === selectedSub;
    const matchesType = selectedType === "All" || j.type === selectedType;
    const matchesSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase());
    return matchesSub && matchesType && matchesSearch;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error("Contact parameters are mandatory.");
      return;
    }
    if (!resumeName) {
      toast.error("Please drag/upload a simulated resume file first.");
      return;
    }

    if (activeJob) {
      cmsStore.applyForJob({
        jobId: activeJob.id,
        jobTitle: activeJob.title,
        applicantName: name,
        applicantEmail: email,
        applicantPhone: phone,
        resumeUrl: resumeName,
        coverLetter: cover,
      });

      toast.success(
        `Application for ${activeJob.title} logged! Track ID: TND-${Date.now().toString().slice(-4)}`
      );
      setIsApplyDrawerOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setCover("");
      setResumeName("");
    }
  };

  const handleEoiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eoiName || !eoiEmail) {
      toast.error("Please fill in your name and email.");
      return;
    }
    cmsStore.createTicket({
      name: eoiName,
      email: eoiEmail,
      phone: "+254",
      subsidiary: eoiUnit,
      channel: "Careers",
      subject: `Talent Pipeline EOI: ${eoiRole} @ ${eoiUnit}`,
      message: `Expression of Interest submitted. Role Interest: ${eoiRole}. Operating Unit: ${eoiUnit}. Notes: ${eoiNote || "None provided."}`,
    });
    toast.success(
      `Talent profile registered! You'll be contacted when ${eoiUnit} roles open in Q4 2026.`
    );
    setEoiOpen(false);
    setEoiName("");
    setEoiEmail("");
    setEoiNote("");
  };

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeName(file.name);
      toast.info(`Simulated upload successful: ${file.name} accepted.`);
    }
  };

  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setResumeName(file.name);
      toast.info(`Simulated drop capture active: ${file.name}`);
    }
  };

  // Why join us
  const perks = [
    {
      icon: Sparkles,
      title: "Build From Day One",
      desc: "Join a founding team and directly shape the systems, culture, and strategy of East Africa's next great conglomerate.",
    },
    {
      icon: Star,
      title: "Multi-Division Exposure",
      desc: "Operate across four subsidiaries — tech, fashion, logistics, and food — gaining cross-industry leadership experience.",
    },
    {
      icon: Users,
      title: "Equity-Linked Compensation",
      desc: "Top early employees receive performance-linked equity stakes in addition to competitive market salaries.",
    },
    {
      icon: GraduationCap,
      title: "Graduate Pipeline",
      desc: "Annual paid apprentice cohorts for junior developers, fashion grads, logistics majors, and culinary talent.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* PRE-LAUNCH HIRING NOTICE */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 py-3 px-4">
        <div className="mx-auto max-w-screen-2xl flex items-start md:items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 md:mt-0" />
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            <span className="font-black uppercase tracking-wide">
              Pre-Launch Talent Acquisition:
            </span>{" "}
            Tindi Holdings Ltd launches formally in{" "}
            <strong>Q4 2026</strong>. Active job postings below represent roles
            we are pre-screening candidates for. Full hiring commences upon
            operational launch.{" "}
            <button
              onClick={() => setEoiOpen(true)}
              className="underline font-bold text-amber-600 dark:text-amber-300 hover:text-amber-700"
            >
              Register your interest now →
            </button>
          </p>
        </div>
      </div>

      {/* Banner */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/10 to-background text-foreground py-20 text-center border-b border-border animate-fade-in">
        <div className="mx-auto max-w-4xl px-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-border px-3.5 py-1.5 rounded-full">
            <Bell className="h-3 w-3" /> Founding Team Recruitment
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Work with Tindi Holdings Ltd
          </h1>
          <p className="text-muted-foreground text-sm mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            We're building four industry-defining subsidiaries launching Q4
            2026. Join our founding team across server architecture, circular
            fabric design, hospitality, and wildlife logistics.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={() => setEoiOpen(true)}
              className="h-11 px-6 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-lg uppercase tracking-wide"
            >
              Register Interest <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
            <a href="#jobs">
              <Button
                variant="outline"
                className="h-11 px-6 text-xs font-bold rounded-lg uppercase tracking-wide"
              >
                Browse Roles
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16 bg-muted border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 w-full">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Why Tindi Holdings Ltd?
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1">
              A Once-in-a-Generation Founding Opportunity
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <div
                  key={i}
                  className="p-6 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-foreground mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {perk.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid search filters + Job Listings */}
      <section id="jobs" className="py-12 mx-auto max-w-screen-2xl px-4 md:px-6 w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left panel filters */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                role="searchbox"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-card border border-border text-sm"
                placeholder="Search job titles..."
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-widest pl-1">
                Operating Unit
              </h4>
              <div className="flex flex-col gap-1.5">
                {subsidiaries.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSub(sub)}
                    className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg transition-all ${
                      selectedSub === sub
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground/80"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-widest pl-1">
                Contract Type
              </h4>
              <div className="flex flex-col gap-1.5">
                {jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`text-left text-xs font-bold px-3 py-2.5 rounded-lg transition-all ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground/80"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Talent Pipeline CTA in sidebar */}
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest block">
                Don't see your role?
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Register for our Talent Pipeline to be notified when your
                ideal position opens in Q4 2026.
              </p>
              <Button
                size="sm"
                onClick={() => setEoiOpen(true)}
                className="w-full h-8 text-[10px] font-bold btn-conversion uppercase tracking-wide mt-1"
              >
                Join Pipeline
              </Button>
            </div>
          </div>

          {/* Right panel job lists */}
          <div className="lg:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-foreground uppercase tracking-wider pl-1 border-l-4 border-conversion">
                Pre-Screened Positions ({filteredJobs.length})
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                Hiring Q4 2026
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-2xl text-muted-foreground">
                No active vacancies fit listing filters. Check again later.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-6 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          {job.subsidiary}
                        </span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          {job.type}
                        </span>
                        <span className="text-[10px] bg-sky-500/10 text-sky-500 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Pre-Screening Open
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground dark:text-white leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />{" "}
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />{" "}
                          {job.department}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEoiOpen(true)}
                        className="h-9 px-4 text-xs font-bold border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 rounded-lg"
                      >
                        Express Interest
                      </Button>

                      <Sheet
                        open={isApplyDrawerOpen && activeJob?.id === job.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setActiveJob(job);
                            setIsApplyDrawerOpen(true);
                          } else {
                            setIsApplyDrawerOpen(false);
                          }
                        }}
                      >
                        <SheetTrigger asChild>
                          <Button className="h-9 px-4 text-xs font-bold btn-conversion rounded-lg select-none">
                            Pre-Apply <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="overflow-y-auto w-[90vw] md:w-[480px]">
                          <SheetHeader className="pb-4 border-b">
                            <SheetTitle className="text-base font-extrabold uppercase">
                              Pre-Application
                            </SheetTitle>
                            <div className="text-xs text-primary font-bold">
                              {job.title} — {job.subsidiary}
                            </div>
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5 mt-1 font-medium">
                              You are submitting a pre-application. Formal hiring
                              begins Q4 2026. Shortlisted candidates will be
                              contacted before launch.
                            </p>
                          </SheetHeader>

                          <form onSubmit={handleApplySubmit} className="mt-6 space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                                Full Name
                              </label>
                              <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-10 px-3 border rounded-lg text-xs"
                                placeholder="Evans Njenga"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                                Email Address
                              </label>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-10 px-3 border rounded-lg text-xs"
                                placeholder="candidate@email.com"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                                Contact Phone Number
                              </label>
                              <input
                                type="text"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full h-10 px-3 border rounded-lg text-xs"
                                placeholder="+254 700 110000"
                              />
                            </div>

                            {/* Requirements detail review */}
                            <div className="p-4 bg-muted rounded-xl space-y-1.5 border">
                              <h5 className="text-[10px] font-bold uppercase text-primary tracking-wide">
                                Key Role Requirements:
                              </h5>
                              <ul className="space-y-1">
                                {job.requirements.map((req, i) => (
                                  <li
                                    key={i}
                                    className="flex gap-2 text-[11px] text-muted-foreground font-semibold leading-relaxed"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{req}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* File drag-drop input simulated */}
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                                Resume Upload (.PDF, .DOCX)
                              </label>
                              <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-5 text-center transition-colors cursor-pointer ${
                                  dragOver
                                    ? "border-amber-400 bg-amber-400/5"
                                    : "border-border hover:border-primary/40"
                                }`}
                              >
                                <UploadCloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <div className="text-xs font-bold block mb-1">
                                  Drag and drop file here, or click to select
                                </div>
                                <span className="text-[10px] text-muted-foreground block">
                                  Accepts PDF, DOCX up to 4MB
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  onChange={handleSimulatedUpload}
                                  className="hidden"
                                  id="resume-file-inp"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 text-[10px] font-bold border-stone-300 dark:border-stone-700 h-8"
                                  onClick={() =>
                                    document
                                      .getElementById("resume-file-inp")
                                      ?.click()
                                  }
                                >
                                  Select Resume File
                                </Button>
                              </div>
                              {resumeName && (
                                <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-2 pl-1.5">
                                  <FileText className="h-4 w-4" /> Selected:{" "}
                                  {resumeName}
                                </div>
                              )}
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-muted-foreground block font-sans">
                                Cover Note (Optional)
                              </label>
                              <textarea
                                rows={3}
                                value={cover}
                                onChange={(e) => setCover(e.target.value)}
                                className="w-full p-3 border rounded-lg text-xs"
                                placeholder="Why you want to join Tindi Holdings Ltd's founding team..."
                              />
                            </div>

                            <Button
                              type="submit"
                              className="w-full h-11 text-xs uppercase tracking-wide bg-primary hover:bg-primary/95 text-white font-bold select-none"
                            >
                              Submit Pre-Application
                            </Button>
                          </form>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Graduate & interns banner */}
            <div className="p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 grid md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block font-sans">
                  Graduate Pipeline
                </span>
                <h3 className="text-xl font-extrabold text-foreground dark:text-white leading-none">
                  Graduate & Intern Incubation Programs
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  Junior developer, fashion school grad, or logistics major?
                  Tindi Holdings Ltd runs an annual paid graduate apprentice
                  cohort placing top performers into our active subsidiary wings.
                  First cohort begins Q1 2027.
                </p>
              </div>
              <div className="md:col-span-4 text-center md:text-right shrink-0">
                <Button
                  size="sm"
                  onClick={() => setEoiOpen(true)}
                  className="h-10 px-5 font-bold btn-conversion rounded-lg uppercase text-xs tracking-wide"
                >
                  Reserve Cohort Slot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expression of Interest Sheet */}
      <Sheet open={eoiOpen} onOpenChange={setEoiOpen}>
        <SheetContent className="overflow-y-auto w-[90vw] md:w-[480px]">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-base font-extrabold uppercase">
              Join the Talent Pipeline
            </SheetTitle>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Register your expression of interest. We'll match your profile to
              relevant roles and contact you when hiring opens in Q4 2026.
            </p>
          </SheetHeader>

          <form onSubmit={handleEoiSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                Full Name
              </label>
              <input
                type="text"
                required
                value={eoiName}
                onChange={(e) => setEoiName(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg text-xs"
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                Email Address
              </label>
              <input
                type="email"
                required
                value={eoiEmail}
                onChange={(e) => setEoiEmail(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg text-xs"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                Preferred Operating Unit
              </label>
              <select
                value={eoiUnit}
                onChange={(e) => setEoiUnit(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg text-xs bg-background text-foreground"
              >
                {subsidiaries.filter((s) => s !== "All").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                Discipline / Role Area
              </label>
              <select
                value={eoiRole}
                onChange={(e) => setEoiRole(e.target.value)}
                className="w-full h-10 px-3 border rounded-lg text-xs bg-background text-foreground"
              >
                {eoiDisciplines.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                Brief Introduction (Optional)
              </label>
              <textarea
                rows={3}
                value={eoiNote}
                onChange={(e) => setEoiNote(e.target.value)}
                className="w-full p-3 border rounded-lg text-xs"
                placeholder="Share your background and why you want to join our founding team..."
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-xs uppercase tracking-wide bg-primary hover:bg-primary/95 text-white font-bold"
            >
              Register for Talent Pipeline
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Your details are stored securely and only used for Tindi Holdings
              Ltd recruitment communications.
            </p>
          </form>
        </SheetContent>
      </Sheet>

      <CorporateFooter />
      <CartDrawer open={cartOpen} onOpenChange={(v) => setCartOpen(v)} />
    </div>
  );
}
