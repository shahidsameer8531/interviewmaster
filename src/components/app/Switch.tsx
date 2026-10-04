"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * A labelled switch. On is sky, off is --app-line-strong. The 48 by 28px
 * track sits inside a 44px hit area.
 */
export const Switch = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}) => {
  const auto = useId();
  const switchId = id ?? auto;
  const descId = description ? `${switchId}-desc` : undefined;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <label htmlFor={switchId} className="block cursor-pointer text-app-ui text-app-ink-1">
          {label}
        </label>
        {description && (
          <p id={descId} className="mt-0.5 text-app-small text-app-ink-2">
            {description}
          </p>
        )}
      </div>
      <SwitchPrimitive.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={descId}
        className={cn(
          "group relative inline-flex h-11 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-gold-hover",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "relative block h-7 w-12 rounded-full transition-colors",
            "bg-app-line-strong group-data-[state=checked]:bg-app-sky"
          )}
        >
          <SwitchPrimitive.Thumb className="absolute left-[3px] top-[3px] block h-[22px] w-[22px] rounded-full bg-app-ink-1 shadow transition-transform data-[state=checked]:translate-x-5" />
        </span>
      </SwitchPrimitive.Root>
    </div>
  );
};
