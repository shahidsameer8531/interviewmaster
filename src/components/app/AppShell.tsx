"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { AppSidebar, type SidebarTarget } from "./AppSidebar";
import { shellVariantFor, type ShellVariant } from "./app-navigation";

/**
 * The Prep Room layout. A wrapping flex row: the sidebar is `flex: 1 1 240px`
 * (or 76px for the rail) and the content is `flex: 999 1 560px`, so on a
 * phone the sidebar stacks on top with no media queries.
 *
 * - sidebar: full navigation, 240px.
 * - rail: 76px icons only.
 * - focus: no navigation at all (the interview room).
 */
export const AppShell = ({
  variant,
  target,
  children,
}: {
  variant?: ShellVariant;
  target?: SidebarTarget | null;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const v = variant ?? shellVariantFor(pathname);

  return (
    <div data-app-root className="flex min-h-screen flex-wrap font-sans text-app-body">
      <a
        href="#app-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-app-control focus:bg-app-gold focus:px-3 focus:py-2 focus:text-app-ui focus:text-app-bg"
      >
        Skip to content
      </a>

      {v !== "focus" && (
        <div style={{ flex: v === "rail" ? "1 1 76px" : "1 1 240px" }} className="min-w-0">
          <AppSidebar compact={v === "rail"} target={target} />
        </div>
      )}

      <main
        id="app-content"
        tabIndex={-1}
        style={{ flex: "999 1 560px", minWidth: 0 }}
        className={cn("px-[clamp(16px,3vw,40px)]", v === "focus" ? "py-4" : "py-6 lg:py-8")}
      >
        {children}
      </main>
    </div>
  );
};
