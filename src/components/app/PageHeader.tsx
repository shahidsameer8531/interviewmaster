import Link from "next/link";
import { Fragment } from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "./Eyebrow";

export type Crumb = { label: string; href?: string };

/**
 * Breadcrumb or eyebrow, the title, one meta line, and an actions slot that
 * wraps under the title when there is no room.
 */
export const PageHeader = ({
  eyebrow,
  breadcrumb,
  title,
  meta,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  breadcrumb?: Crumb[];
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) => (
  <header className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-4", className)}>
    <div className="min-w-0 flex-[1_1_320px]">
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 font-mono text-app-label uppercase text-app-ink-3">
            {breadcrumb.map((c, i) => (
              <Fragment key={`${c.label}-${i}`}>
                {i > 0 && (
                  <li aria-hidden className="text-app-ink-3/60">
                    /
                  </li>
                )}
                <li>
                  {c.href ? (
                    <Link href={c.href} className="rounded-sm hover:text-app-ink-1">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-app-ink-2">
                      {c.label}
                    </span>
                  )}
                </li>
              </Fragment>
            ))}
          </ol>
        </nav>
      ) : eyebrow ? (
        <Eyebrow>{eyebrow}</Eyebrow>
      ) : null}
      <h1 className="mt-2 font-display text-app-title text-balance text-app-ink-1">{title}</h1>
      {meta && <p className="mt-2 text-app-small text-app-ink-2">{meta}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </header>
);
