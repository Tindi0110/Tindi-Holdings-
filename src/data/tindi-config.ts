export interface TindiCompanyConfig {
  id: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  icon: string;
  status: "PRE_LAUNCH" | "ACTIVE" | "IN_DEVELOPMENT" | "PLANNED" | "FUTURE";
  statusNote?: string;
}

export const TINDI_COMPANIES: TindiCompanyConfig[] = [
  {
    id: "tech",
    name: "Tindi Tech & Smart Homes",
    slug: "tech",
    description: "Pioneering the future of automation and digital connectivity.",
    industry: "Technology & Smart Living",
    icon: "Laptop",
    status: "PRE_LAUNCH",
    statusNote: "Platform & system engineering in pre-launch stage. Formal launch Q4 2026.",
  },
  {
    id: "safaris",
    name: "Tindi Safaris & Logistics",
    slug: "safaris",
    description: "Premium travel experiences and precision supply chain solutions.",
    industry: "Transport Logistics & Safaris",
    icon: "Footprints",
    status: "PRE_LAUNCH",
    statusNote: "Fleet assets & partner networks being organized for Q1 2027 rollout.",
  },
  {
    id: "eats",
    name: "Tindi Eats",
    slug: "eats",
    description: "Elevating culinary experiences from fine dining to catering.",
    industry: "Hospitality & Food Tech",
    icon: "Utensils",
    status: "PRE_LAUNCH",
    statusNote: "Culinary concepts and cloud kitchen framework in active development.",
  },
  {
    id: "apparel",
    name: "Tindi Apparel",
    slug: "apparel",
    description: "Sophisticated fashion for the corporate and modern lifestyle.",
    industry: "Sustainable Fashion & Design",
    icon: "Shirt",
    status: "PRE_LAUNCH",
    statusNote: "Design studio and eco-textile sourcing currently underway.",
  },
];

export const FUTURE_VENTURES = [
  {
    name: "Tindi Energy",
    description: "Sustainable power and solar storage solutions for the next generation.",
    status: "FUTURE" as const,
  },
  {
    name: "Tindi Finance",
    description: "Transforming regional fintech landscapes and digital micro-transactions.",
    status: "PLANNED" as const,
  },
  {
    name: "Tindi Real Estate",
    description: "Developing smart, eco-efficient urban environments across East Africa.",
    status: "FUTURE" as const,
  },
  {
    name: "Tindi Health",
    description: "Technology-enabled healthcare and remote telemetry tools.",
    status: "FUTURE" as const,
  },
];
