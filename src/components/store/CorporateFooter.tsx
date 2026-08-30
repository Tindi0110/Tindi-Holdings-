import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Building,
} from "lucide-react";
import { motion } from "motion/react";

export function CorporateFooter() {
  const currentYear = new Date().getFullYear();

  const companyColumns = [
    {
      title: "Holding Entity",
      links: [
        { label: "About Tindi Holdings Ltd", to: "/about" },
        { label: "Executive Leadership", to: "/about", hash: "#leadership" },
        { label: "Timeline & Roadmap", to: "/about", hash: "#timeline" },
        { label: "ESG & Sustainability", to: "/sustainability" },
        { label: "Careers Portal", to: "/careers" },
      ],
    },
    {
      title: "Our Companies",
      links: [
        { label: "Tech & Smart Homes", to: "/companies", hash: "#tech" },
        { label: "Safaris & Logistics", to: "/companies", hash: "#safaris" },
        { label: "Tindi Eats", to: "/companies", hash: "#eats" },
        { label: "Tindi Apparel", to: "/companies", hash: "#apparel" },
        { label: "Shop", to: "/shop" },
      ],
    },
    {
      title: "Strategic Focus",
      links: [
        { label: "Industries Served", to: "/industries" },
        { label: "Innovation Hub", to: "/innovation" },
        { label: "Research Labs", to: "/innovation", hash: "#labs" },
        { label: "Strategic Partnerships", to: "/innovation", hash: "#partnerships" },
        { label: "Future Ventures", to: "/future" },
      ],
    },
    {
      title: "Help & Buyer Protection",
      links: [
        { label: "Returns & Refund Policy", to: "/returns-policy" },
        { label: "Track Your Order", to: "/track-order" },
        { label: "Investor Relations", to: "/investors" },
        { label: "Support Tickets", to: "/contact", hash: "#tickets" },
        { label: "Office Contacts", to: "/contact" },
      ],
    },
  ];

  return (
    <footer className="bg-[#f0f7ff] dark:bg-card border-t border-sky-100 dark:border-border mt-20 text-muted-foreground">
      <div className="bg-white/70 dark:bg-black/20 border-b border-sky-100 dark:border-border">
        <div className="mx-auto max-w-screen-2xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h4 className="text-lg font-semibold text-foreground leading-tight">Newsletter</h4>
            <p className="text-sm text-sky-700 dark:text-sky-400 mt-1">
              Receive updates on new products and announcements.
            </p>
          </div>
          <div className="flex w-full max-w-sm gap-2 shrink-0">
            <input
              type="email"
              className="w-full h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Email address"
            />
            <button className="h-10 px-6 text-sm font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-2xl px-6 py-16 grid grid-cols-1 md:grid-cols-6 gap-10">
        <div className="md:col-span-2 space-y-5">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="h-10 w-auto rounded-lg transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground leading-none">
                Tindi Holdings Ltd
              </span>
            </div>
          </Link>

          <p className="text-sm text-sky-800/80 dark:text-muted-foreground leading-relaxed max-w-sm">
            A diversified multi-sector conglomerate building the future through smart home
            technology, luxury safaris, sustainable logistics, hospitality, and premium global
            apparel designs.
          </p>

          <div className="space-y-3 text-sm text-sky-800/80 dark:text-muted-foreground">
            <div className="flex items-start gap-2 max-w-xs">
              <MapPin className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Riverside Drive, Nairobi, Kenya</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-sky-600 shrink-0" />
              <span>corporate@tindiholdings.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-600 shrink-0" />
              <span>+254 700 110000</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { Icon: Facebook, href: "https://facebook.com" },
              { Icon: Twitter, href: "https://twitter.com" },
              { Icon: Instagram, href: "https://instagram.com" },
              { Icon: Linkedin, href: "https://linkedin.com" },
              { Icon: Youtube, href: "https://youtube.com" },
            ].map(({ Icon, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="no-referrer"
                className="h-10 w-10 rounded-full bg-background hover:bg-muted border border-border grid place-items-center text-sky-500 dark:text-sky-400 hover:text-sky-700 dark:hover:text-primary transition-all"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {companyColumns.map((col) => (
          <div key={col.title} className="space-y-4">
            <h5 className="font-semibold text-sm text-foreground">{col.title}</h5>
            <ul className="space-y-3 text-sm text-sky-800/80 dark:text-muted-foreground">
              {col.links.map((link) => {
                const isHash = link.hash;
                const pathParts = link.to;

                return (
                  <li key={link.label}>
                    <Link
                      to={pathParts as "/"}
                      onClick={() => {
                        if (isHash) {
                          setTimeout(() => {
                            const el = document.getElementById(isHash.substring(1));
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                      className="hover:text-sky-600 dark:hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-sky-100 dark:border-border bg-white/70 dark:bg-black/20">
        <div className="mx-auto max-w-screen-2xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-sky-800/70 dark:text-muted-foreground/75 mt-2">
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-sky-600" /> Certified Operations
            </span>
          </div>
          <div className="text-center md:text-right">
            <p>© {currentYear} Tindi Holdings Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
