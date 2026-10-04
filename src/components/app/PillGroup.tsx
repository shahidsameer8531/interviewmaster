"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

export type PillOption = { value: string; label: string; disabled?: boolean };

/**
 * Segmented pills backed by native radios. The selected pill is solid ink
 * with navy text, so a pick never reads as a verdict.
 */
export const PillGroup = ({
  label,
  options,
  value,
  onChange,
  name,
  size = "default",
  className,
}: {
  label: string;
  options: PillOption[];
  value: string | null;
  onChange: (v: string) => void;
  name?: string;
  size?: "default" | "sm";
  className?: string;
}) => {
  const auto = useId();
  const group = name ?? auto;
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const checked = value === o.value;
        return (
          <label key={o.value} className={cn("relative", o.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer")}>
            <input
              type="radio"
              name={group}
              value={o.value}
              checked={checked}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-4 text-app-ui transition-colors",
                size === "sm" ? "h-9" : "h-11",
                checked
                  ? "border-app-ink-1 bg-app-ink-1 text-app-bg"
                  : "border-app-line-strong bg-transparent text-app-ink-2 hover:bg-app-hover hover:text-app-ink-1",
                "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-app-gold-hover"
              )}
            >
              {o.label}
            </span>
          </label>
        );
      })}
    </div>
  );
};
