import type { EntityStatus, MetricClassification } from "@/lib/corporate-metrics.functions";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------
// ENTITY STATUS BADGE
// Shows the operational status of a company/project/venture
// -----------------------------------------------------------------------

const statusConfig: Record<
  EntityStatus,
  { label: string; className: string }
> = {
  PRE_LAUNCH: {
    label: "Pre-Launch",
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  },
  ACTIVE: {
    label: "Active",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  IN_DEVELOPMENT: {
    label: "In Development",
    className:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
  },
  PILOT: {
    label: "Pilot",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  },
  PLANNED: {
    label: "Planned",
    className:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700/50",
  },
  FUTURE: {
    label: "Future Venture",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50",
  },
  PAUSED: {
    label: "Paused",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  },
  CLOSED: {
    label: "Closed",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50",
  },
};

interface EntityStatusBadgeProps {
  status: EntityStatus;
  className?: string;
  size?: "xs" | "sm" | "md";
  showDot?: boolean;
}

export function EntityStatusBadge({
  status,
  className,
  size = "sm",
  showDot = true,
}: EntityStatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig["PLANNED"];

  const sizeClass = {
    xs: "text-[9px] px-1.5 py-0.5",
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider",
        sizeClass,
        config.className,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-sky-500": status === "PRE_LAUNCH",
            "bg-emerald-500": status === "ACTIVE",
            "bg-violet-500": status === "IN_DEVELOPMENT",
            "bg-amber-500": status === "PILOT",
            "bg-slate-400": status === "PLANNED",
            "bg-indigo-500": status === "FUTURE",
            "bg-orange-500": status === "PAUSED",
            "bg-red-500": status === "CLOSED",
          })}
        />
      )}
      {config.label}
    </span>
  );
}

// -----------------------------------------------------------------------
// METRIC CLASSIFICATION BADGE
// Shows whether a number is Verified, Target, Projected, etc.
// -----------------------------------------------------------------------

const classificationConfig: Record<
  MetricClassification,
  { label: string; className: string }
> = {
  VERIFIED: {
    label: "Verified",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  TARGET: {
    label: "Target",
    className:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50",
  },
  PROJECTED: {
    label: "Projected",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
  },
  ESTIMATED: {
    label: "Estimated",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50",
  },
  INTERNAL: {
    label: "Internal",
    className:
      "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700/50",
  },
};

interface MetricBadgeProps {
  classification: MetricClassification;
  className?: string;
  size?: "xs" | "sm";
}

export function MetricBadge({
  classification,
  className,
  size = "xs",
}: MetricBadgeProps) {
  const config =
    classificationConfig[classification] ?? classificationConfig["ESTIMATED"];

  const sizeClass = {
    xs: "text-[9px] px-1.5 py-0.5",
    sm: "text-[10px] px-2 py-0.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold uppercase tracking-wider",
        sizeClass,
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}

// -----------------------------------------------------------------------
// PRE-LAUNCH BANNER
// A site-wide pre-launch indicator strip
// -----------------------------------------------------------------------

interface PreLaunchBannerProps {
  launchQuarter?: string;
  className?: string;
}

export function PreLaunchBanner({
  launchQuarter = "Q4 2026",
  className,
}: PreLaunchBannerProps) {
  return (
    <div
      className={cn(
        "bg-sky-600 dark:bg-sky-900 text-white text-center py-2 px-4 text-xs font-semibold tracking-wide",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
        Tindi Holdings Ltd is preparing for official launch — {launchQuarter}
        <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
      </span>
    </div>
  );
}
