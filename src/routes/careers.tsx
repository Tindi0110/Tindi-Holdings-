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
  Clock,
  ArrowRight,
  UploadCloud,
  Search,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers Portal — Joint Tindi Holdings Ltd Conglomerate" },
      {
        name: "description",
        content:
          "Apply for software development, smart apparel styling, eco-logistical shipping fleet and hospitality careers with Tindi Holdings Ltd.",
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

  const subsidiaries = [
    "All",
    "Tindi Tech & Smart Homes",
    "Tindi Apparel",
    "Tindi Safaris & Logistics",
    "Tindi Eats",
  ];
  const jobTypes = ["All", "Full-Time", "Part-Time", "Contract", "Internship"];

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
        `Application for Senior ${activeJob.title} logged safely! Track ID: TND-${Date.now().toString().slice(-4)}`,
      );
      setIsApplyDrawerOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setCover("");
      setResumeName("");
    }
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <CorporateHeader onCartOpen={() => setCartOpen(true)} />

      {/* Banner */}
      <section className="bg-gradient-to-b from-primary/5 via-primary/10 to-background text-foreground py-20 text-center border-b border-border animate-fade-in">
        <div className="mx-auto max-w-4xl px-6">
          <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 border border-border px-3.5 py-1.5 rounded-full">
            Recruitment Ecosystem
          </span>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase mt-4 tracking-tight">
            Work with Tindi Holdings Ltd
          </h1>
          <p className="text-muted-foreground text-sm mt-4 max-w-2xl mx-auto leading-relaxed font-medium">
            Acquire high-performance roles. We groom talent across server architecture software
            engineering, circular fabric design, hospitality cooking, and wildlife dispatch
            networks.
          </p>
        </div>
      </section>

      {/* Grid search filters */}
      <section className="py-12 mx-auto max-w-screen-2xl px-4 md:px-6 w-full flex-1">
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
          </div>

          {/* Right panel job lists */}
          <div className="lg:col-span-9 space-y-6">
            <h2 className="text-xl font-extrabold text-foreground uppercase tracking-wider pl-1 border-l-4 border-conversion">
              Active Corporate Positions ({filteredJobs.length})
            </h2>

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
                      </div>
                      <h3 className="text-lg font-extrabold text-foreground dark:text-white leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary" /> {job.department}
                        </span>
                      </div>
                    </div>

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
                        <Button className="h-10 px-5 text-xs font-bold btn-conversion rounded-lg select-none">
                          Apply Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="overflow-y-auto w-[90vw] md:w-[480px]">
                        <SheetHeader className="pb-4 border-b">
                          <SheetTitle className="text-base font-extrabold uppercase">
                            Apply for Career
                          </SheetTitle>
                          <div className="text-xs text-primary font-bold">
                            {job.title} — {job.subsidiary}
                          </div>
                        </SheetHeader>

                        <form onSubmit={handleApplySubmit} className="mt-6 space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground block">
                              Representative Name
                            </label>
                            <input
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full h-10 px-3 border rounded-lg text-xs"
                              placeholder="Evans Tindi"
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
                              placeholder="candidate@tindigroup.com"
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
                              Simulated Resume Upload (.PDF)
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
                                Drag and drop file here, or click to manually select
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
                                onClick={() => document.getElementById("resume-file-inp")?.click()}
                              >
                                Select Resume File
                              </Button>
                            </div>
                            {resumeName && (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mt-2 pl-1.5">
                                <FileText className="h-4 w-4" /> Selected: {resumeName}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground block font-sans">
                              Simulated Cover Letter
                            </label>
                            <textarea
                              rows={3}
                              value={cover}
                              onChange={(e) => setCover(e.target.value)}
                              className="w-full p-3 border rounded-lg text-xs"
                              placeholder="Briefly pitch why you want to serve in our core subsidiaries..."
                            />
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-11 text-xs uppercase tracking-wide bg-primary hover:bg-primary/95 text-white font-bold select-none"
                          >
                            Submit Online Application File
                          </Button>
                        </form>
                      </SheetContent>
                    </Sheet>
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
                  Are you a junior developer, fashion school grad, or logistics major? Tindi Holdings Ltd
                  runs an annual paid graduate apprentice cohort placing top performers into our
                  active subsidiary wings (Starts Q1 yearly).
                </p>
              </div>
              <div className="md:col-span-4 text-center md:text-right shrink-0">
                <Link to="/contact">
                  <Button
                    size="sm"
                    className="h-10 px-5 font-bold btn-conversion rounded-lg uppercase text-xs tracking-wide"
                  >
                    Reserve Cohort Slot
                  </Button>
                </Link>
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
