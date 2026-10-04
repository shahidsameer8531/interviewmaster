import { cn } from "@/lib/utils";

/**
 * The overall score only. Sky stroke on an --app-hover track, the number in
 * the middle with "of 100" under it. Static; it is not a live signal.
 */
export const ScoreRing = ({
  value,
  max = 100,
  size = 132,
  label = "Overall score",
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  className?: string;
}) => {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));

  return (
    <div
      role="img"
      aria-label={`${label}: ${value} of ${max}`}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--app-hover)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--app-sky)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-[40px] font-semibold leading-none tabular-nums text-app-ink-1">{value}</span>
        <span className="mt-1 font-mono text-app-label uppercase text-app-ink-3">of {max}</span>
      </div>
    </div>
  );
};
