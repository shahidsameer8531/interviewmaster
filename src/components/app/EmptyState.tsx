import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Where data is missing: one icon, one sentence, one action. Never a sample
 * number.
 */
export const EmptyState = ({
  icon: Icon,
  text,
  action,
  className,
}: {
  icon: LucideIcon;
  text: string;
  action?: { label: string; href: string } | { label: string; onClick: () => void } | React.ReactNode;
  className?: string;
}) => {
  let actionNode: React.ReactNode = null;
  if (action && typeof action === "object" && "label" in action) {
    actionNode =
      "href" in action ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      );
  } else {
    actionNode = action as React.ReactNode;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-app-card border border-dashed border-app-line-strong px-6 py-10 text-center",
        className
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-app-hover text-app-ink-3">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="max-w-sm text-app-body text-app-ink-2">{text}</p>
      {actionNode}
    </div>
  );
};
