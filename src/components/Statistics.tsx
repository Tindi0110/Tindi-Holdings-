import { motion } from "motion/react";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedMetrics, formatMetricDisplay } from "@/lib/corporate-metrics.functions";
import { MetricBadge } from "@/components/shared/StatusBadges";
import type { CorporateMetric } from "@/lib/corporate-metrics.functions";

// Fallback static data for graceful degradation when DB unavailable
const FALLBACK_METRICS: Partial<CorporateMetric>[] = [
  {
    id: "f1",
    name: "Operating Subsidiaries",
    current_value: 4,
    current_display: null,
    target_display: "10+",
    suffix: "",
    prefix: "",
    classification: "VERIFIED",
  },
  {
    id: "f2",
    name: "Active Countries",
    current_value: 1,
    current_display: "1 (Kenya)",
    target_display: "8+",
    suffix: "",
    prefix: "",
    classification: "VERIFIED",
  },
  {
    id: "f3",
    name: "Registered Customers",
    current_value: null,
    current_display: "Pre-launch",
    target_display: "1.5M+",
    suffix: "",
    prefix: "",
    classification: "TARGET",
  },
  {
    id: "f4",
    name: "Completed Projects",
    current_value: null,
    current_display: "Pre-launch",
    target_display: "620+",
    suffix: "",
    prefix: "",
    classification: "TARGET",
  },
];

function MetricCard({
  metric,
  index,
  inView,
}: {
  metric: Partial<CorporateMetric>;
  index: number;
  inView: boolean;
}) {
  const display = formatMetricDisplay(metric as CorporateMetric);
  const hasRealValue =
    metric.current_value !== null && metric.current_value !== undefined;

  return (
    <motion.div
      className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all group text-center shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Classification badge — top right */}
      {metric.classification && (
        <div className="absolute top-3 right-3">
          <MetricBadge classification={metric.classification as CorporateMetric["classification"]} />
        </div>
      )}

      {/* Primary value */}
      <div className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1 group-hover:text-primary transition-colors">
        {hasRealValue && inView ? (
          <>
            {metric.prefix}
            <CountUp end={metric.current_value as number} duration={3} separator="," />
            {metric.suffix}
          </>
        ) : (
          <span className={!hasRealValue ? "text-muted-foreground text-2xl" : ""}>
            {display.primary}
          </span>
        )}
      </div>

      {/* Metric name */}
      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
        {metric.name}
      </div>

      {/* Target/secondary line */}
      {display.secondary && (
        <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">
          {display.secondary}
        </div>
      )}
    </motion.div>
  );
}

export function Statistics() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  const { data: metrics, isLoading } = useQuery({
    queryKey: ["corporate-metrics", "featured"],
    queryFn: getFeaturedMetrics,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const displayMetrics =
    !isLoading && metrics && metrics.length > 0
      ? metrics.slice(0, 4)
      : (FALLBACK_METRICS as CorporateMetric[]);

  return (
    <section ref={ref} className="py-24 bg-background border-b border-border">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        {/* Pre-launch context line */}
        <p className="text-center text-xs text-muted-foreground mb-6 font-medium tracking-wide">
          Tindi Holdings Ltd is preparing for launch. Metrics show current verified state and strategic targets.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayMetrics.map((metric, i) => (
            <MetricCard key={metric.id ?? i} metric={metric} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
