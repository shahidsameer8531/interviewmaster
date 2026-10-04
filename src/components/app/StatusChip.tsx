import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChipTone = "neutral" | "sky" | "orange";

const tones: Record<ChipTone, string> = {
  neutral: "border-app-line-strong bg-app-hover text-app-ink-2",
  sky: "border-app-sky/30 bg-app-sky/10 text-app-sky-text",
  orange: "border-app-orange/30 bg-app-orange/10 text-app-orange-text",
};

/**
 * A small labelled state. Colour is never the only signal: the chip always
 * carries text, and `live` adds a pulsing dot only for an in-progress state.
 */
export const StatusChip = ({
  tone = "neutral",
  icon: Icon,
  live = false,
  children,
  className,
}: {
  tone?: ChipTone;
  icon?: LucideIcon;
  live?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-app-small font-medium",
      tones[tone],
      className
    )}
  >
    {live && (
      <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
        <span className="absolute h-2 w-2 animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      </span>
    )}
    {Icon && !live && <Icon className="h-3.5 w-3.5" aria-hidden />}
    {children}
  </span>
);
