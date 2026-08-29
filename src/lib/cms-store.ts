import { supabase } from "@/integrations/supabase/client";

export interface CorporateCompany {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  industry: string;
  status: "active" | "future";
  divisions: string[];
  services: { name: string; description: string }[];
  projects: { id: string; name: string; description: string; image: string }[];
  statistics: { label: string; value: string }[];
  contactEmail: string;
  contactPhone: string;
}

export interface IndustryOverview {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  solutions: string[];
  projectsCount: number;
  growthOpportunity: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: "Press Release" | "Announcement" | "Media Coverage" | "Corporate News" | "Innovation";
  image: string;
  publishedAt: string;
  author: string;
  tags: string[];
  readTime: string;
}

export interface JobPosting {
  id: string;
  title: string;
  subsidiary: string;
  department: string;
  location: string;
  type: "Full-Time" | "Part-Time" | "Contract" | "Internship";
  description: string;
  requirements: string[];
  responsibilities: string[];
  salaryRange?: string;
  postedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  resumeUrl?: string; // local simulation URL/base64
  coverLetter?: string;
  status: "Pending" | "Reviewed" | "Shortlisted" | "Rejected";
  appliedAt: string;
}

export interface SupportMessage {
  id: string;
  sender: "customer" | "admin";
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone: string;
  subsidiary: string;
  channel: "General" | "Support" | "Partnership" | "Investment" | "Media" | "Careers";
  subject: string;
  message: string;
  status: "Open" | "In_Progress" | "Resolved";
  createdAt: string;
  messages: SupportMessage[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface CorporateTestimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image?: string;
  type: "Customer" | "Partner" | "Investor";
}

export interface PartnerLogo {
  id: string;
  name: string;
  logoUrl: string;
}

export interface InvestorReport {
  id: string;
  title: string;
  type: "Quarterly" | "Annual" | "Presentation" | "Governance";
  url: string;
  publishedAt: string;
  fileSize: string;
}

// Pre-loaded stunning actual Tindi Holdings Ltd subsidiaries
const INITIAL_COMPANIES: CorporateCompany[] = [
  {
    id: "comp-tech",
    name: "Tindi Tech & Smart Homes",
    slug: "tindi-tech-smart-homes",
    logo: "Cpu",
    description:
      "Tindi Tech & Smart Homes pioneers digital innovation, secure cloud architecture, and cutting-edge home automation ecosystems to elevate modern living and streamline corporate operations.",
    industry: "Information Technology & IoT Hardware",
    status: "active",
    divisions: [
      "Software Development",
      "Web Development",
      "Mobile Applications",
      "Cloud Solutions",
      "Cybersecurity",
      "Electronics",
      "IoT",
      "Smart Homes",
      "Automation",
      "Smart Appliances",
    ],
    services: [
      {
        name: "Enterprise Systems",
        description: "Design and integration of custom ERP and operations workflow platforms.",
      },
      {
        name: "Architectural Home Automation",
        description:
          "Centrally managed lighting, HVAC, multi-room audio, and biometric security systems.",
      },
      {
        name: "Threat Vector Auditing",
        description:
          "Military-grade penetration testing and cyber security infrastructure hardening.",
      },
    ],
    projects: [
      {
        id: "p-tech-1",
        name: "The Emerald Intelligent Estate",
        description:
          "Fully integrated IoT controls for a 120-villa green residency matching ESG frameworks.",
        image:
          "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "p-tech-2",
        name: "Safeguard Cloud Vault",
        description:
          "Constructed secure, high-availability AWS transit hubs for regional micro-finance banks.",
        image:
          "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600",
      },
    ],
    statistics: [
      { label: "Active Connections", value: "45,000+" },
      { label: "Smart Residences Completed", value: "320+" },
      { label: "SLA Uptime", value: "99.99%" },
    ],
    contactEmail: "tech@tindigroup.com",
    contactPhone: "+254 700 110000",
  },
  {
    id: "comp-safaris",
    name: "Tindi Safaris & Logistics",
    slug: "tindi-safaris-logistics",
    logo: "Compass",
    description:
      "Providing world-class multi-modal corporate logistics, cross-border shipping networks, fleet leasing management, and unforgettable luxury safari operations across East Africa.",
    industry: "Transportation, Supply Chain & Luxury Tourism",
    status: "active",
    divisions: [
      "Passenger Transport",
      "Cargo Logistics",
      "Corporate Travel",
      "Fleet Leasing",
      "Tour Services",
      "Cross-Border Logistics",
      "Tracking Solutions",
      "Booking System",
      "Fleet Showcase",
      "Route Information",
      "Cargo Services",
    ],
    services: [
      {
        name: "Cold-Chain Supply Assets",
        description:
          "Sub-zero climate-controlled reefer fleet for vaccine and agricultural exports.",
      },
      {
        name: "Executive Corporate Travel",
        description: "Flexible direct airport-to-boardroom secure fleet passenger dispatch.",
      },
      {
        name: "Curated Luxury Expeditions",
        description: "Bespoke wild safari tours in high-grade customized terrestrial cruisers.",
      },
    ],
    projects: [
      {
        id: "p-saf-1",
        name: "East-Africa Expressway Hub",
        description: "Orchestrated seamless freight supply corridors across 3 national borders.",
        image:
          "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "p-saf-2",
        name: "Serengeti Oasis Safaris",
        description:
          "Launched a zero-emissions electric conversion fleet for nature preservation tours.",
        image:
          "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600",
      },
    ],
    statistics: [
      { label: "Fleet Vehicles", value: "180+" },
      { label: "Metric Tons Shipped", value: "2.4M" },
      { label: "Five-Star Safari Reviews", value: "98.7%" },
    ],
    contactEmail: "safaris@tindigroup.com",
    contactPhone: "+254 700 220000",
  },
  {
    id: "comp-eats",
    name: "Tindi Eats",
    slug: "tindi-eats",
    logo: "Utensils",
    description:
      "Tindi Eats curates high-end culinary experiences, operate modern dining venues, dynamic catering events, and leverages technology to pioneer swift cloud-kitchen networks.",
    industry: "Hospitality & Food Services Technology",
    status: "active",
    divisions: ["Hotels", "Restaurants", "Clubs", "Food Delivery", "Catering", "Events"],
    services: [
      {
        name: "Culinary Venues",
        description:
          "Award-winning fine-dining spots combining local spices with French gastronomical science.",
      },
      {
        name: "Next-Gen Cloud Kitchens",
        description:
          "Hyper-efficient production nodes satisfying localized high-demand app custom cuisines.",
      },
      {
        name: "Executive Catering & Events",
        description: "Michelin-caliber culinary setup for international summits and grand galas.",
      },
    ],
    projects: [
      {
        id: "p-eats-1",
        name: "The Tindi Heights Restaurant",
        description: "Designed an interactive rooftop restaurant featuring sensory projections.",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "p-eats-2",
        name: "Eco-Kitchens Nairobi",
        description: "Commissioned green-energy cloud kitchens optimized for 8-minute dispatch.",
        image:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600",
      },
    ],
    statistics: [
      { label: "Annual Plates Served", value: "1.2M+" },
      { label: "Micro-Kitchen Nodes", value: "14" },
      { label: "Corporate Contracts", value: "85" },
    ],
    contactEmail: "eats@tindigroup.com",
    contactPhone: "+254 700 330000",
  },
  {
    id: "comp-apparel",
    name: "Tindi Apparel",
    slug: "tindi-apparel",
    logo: "Shirt",
    description:
      "Designing high-performance sustainable fibers, bespoke apparel collections, and custom corporate branding. Blending technology with style.",
    industry: "Premium Fashion Design & Sustainable Apparel",
    status: "active",
    divisions: [
      "Men's Fashion",
      "Women's Fashion",
      "Corporate Wear",
      "Footwear",
      "Accessories",
      "Custom Branding",
    ],
    services: [
      {
        name: "Bespoke Haute Couture",
        description: "Fine Italian wool custom suiting of elite executive fitment.",
      },
      {
        name: "Corporate Uniform Engineering",
        description:
          "Moisture-wicking, bio-safe materials built beautifully for transport and medical personnel.",
      },
      {
        name: "Circular Fiber Loop",
        description:
          "Textiles manufactured purely from recycled marine plastics and bamboo threads.",
      },
    ],
    projects: [
      {
        id: "p-app-1",
        name: "Ascent Activewear",
        description: "Unveiled athletic sportswear featuring embedded smart biometric fibers.",
        image:
          "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600",
      },
      {
        id: "p-app-2",
        name: "The Horizon Runway Series",
        description:
          "A high-fashion luxury collection shown globally in Paris in partnership with Tindi Safaris.",
        image:
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=600",
      },
    ],
    statistics: [
      { label: "Designs Created", value: "2,500+" },
      { label: "Sustainable Fabrics", value: "88%" },
      { label: "Retail Touchpoints", value: "48" },
    ],
    contactEmail: "apparel@tindigroup.com",
    contactPhone: "+254 700 440000",
  },
];

// Preloaded Future Expansion Strategic Interests
const FUTURE_VENTURES = [
  {
    id: "fv-energy",
    name: "Tindi Energy",
    description:
      "Grid-scale solar storage, hydrogen systems, and green power lines to electrify clean transport logistics.",
  },
  {
    id: "fv-finance",
    name: "Tindi Finance",
    description:
      "Empowering regional commerce with fintech assets, micro-loans, and digital wallet services.",
  },
  {
    id: "fv-realestate",
    name: "Tindi Real Estate",
    description:
      "Zero-emission smart skyscrapers, co-living smart nodes, and tech-driven corporate towers.",
  },
  {
    id: "fv-health",
    name: "Tindi Health",
    description:
      "Telehealth solutions, remote monitoring wearables, and smart clinical appliances.",
  },
  {
    id: "fv-education",
    name: "Tindi Education",
    description:
      "AI-personalized classrooms, virtual training labs, and remote developer academies.",
  },
  {
    id: "fv-agriculture",
    name: "Tindi Agriculture",
    description:
      "Precision IoT farming drones, automated vertical hydroponic modules, and localized logistics.",
  },
  {
    id: "fv-ai",
    name: "Tindi AI",
    description:
      "Large Language Models for sovereign operations, computer vision for safaris, and enterprise agent automations.",
  },
  {
    id: "fv-ventures",
    name: "Tindi Ventures",
    description: "Early-stage incubation, funding and accelerator networks for tech-disruptors.",
  },
];

// Preloaded detailed news articles
const INITIAL_NEWS: NewsArticle[] = [
  {
    id: "news-1",
    title: "Tindi Holdings Ltd Unveils $50M Sovereign AI & High-Performance Compute Facility",
    slug: "tindi-unveils-sovereign-ai-compute-facility",
    summary:
      "Introducing regional computing clusters equipped with high-performance hardware and custom models tailored for the East-African agricultural, tourism, and financial services sectors.",
    content: `## A Sovereign Future Powered by Tindi Holdings Ltd

Tindi Holdings Ltd, parent company of pioneering subsidiaries in technology, smart homes, and logistics, today announced a major corporate commitment to establishing the continent's premiere High-Performance Computing (HPC) facility. Supported by capital investment and public-private agreements, this infrastructure project is designed to eliminate reliance on external host servers, guaranteeing absolute domestic server speed, local data sovereignty, and robust multi-agent automation.

CEO Evans Njenga Matindi outlined the vision:
> "Sovereignty is not simply political—it is digital. Our compute clusters will empower Tindi Tech, Tindi Safaris, and other regional operators to optimize real-time route optimization, biometric safety systems, and culinary delivery patterns using locally tuned intelligence."

Applications of the Cluster:
* **Route Efficiency**: Tindi Safaris cargo networks will use AI models to run dynamic, fuel-saving logistical plans.
* **Smart Homes**: Multi-building estates will utilize low-latency computer vision and biometric protection.
* **Emerging Startups**: Part of the computing cluster will be dedicated to incubated entities under Tindi Ventures.`,
    category: "Press Release",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600",
    publishedAt: "2026-06-10",
    author: "Tindi Holdings Ltd Media Office",
    tags: ["Artificial Intelligence", "Compute", "Corporate Growth", "Technology"],
    readTime: "4 min read",
  },
  {
    id: "news-2",
    title: "Tindi Safaris Electrifies Tour Fleet in Drive to Net-Zero Wilderness Travel",
    slug: "tindi-safaris-electrifies-tour-fleet",
    summary:
      "By converting land cruiser expedition assets to advanced battery-electric powertrains, Tindi Safaris introduces completely silent, pollution-free viewing experiences in regional parks.",
    content:
      "## Quiet Exploration: The First Sustainable Safari Cruiser\n\nIn partnership with Tindi Energy and leading battery-electric engineers, Tindi Safaris & Logistics has completed test runs of its prototype fully electric luxury safari cruisers. Equipped with massive battery banks and robust dual-motor powertrains, these luxury cruisers capture completely silent exploration. This allows guests to approach wildlife without disrupting natural ecosystems with exhaust fumes and combustion engine vibrations.",
    category: "Innovation",
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=600",
    publishedAt: "2026-06-02",
    author: "Conservation & ESG Dept",
    tags: ["Electric Vehicles", "Sustainability", "Hospitality", "Eco-Tourism"],
    readTime: "3 min read",
  },
  {
    id: "news-3",
    title:
      "Tindi Eats Partners with Local Organic Cooperatives to Form Sustainable Catering Networks",
    slug: "tindi-eats-organic-sustainable-catering",
    summary:
      "Strengthening local agricultural value chains, Tindi Eats signs direct trade supply agreements with 40 farmers, guaranteeing farm-to-table traceability inside Tindi Heights projects.",
    content:
      "## Rooted in Sustainability\n\nTindi Eats has reinforced its dedication to ethical luxury by building a certified supply ledger that pairs urban dining venues with certified organic agricultural collectives. Inside our signature Tindi Heights restaurant, customers will have direct digital transparency to the exact cooperative who farmed their meal, reducing logistics energy and promoting healthy rural economies.",
    category: "Corporate News",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=600",
    publishedAt: "2026-05-18",
    author: "Eats Culinary Council",
    tags: ["Agriculture", "Sustainability", "Culinary Excellence", "Hospitality"],
    readTime: "5 min read",
  },
];

// Preloaded career recruitment listings
const INITIAL_JOBS: JobPosting[] = [
  {
    id: "job-1",
    title: "Senior Full-Stack Architect (Sovereign Cloud)",
    subsidiary: "Tindi Tech & Smart Homes",
    department: "Enterprise Software Division",
    location: "Nairobi, GHQ (With Hybrid Options)",
    type: "Full-Time",
    description:
      "We are seeking a master developer to spearhead the core cloud systems and smart home API nodes for our intelligent estate projects. You will integrate hardware telemetry loops into React-based administrator interfaces.",
    requirements: [
      "7+ years experience with high-concurrent system design (React, Node, Go, Rust, or Python).",
      "Robust knowledge of IoT integration standards (MQTT, WebSockets, Modbus) and edge compute platforms.",
      "Hands-on experience with modern cloud clusters and secure databases (Supabase, PostgreSQL).",
    ],
    responsibilities: [
      "Construct robust, high-availability server APIs to support 150,000+ active smart-home appliances.",
      "Lead and mentor a fast-growing engineering team across 4 offices.",
      "Collaborate directly with estate architects to design custom biosecurity software overlays.",
    ],
    salaryRange: "$95k - $125k (Equity eligible)",
    postedAt: "2026-06-12",
  },
  {
    id: "job-2",
    title: "Sustainable Textile Designer",
    subsidiary: "Tindi Apparel",
    department: "Fashion Innovation Lab",
    location: "Nairobi R&D Center",
    type: "Full-Time",
    description:
      "Lead Tindi Apparel's circular textile design initiatives. You will work with sustainable organic linen, bamboo, and recycled ocean polymer chains to manufacture corporate suiting that is functional, light, and gorgeous.",
    requirements: [
      "Degree in Textile Sciences, Fashion Design, or materials engineering.",
      "Expert knowledge of sustainable dye programs and bio-degradable polymer matrices.",
      "Demonstrated design portfolio featuring commercial circular garments.",
    ],
    responsibilities: [
      "Formulate custom eco-friendly blend specs for Tindi and global corporate uniform accounts.",
      "Direct the digital collection lookbook workflow and coordinate with local supply factories.",
      "Run life-cycle ESG analysis on all fabric components.",
    ],
    postedAt: "2026-06-14",
  },
  {
    id: "job-3",
    title: "Tour Fleet Lead & Electric Vehicle Specialist",
    subsidiary: "Tindi Safaris & Logistics",
    department: "Cruiser Operations",
    location: "Mombasa Hub",
    type: "Contract",
    description:
      "Empower our wildlife logistics by superintending our hybrid/electric conversions, heavy cargo tracking hubs, and luxury safari assets.",
    requirements: [
      "Senior qualification in automotive electrical systems or mechanical diagnostics.",
      "Comfort with multi-vehicle logistics management, IoT telemetry tracking, and dispatch dashboards.",
    ],
    responsibilities: [
      "Supervise daily safety status and battery balances of solar safari cruisers.",
      "Program predictive telemetry rules for wild cross-border dispatch paths.",
    ],
    postedAt: "2026-06-15",
  },
];

const INITIAL_TESTIMONIALS: CorporateTestimonial[] = [
  {
    id: "t-1",
    name: "Dr. Richard Amadi",
    role: "Senior Investment Partner",
    company: "Delta Frontier Ventures",
    content:
      "Tindi Holdings Ltd represents the next frontier of diversified technological holdings. By centralizing strategic operations under one capital group while running highly agile, sector-relevant subsidiaries, Tindi maximizes investor value while executing tangible sustainable growth.",
    type: "Investor",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
  },
  {
    id: "t-2",
    name: "Celine Gauthier",
    role: "Global Chief of Lodging Services",
    company: "Horizon Travel International",
    content:
      "The cohesion between Tindi Safaris and Tindi Tech is a hospitality revolution. Our guests unlock their custom bush villas using secure, biometric applications designed by Tindi Tech, then enjoy clean, completely silent transit on electric cruisers.",
    type: "Partner",
  },
  {
    id: "t-3",
    name: "Ephraim Kipkoech",
    role: "Estate Chief Executive",
    company: "Lavington Smart Residency",
    content:
      "We outfitted our entire estate with Tindi Tech smart panels. Not only did our operational energy waste decrease by 32%, but customer satisfaction scores skyrocketed. The support services are unparalleled.",
    type: "Customer",
  },
];

const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How does Tindi Holdings Ltd support multiple subsidiaries without service conflicts?",
    answer:
      "Tindi Holdings Ltd acts as a centralized holding company. We provide shared corporate resources—including unified capital backing, cutting-edge software development from Tindi Tech, legal counseling, ESG compliance, and public brand marketing—enabling individual subsidiaries to run independently and focus fully on customer satisfaction.",
    category: "Corporate Structure",
  },
  {
    id: "faq-2",
    question: "Can I invest directly in a single subsidiary like Tindi Safaris?",
    answer:
      "Currently, investment opportunities are centralized via Tindi Holdings Ltd. This spreads investor risk while giving full capital appreciation across all operating sectors, including tech, transportation, hospitality, apparel, and emerging clean energy ventures.",
    category: "Investors",
  },
  {
    id: "faq-3",
    question: "Are your sustainable fabrics commercially available for global manufacturers?",
    answer:
      "Yes, Tindi Apparel supports custom textile contracts, design lookbooks, and high-tech bio-garment production for global boutique brands as well as massive corporate uniform requirements.",
    category: "Tindi Apparel",
  },
];

