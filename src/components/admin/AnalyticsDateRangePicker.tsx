import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "mtd"
  | "last_month"
  | "qtd"
  | "ytd"
  | "custom";

export type CompareMode = "none" | "prev_period" | "prev_year";

export interface DateRangeValue {
  preset: DateRangePreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  compareMode: CompareMode;
  compareStartDate?: string;
  compareEndDate?: string;
}

const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Today",
  yesterday: "Yesterday",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  mtd: "This Month (MTD)",
  last_month: "Last Month",
  qtd: "This Quarter (QTD)",
  ytd: "Year to Date (YTD)",
  custom: "Custom Range",
};

export function calculateDateRange(
  preset: DateRangePreset,
  customStart?: string,
  customEnd?: string,
): { startDate: string; endDate: string } {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  if (preset === "custom" && customStart && customEnd) {
    return { startDate: customStart, endDate: customEnd };
  }

  if (preset === "today") {
    return { startDate: todayStr, endDate: todayStr };
  }

  if (preset === "yesterday") {
    const y = new Date(now.getTime() - 86400000);
    const yStr = y.toISOString().slice(0, 10);
    return { startDate: yStr, endDate: yStr };
  }

  if (preset === "7d") {
    const s = new Date(now.getTime() - 7 * 86400000);
    return { startDate: s.toISOString().slice(0, 10), endDate: todayStr };
  }

  if (preset === "30d") {
    const s = new Date(now.getTime() - 30 * 86400000);
    return { startDate: s.toISOString().slice(0, 10), endDate: todayStr };
  }

  if (preset === "mtd") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: firstDay.toISOString().slice(0, 10), endDate: todayStr };
  }

  if (preset === "last_month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      startDate: firstDay.toISOString().slice(0, 10),
      endDate: lastDay.toISOString().slice(0, 10),
    };
  }

  if (preset === "qtd") {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    const firstDay = new Date(now.getFullYear(), quarterMonth, 1);
    return { startDate: firstDay.toISOString().slice(0, 10), endDate: todayStr };
  }

  if (preset === "ytd") {
    const firstDay = new Date(now.getFullYear(), 0, 1);
    return { startDate: firstDay.toISOString().slice(0, 10), endDate: todayStr };
  }

  // Fallback 30d
  const fallback = new Date(now.getTime() - 30 * 86400000);
  return { startDate: fallback.toISOString().slice(0, 10), endDate: todayStr };
}

export function calculateCompareRange(
  startDate: string,
  endDate: string,
  mode: CompareMode,
): { compareStartDate?: string; compareEndDate?: string } {
  if (mode === "none") return {};
  const s = new Date(startDate);
  const e = new Date(endDate);
  const diffDays = Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);

  if (mode === "prev_period") {
    const compEnd = new Date(s.getTime() - 86400000);
    const compStart = new Date(compEnd.getTime() - (diffDays - 1) * 86400000);
    return {
      compareStartDate: compStart.toISOString().slice(0, 10),
      compareEndDate: compEnd.toISOString().slice(0, 10),
    };
  }

  if (mode === "prev_year") {
    const compStart = new Date(s.getFullYear() - 1, s.getMonth(), s.getDate());
    const compEnd = new Date(e.getFullYear() - 1, e.getMonth(), e.getDate());
    return {
      compareStartDate: compStart.toISOString().slice(0, 10),
      compareEndDate: compEnd.toISOString().slice(0, 10),
    };
  }

  return {};
}

interface Props {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  className?: string;
}

export function AnalyticsDateRangePicker({ value, onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === "custom") {
      const dates = calculateDateRange("custom", customStart, customEnd);
      const comp = calculateCompareRange(dates.startDate, dates.endDate, value.compareMode);
      onChange({
        preset: "custom",
        startDate: dates.startDate,
        endDate: dates.endDate,
        compareMode: value.compareMode,
        ...comp,
      });
      return;
    }

    const dates = calculateDateRange(preset);
    const comp = calculateCompareRange(dates.startDate, dates.endDate, value.compareMode);
    onChange({
      preset,
      startDate: dates.startDate,
      endDate: dates.endDate,
      compareMode: value.compareMode,
      ...comp,
    });
    setOpen(false);
  };

  const handleToggleCompare = (mode: CompareMode) => {
    const comp = calculateCompareRange(value.startDate, value.endDate, mode);
    onChange({
      ...value,
      compareMode: mode,
      ...comp,
    });
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    const comp = calculateCompareRange(customStart, customEnd, value.compareMode);
    onChange({
      preset: "custom",
      startDate: customStart,
      endDate: customEnd,
      compareMode: value.compareMode,
      ...comp,
    });
    setOpen(false);
  };

  const displayLabel =
    value.preset === "custom"
      ? `${value.startDate} to ${value.endDate}`
      : PRESET_LABELS[value.preset];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 rounded-xl border-border bg-card text-xs font-bold flex items-center gap-2 shadow-xs hover:border-primary/50"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground">{displayLabel}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-3 rounded-2xl bg-card border-border shadow-xl space-y-3"
          align="end"
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">
            Date Range Presets
          </div>

          <div className="grid grid-cols-2 gap-1">
            {(Object.keys(PRESET_LABELS) as DateRangePreset[])
              .filter((p) => p !== "custom")
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                    value.preset === p
                      ? "bg-primary text-primary-foreground font-bold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span>{PRESET_LABELS[p]}</span>
                  {value.preset === p && <Check className="h-3 w-3" />}
                </button>
              ))}
          </div>

          {/* Custom range picker inputs */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1">
              Custom Range
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-muted/30 text-xs font-bold"
              />
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-muted/30 text-xs font-bold"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyCustom}
              className="w-full h-8 rounded-lg bg-primary text-primary-foreground font-black text-xs uppercase"
            >
              Apply Custom Dates
            </Button>
          </div>

          {/* Period comparison modes */}
          <div className="pt-2 border-t border-border space-y-1.5">
            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground px-1 flex items-center gap-1">
              <ArrowRightLeft className="h-2.5 w-2.5" /> Comparison Mode
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleToggleCompare("none")}
                className={`py-1 px-1.5 rounded-md text-center border ${
                  value.compareMode === "none"
                    ? "border-primary bg-primary/10 text-primary font-black"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                No Compare
              </button>
              <button
                type="button"
                onClick={() => handleToggleCompare("prev_period")}
                className={`py-1 px-1.5 rounded-md text-center border ${
                  value.compareMode === "prev_period"
                    ? "border-primary bg-primary/10 text-primary font-black"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                vs Prior Period
              </button>
              <button
                type="button"
                onClick={() => handleToggleCompare("prev_year")}
                className={`py-1 px-1.5 rounded-md text-center border ${
                  value.compareMode === "prev_year"
                    ? "border-primary bg-primary/10 text-primary font-black"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                vs Prior Year
              </button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
