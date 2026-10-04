import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  CalendarDays,
  Code2,
  FileText,
  Mic,
  Settings,
  Users,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** True when the link leaves the app shell (existing product pages). */
  external?: boolean;
};

export type AppNavGroup = {
  label: string;
  items: AppNavItem[];
};

export const appNavigation: AppNavGroup[] = [
  {
    label: "Practice",
    items: [
      { href: "/dashboard", label: "Today", icon: CalendarDays },
      { href: "/dashboard/interview/new", label: "Mock interview", icon: Mic },
      { href: "/dashboard/resume", label: "Resume", icon: FileText },
      { href: "/dashboard/aptitude", label: "Aptitude", icon: Brain },
      { href: "/products/coding-practice", label: "Coding", icon: Code2, external: true },
      { href: "/products/interview-questions", label: "Question bank", icon: BookOpenCheck, external: true },
    ],
  },
  {
    label: "Human help",
    items: [{ href: "/dashboard/coaching", label: "Coaching", icon: Users }],
  },
  {
    label: "You",
    items: [
      { href: "/dashboard/progress", label: "Progress", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export type ShellVariant = "sidebar" | "rail" | "focus";

/**
 * Which shell a route gets. The interview room is full-screen, the resume
 * builder keeps an icon rail so the three editing columns have room, and
 * everything else shows the full sidebar.
 */
export function shellVariantFor(pathname: string | null): ShellVariant {
  if (!pathname) return "sidebar";
  if (/^\/dashboard\/interview\/[^/]+$/.test(pathname) && !pathname.endsWith("/new")) return "focus";
  if (/^\/dashboard\/resume\/[^/]+$/.test(pathname)) return "rail";
  return "sidebar";
}

/** Active-state rule: exact for Today and Settings, prefix for the rest. */
export function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/dashboard" || href === "/settings") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