const INITIAL_REPORTS: InvestorReport[] = [
  {
    id: "r-1",
    title: "Tindi Holdings Ltd 2025 Annual Financial Report (Verified)",
    type: "Annual",
    url: "#",
    publishedAt: "2026-01-15",
    fileSize: "4.8 MB",
  },
  {
    id: "r-2",
    title: "Q1 2026 Earnings Release & Corporate Roadmap",
    type: "Quarterly",
    url: "#",
    publishedAt: "2026-04-10",
    fileSize: "2.4 MB",
  },
  {
    id: "r-3",
    title: "Circular Economy & ESG Compliance Impact Deck",
    type: "Governance",
    url: "#",
    publishedAt: "2026-03-05",
    fileSize: "3.1 MB",
  },
];

// LocalStorage key managers
const KEY__COMPANIES = "tindi_companies";
const KEY__NEWS = "tindi_news";
const KEY__JOBS = "tindi_jobs";
const KEY__APPLICATIONS = "tindi_applications";
const KEY__TICKETS = "tindi_tickets";
const KEY__FAQS = "tindi_faqs";
const KEY__TESTIMONIALS = "tindi_testimonials";
const KEY__REPORTS = "tindi_reports";

// Initialize store in a browser-safe container
function getStored<T>(key: string, initial: T): T {
  if (typeof window === "undefined") return initial;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, data: T) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export const cmsStore = {
  getCompanies: (): CorporateCompany[] => getStored(KEY__COMPANIES, INITIAL_COMPANIES),
  saveCompany: (comp: CorporateCompany) => {
    const list = cmsStore.getCompanies();
    const idx = list.findIndex((c) => c.id === comp.id);
    if (idx >= 0) list[idx] = comp;
    else list.push(comp);
    setStored(KEY__COMPANIES, list);
  },
  deleteCompany: (id: string) => {
    const list = cmsStore.getCompanies().filter((c) => c.id !== id);
    setStored(KEY__COMPANIES, list);
  },

  getFutureVentures: () => FUTURE_VENTURES,

  getNews: (): NewsArticle[] => getStored(KEY__NEWS, INITIAL_NEWS),
  saveNews: (post: NewsArticle) => {
    const list = cmsStore.getNews();
    const idx = list.findIndex((p) => p.id === post.id);
    if (idx >= 0) list[idx] = post;
    else list.push(post);
    setStored(KEY__NEWS, list);
  },
  deleteNews: (id: string) => {
    const list = cmsStore.getNews().filter((p) => p.id !== id);
    setStored(KEY__NEWS, list);
  },

  getJobs: (): JobPosting[] => getStored(KEY__JOBS, INITIAL_JOBS),
  saveJob: (job: JobPosting) => {
    const list = cmsStore.getJobs();
    const idx = list.findIndex((j) => j.id === job.id);
    if (idx >= 0) list[idx] = job;
    else list.push(job);
    setStored(KEY__JOBS, list);
  },
  deleteJob: (id: string) => {
    const list = cmsStore.getJobs().filter((j) => j.id !== id);
    setStored(KEY__JOBS, list);
  },

  getApplications: (): JobApplication[] => getStored(KEY__APPLICATIONS, []),
  applyForJob: (app: Omit<JobApplication, "id" | "status" | "appliedAt">) => {
    const list = cmsStore.getApplications();
    const fullApp: JobApplication = {
      ...app,
      id: "app-" + Date.now() + Math.random().toString(36).substr(2, 4),
      status: "Pending",
      appliedAt: new Date().toISOString().split("T")[0],
    };
    list.push(fullApp);
    setStored(KEY__APPLICATIONS, list);
    return fullApp;
  },
  updateApplicationStatus: (id: string, status: JobApplication["status"]) => {
    const list = cmsStore.getApplications();
    const item = list.find((a) => a.id === id);
    if (item) {
      item.status = status;
      setStored(KEY__APPLICATIONS, list);
    }
  },

  getTickets: (): SupportTicket[] => getStored(KEY__TICKETS, []),
  getTicketsByEmail: (email: string): SupportTicket[] => {
    return cmsStore.getTickets().filter((t) => t.email === email);
  },
  createTicket: async (payload: Omit<SupportTicket, "id" | "status" | "createdAt" | "messages">) => {
    try {
      const { data: ticket, error } = await supabase
        .from("support_tickets")
        .insert({
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          subsidiary: payload.subsidiary,
          channel: payload.channel,
          subject: payload.subject,
          message: payload.message,
          status: "Open"
        })
        .select()
        .single();

      if (error) throw error;

      if (ticket) {
        await supabase.from("support_messages").insert({
          ticket_id: ticket.id,
          sender: "customer",
          message: payload.message
        });
      }
      return ticket;
    } catch (err) {
      console.error("Failed to create ticket in DB:", err);
      // Fallback to local storage if DB is unreachable (graceful failure)
      const list = cmsStore.getTickets();
      const ticket: SupportTicket = {
        ...payload,
        id: "ticket-" + Date.now(),
        status: "Open",
        createdAt: new Date().toLocaleString(),
        messages: [
          {
            id: "msg-" + Date.now(),
            sender: "customer",
            message: payload.message,
            createdAt: new Date().toLocaleString(),
          },
        ],
      };
      list.push(ticket);
      setStored(KEY__TICKETS, list);
      return ticket;
    }
  },
  updateTicketStatus: (id: string, status: SupportTicket["status"]) => {
    const list = cmsStore.getTickets();
    const item = list.find((t) => t.id === id);
    if (item) {
      item.status = status;
      setStored(KEY__TICKETS, list);
    }
  },
  addMessageToTicket: (id: string, sender: "customer" | "admin", message: string) => {
    const list = cmsStore.getTickets();
    const item = list.find((t) => t.id === id);
    if (item) {
      item.messages.push({
        id: "msg-" + Date.now(),
        sender,
        message,
        createdAt: new Date().toLocaleString(),
      });
      if (sender === "admin" && item.status === "Open") item.status = "In_Progress";
      setStored(KEY__TICKETS, list);
      return item;
    }
    return null;
  },

  getFAQs: (): FAQItem[] => getStored(KEY__FAQS, INITIAL_FAQS),
  saveFAQ: (faq: FAQItem) => {
    const list = cmsStore.getFAQs();
    const idx = list.findIndex((f) => f.id === faq.id);
    if (idx >= 0) list[idx] = faq;
    else list.push(faq);
    setStored(KEY__FAQS, list);
  },
  deleteFAQ: (id: string) => {
    const list = cmsStore.getFAQs().filter((f) => f.id !== id);
    setStored(KEY__FAQS, list);
  },

  getTestimonials: (): CorporateTestimonial[] => getStored(KEY__TESTIMONIALS, INITIAL_TESTIMONIALS),
  saveTestimonial: (test: CorporateTestimonial) => {
    const list = cmsStore.getTestimonials();
    const idx = list.findIndex((t) => t.id === test.id);
    if (idx >= 0) list[idx] = test;
    else list.push(test);
    setStored(KEY__TESTIMONIALS, list);
  },
  deleteTestimonial: (id: string) => {
    const list = cmsStore.getTestimonials().filter((t) => t.id !== id);
    setStored(KEY__TESTIMONIALS, list);
  },

  getReports: (): InvestorReport[] => getStored(KEY__REPORTS, INITIAL_REPORTS),
  saveReport: (rep: InvestorReport) => {
    const list = cmsStore.getReports();
    const idx = list.findIndex((r) => r.id === rep.id);
    if (idx >= 0) list[idx] = rep;
    else list.push(rep);
    setStored(KEY__REPORTS, list);
  },
  deleteReport: (id: string) => {
    const list = cmsStore.getReports().filter((r) => r.id !== id);
    setStored(KEY__REPORTS, list);
  },
};
