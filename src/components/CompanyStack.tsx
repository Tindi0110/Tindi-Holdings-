import { motion, useScroll, useTransform } from "motion/react";
import { CorporateCompany } from "@/lib/cms-store";
import { Cpu, Compass, Utensils, Shirt, Rocket } from "lucide-react";
import { useRef } from "react";
import { EntityStatusBadge } from "@/components/shared/StatusBadges";

const logoMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu,
  Compass,
  Utensils,
  Shirt,
  Rocket,
};

interface CompanyCardProps {
  company: CorporateCompany;
  index: number;
}

function CompanyCard({ company, index }: CompanyCardProps) {
  const IconComponent = logoMap[company.logo] || Cpu;
  const targetRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "start center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.6, 1]);

  return (
    <motion.div
      ref={targetRef}
      className="sticky top-24 bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8"
      style={{
        zIndex: index + 1,
        marginTop: index === 0 ? 0 : -100, // Stacking effect
        scale,
        opacity,
      }}
    >
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary grid place-items-center">
              <IconComponent className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
                {company.name}
              </h2>
              <span className="text-amber-500 font-bold uppercase tracking-widest text-xs">
                {company.industry}
              </span>
            </div>
          </div>
          <EntityStatusBadge status="PRE_LAUNCH" size="md" />
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">{company.description}</p>
        {company.statusNote && (
          <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold bg-sky-500/10 border border-sky-500/20 px-3 py-2 rounded-xl">
            ℹ️ {company.statusNote}
          </p>
        )}
        <div className="flex gap-4">
          <a
            href={`#detail-${company.id}`}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm uppercase transition-opacity hover:opacity-90 inline-block"
          >
            Explore Specifications
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export function CompanyStack({ companies }: { companies: CorporateCompany[] }) {
  return (
    <div className="relative space-y-12 py-20 px-4 md:px-6 max-w-screen-2xl mx-auto w-full">
      {companies.map((company, index) => (
        <CompanyCard key={company.id} company={company} index={index} />
      ))}
    </div>
  );
}
