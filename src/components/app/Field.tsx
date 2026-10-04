import * as React from "react";

import { cn } from "@/lib/utils";

const control =
  "w-full rounded-app-control border border-app-line-strong bg-app-sidebar px-3 text-app-body text-app-ink-1 placeholder:text-app-ink-3 " +
  "focus:border-app-sky focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-gold-hover focus-visible:ring-offset-2 focus-visible:ring-offset-app-bg " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-app-orange";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(control, "h-11", className)} {...props} />
);
Input.displayName = "Input";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <span className="relative block">
      <select ref={ref} className={cn(control, "h-11 appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-app-ink-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
);
Select.displayName = "Select";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(control, "min-h-[44px] py-2.5 leading-relaxed", className)} rows={4} {...props} />
  )
);
Textarea.displayName = "Textarea";

/**
 * Label plus one control. The control is passed as the only child and gets
 * `id`, `aria-describedby` and `aria-invalid` wired from the field.
 */
export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement;
  className?: string;
}) => {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const child = React.cloneElement(children, {
    id: htmlFor,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : undefined,
    required,
  });

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-app-ui text-app-ink-1">
        {label}
        {required && (
          <span className="ml-1 text-app-ink-3" aria-hidden>
            *
          </span>
        )}
      </label>
      {child}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-app-small text-app-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-app-small text-app-orange-text">
          {error}
        </p>
      )}
    </div>
  );
};
