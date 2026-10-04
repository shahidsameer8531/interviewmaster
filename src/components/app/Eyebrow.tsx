import { cn } from "@/lib/utils";

/** The mono label style used for section labels, meta and breadcrumb context. */
export const Eyebrow = ({
  children,
  className,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div" | "h2" | "h3";
}) => (
  <Tag className={cn("font-mono text-app-label uppercase text-app-ink-3", className)}>{children}</Tag>
);
