import { motion } from "motion/react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";

const stats = [
  { label: "Customers Served", value: 500000, suffix: "+" },
  { label: "Products Sold", value: 1200000, suffix: "" },
  { label: "Countries Served", value: 45, suffix: "" },
  { label: "Projects Completed", value: 850, suffix: "" },
];

export function Statistics() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="p-6 rounded-2xl bg-muted border border-border hover:border-slate-300 transition-all group text-center shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
              {inView && <CountUp end={stat.value} duration={3} separator="," />}
              {stat.suffix}
            </div>
            <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
