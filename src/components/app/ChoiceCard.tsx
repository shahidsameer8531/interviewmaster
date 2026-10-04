"use client";

import { createContext, useContext, useId } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type GroupCtx = { name: string; value: string | null; onChange: (v: string) => void };
const Ctx = createContext<GroupCtx | null>(null);

/**
 * A group of card-sized radio options. Native radios do the keyboard work
 * (arrows move, Space selects), the label is the whole card.
 */
export const ChoiceCardGroup = ({
  label,
  value,
  onChange,
  name,
  columns = 1,
  children,
  className,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  name?: string;
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}) => {
  const auto = useId();
  return (
    <Ctx.Provider value={{ name: name ?? auto, value, onChange }}>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn(
          "grid gap-3",
          columns === 2 && "grid-cols-[repeat(auto-fit,minmax(220px,1fr))]",
          columns === 3 && "grid-cols-[repeat(auto-fit,minmax(180px,1fr))]",
          className
        )}
      >
        {children}
      </div>
    </Ctx.Provider>
  );
};

export const ChoiceCard = ({
  value,
  title,
  description,
  icon: Icon,
  disabled = false,
  className,
}: {
  value: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}) => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ChoiceCard must be used inside ChoiceCardGroup");
  const checked = ctx.value === value;

  return (
    <label className={cn("relative block cursor-pointer", disabled && "cursor-not-allowed opacity-50", className)}>
      <input
        type="radio"
        name={ctx.name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => ctx.onChange(value)}
        className="peer sr-only"
      />
      <span
        className={cn(
          "flex min-h-[44px] items-start gap-3 rounded-app-card border border-app-line bg-app-card p-4 transition-colors",
          "hover:border-app-line-strong",
          "peer-checked:border-transparent peer-checked:shadow-[0_0_0_1.5px_var(--app-sky)]",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-app-gold-hover"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full border-2 transition-colors",
            checked ? "border-app-sky bg-app-sky" : "border-app-line-strong bg-transparent"
          )}
        >
          {checked && <span className="h-1.5 w-1.5 rounded-full bg-app-bg" />}
        </span>
        {Icon && <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", checked ? "text-app-sky" : "text-app-ink-3")} aria-hidden />}
        <span className="min-w-0">
          <span className="block text-app-ui text-app-ink-1">{title}</span>
          {description && <span className="mt-0.5 block text-app-small text-app-ink-2">{description}</span>}
        </span>
      </span>
    </label>
  );
};
