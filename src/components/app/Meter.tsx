import { cn } from "@/lib/utils";

export type MeterTone = "sky" | "orange" | "neutral";

const fills: Record<MeterTone, string> = {
  sky: "bg-app-sky",
  orange: "bg-app-orange",
  neutral: "bg-app-ink-3",
};

export type MeterProps = {
  label: string;
  value: number;
  max?: number;
  tone?: MeterTone;
  /** Short word shown next to the value, e.g. "Weakest" or "Next focus". */
  tag?: string;
  /** A 2px ink line at this value, with a legend line underneath. */
  target?: { value: number; label: string };
  /** Hide the legend when several meters share one legend above them. */
  showLegend?: boolean;
  className?: string;
};

/**
 * Label, number and bar. Numbers come before adjectives, so the value is
 * always printed with its scale; the tag names what the colour means.
 */
export const Meter = ({
  label,
  value,
  max = 100,
  tone = "sky",
  tag,
  target,
  showLegend = true,
  className,
}: MeterProps) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const targetPct = target ? Math.max(0, Math.min(100, (target.value / max) * 100)) : null;
  const tagTone = tone === "orange" ? "text-app-orange-text" : tone === "sky" ? "text-app-sky-text" : "text-app-ink-2";

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-app-small text-app-ink-2">{label}</span>
        <span className="flex shrink-0 items-baseline gap-2">
          {tag && <span className={cn("text-app-label font-mono uppercase", tagTone)}>{tag}</span>}
          <span className="font-mono text-app-small tabular-nums text-app-ink-1">
            {value}
            <span className="text-app-ink-3">/{max}</span>
          </span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${value} of ${max}${tag ? `, ${tag}` : ""}`}
        className="relative mt-1.5 h-2 w-full overflow-visible rounded-full bg-app-hover"
      >
        <div className={cn("h-full rounded-full", fills[tone])} style={{ width: `${pct}%` }} />
        {targetPct !== null && (
          <span
            aria-hidden
            className="absolute -top-1 h-4 w-0.5 rounded-sm bg-app-ink-1"
            style={{ left: `calc(${targetPct}% - 1px)` }}
          />
        )}
      </div>
      {target && showLegend && (
        <p className="mt-1.5 flex items-center gap-2 text-app-label font-mono uppercase text-app-ink-3">
          <span aria-hidden className="inline-block h-3 w-0.5 bg-app-ink-1" />
          {target.label}
        </p>
      )}
    </div>
  );
};
