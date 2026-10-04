"use client";

import { cn } from "@/lib/utils";

export type InterviewerState = "speaking" | "listening" | "thinking" | "idle";

/**
 * The interviewer's presence: a row of sky bars. Speaking animates the
 * bars, listening pulses them gently, thinking slows to a crawl. Motion is
 * live state only and stops under prefers-reduced-motion.
 */
export const WaveAvatar = ({ state, className }: { state: InterviewerState; className?: string }) => {
  const bars = [10, 18, 26, 18, 10, 22, 14];
  return (
    <div
      className={cn("grid h-14 w-14 place-items-center rounded-app-panel bg-app-sky/10 ring-1 ring-app-sky/25", className)}
      role="img"
      aria-label={`Interviewer ${state}`}
    >
      <div className="flex h-8 items-center gap-[3px]">
        {bars.map((h, i) => (
          <span
            key={i}
            className={cn(
              "w-[3px] rounded-full bg-app-sky",
              state === "speaking" && "animate-wave motion-reduce:animate-none",
              state === "listening" && "animate-pulse motion-reduce:animate-none",
              state === "thinking" && "animate-wave-slow motion-reduce:animate-none",
              state === "idle" && "opacity-50"
            )}
            style={{ height: h, animationDelay: `${i * 90}ms` }}
          />
        ))}
      </div>
    </div>
  );
};
