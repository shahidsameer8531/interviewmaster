"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { shellVariantFor, type ShellVariant } from "./app-navigation";
import { useAppUser } from "@/features/app-data/hooks";
import { SearchProvider } from "./search-context";
import { GuestImportOffer } from "./GuestImportOffer";
import { canUseGuestStore } from "@/features/app-data/guest-store";
import { useEffect, useState } from "react";

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
  children,
}: {
  variant?: ShellVariant;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const v = variant ?? shellVariantFor(pathname);
  const { isGuest } = useAppUser();
  // The "keep your history" banner only makes sense when guest history can
  // actually be stored here and later imported.
  const [storeWorks, setStoreWorks] = useState(false);
  useEffect(() => setStoreWorks(canUseGuestStore()), []);

  return (
    <SearchProvider shortcut={v === "sidebar"}>
      <div
        data-app-root
        className="flex min-h-screen flex-wrap font-sans text-app-body"
      >
        <a
          href="#app-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-app-control focus:bg-app-gold focus:px-3 focus:py-2 focus:text-app-ui focus:text-app-bg"
        >
          Skip to content
        </a>

        {v !== "focus" && (
          <div
            style={{ flex: v === "rail" ? "1 1 76px" : "1 1 240px" }}
            className="min-w-0"
          >
            <AppSidebar compact={v === "rail"} />
          </div>
        )}

        <main
          id="app-content"
          tabIndex={-1}
          style={{ flex: "999 1 560px", minWidth: 0 }}
          className={cn(
            "px-[clamp(16px,3vw,40px)]",
            v === "focus" ? "py-4" : "py-6 lg:py-8",
          )}
        >
          {v !== "focus" && <GuestImportOffer />}
          {isGuest && storeWorks && v !== "focus" && (
            <p
              role="status"
              className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-2 rounded-app-control border border-app-line bg-app-sidebar px-4 py-2.5 text-app-small text-app-ink-2"
            >
              <span>
                Sign in to keep your history. As a guest, it stays in this
                browser only.
              </span>
              <Link
                href={`/auth?callbackUrl=${encodeURIComponent(pathname ?? "/dashboard")}`}
                className="font-semibold text-app-sky-text hover:underline"
              >
                Sign in
              </Link>
            </p>
          )}
          {children}
        </main>
      </div>
    </SearchProvider>
  );
};
