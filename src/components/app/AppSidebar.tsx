"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { ArrowUpRight, Target } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Eyebrow } from "./Eyebrow";
import { appNavigation, isActivePath } from "./app-navigation";
import { useCurrentUser } from "@/features/auth/api/useCurrentUser";
import { UserButton } from "@/features/auth/components/UserButton";
import { UserButtonLoading } from "@/features/auth/components/UserButtonLoading";
import { useTarget } from "@/features/app-data/hooks";

export type SidebarTarget = {
  role?: string | null;
  company?: string | null;
  /** ISO date of the interview loop. */
  loopDate?: string | null;
  /** ISO date the plan started; drives "Day n of your N-day plan". */
  planStartedAt?: string | null;
};

const DAY = 86_400_000;
const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * The plan runs from the day the target was first saved to the loop date.
 * Without a loop date there is no plan length, so nothing is shown.
 */
const dayOfPlan = (t: SidebarTarget) => {
  if (!t.planStartedAt || !t.loopDate) return null;
  const start = startOfDay(new Date(t.planStartedAt).getTime());
  const loop = startOfDay(new Date(`${t.loopDate}T00:00:00`).getTime());
  if (Number.isNaN(start) || Number.isNaN(loop)) return null;
  const days = Math.round((loop - start) / DAY) + 1;
  if (days < 1) return null;
  const day = Math.min(days, Math.max(1, Math.floor((startOfDay(Date.now()) - start) / DAY) + 1));
  return { day, days };
};

const formatLoopDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
};

const TargetCard = ({ target, compact }: { target?: SidebarTarget | null; compact: boolean }) => {
  if (compact) return null;
  const plan = target ? dayOfPlan(target) : null;
  const hasTarget = target && (target.role || target.company);

  return (
    <div data-sidebar-target className="rounded-app-panel border border-app-line bg-app-card p-3">
      {hasTarget ? (
        <>
          <Eyebrow>Target</Eyebrow>
          <p className="mt-1 text-app-ui text-app-ink-1">
            {target.role}
            {target.role && target.company ? " · " : ""}
            {target.company}
          </p>
          {target.loopDate && <p className="mt-0.5 text-app-small text-app-ink-2">Loop on {formatLoopDate(target.loopDate)}</p>}
          {plan && (
            <div className="mt-3">
              <p className="text-app-small text-app-ink-2">
                Day {plan.day} of your {plan.days}-day plan
              </p>
              <div
                role="progressbar"
                aria-label="Plan progress"
                aria-valuenow={plan.day}
                aria-valuemin={1}
                aria-valuemax={plan.days}
                className="mt-1.5 h-1 w-full rounded-full bg-app-hover"
              >
                <div className="h-full rounded-full bg-app-gold" style={{ width: `${(plan.day / plan.days) * 100}%` }} />
              </div>
            </div>
          )}
          <Link href="/settings" className="mt-2 inline-block text-app-small text-app-ink-3 hover:text-app-ink-1">
            Change
          </Link>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-app-ui text-app-ink-1">
            <Target className="h-4 w-4 text-app-ink-3" aria-hidden />
            No target yet
          </p>
          <p className="mt-1 text-app-small text-app-ink-2">Set a role and a loop date so Today can plan around it.</p>
          <Link href="/settings" className="mt-2 inline-block text-app-small text-app-sky-text hover:underline">
            Set your target
          </Link>
        </>
      )}
    </div>
  );
};

/**
 * The app's navigation column. `compact` is the 76px icon rail.
 */
export const AppSidebar = ({ compact = false }: { compact?: boolean }) => {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { target: saved } = useTarget();
  const target: SidebarTarget | null = saved
    ? { role: saved.targetRole, company: saved.targetCompany, loopDate: saved.loopDate, planStartedAt: saved.planStartedAt ? new Date(saved.planStartedAt).toISOString() : null }
    : null;

  return (
    <aside
      className={cn("app-sidebar flex w-full flex-col gap-4 border-b border-app-line bg-app-sidebar", compact ? "p-3" : "p-4")}
      aria-label="App navigation"
    >
      <div data-sidebar-brand className={cn("flex items-center", compact ? "justify-center" : "px-1")}>
        <Logo href="/dashboard" size="sm" showWordmark={!compact} />
      </div>

      <TargetCard target={target} compact={compact} />

      <nav data-sidebar-nav className="flex flex-1 flex-col gap-4" aria-label="Primary">
        {appNavigation.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {!compact && (
              <div data-sidebar-group-label>
                <Eyebrow as="div" className="px-2.5 pb-1">
                  {group.label}
                </Eyebrow>
              </div>
            )}
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={compact ? item.label : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-app-control px-2.5 text-app-ui transition-colors",
                    compact && "justify-center px-0",
                    active ? "bg-app-hover text-app-ink-1" : "text-app-ink-2 hover:bg-app-hover/60 hover:text-app-ink-1"
                  )}
                >
                  <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-app-gold" : "text-app-ink-3")} aria-hidden />
                  <span className={cn(compact && "sr-only")}>{item.label}</span>
                  {item.external && !compact && <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-app-ink-3" aria-hidden />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div data-sidebar-user className={cn("flex items-center gap-3 border-t border-app-line pt-4", compact && "justify-center")}>
        <AuthLoading>
          <UserButtonLoading />
        </AuthLoading>
        <Authenticated>
          <UserButton />
          {!compact && (
            <div data-user-text className="min-w-0">
              <p className="truncate text-app-ui text-app-ink-1">{user?.name ?? "Signed in"}</p>
              {user?.email && <p className="truncate text-app-small text-app-ink-3">{user.email}</p>}
            </div>
          )}
        </Authenticated>
        <Unauthenticated>
          {/* The sign-in control is always visible; only the explanation hides when stacked. */}
          <Link
            href="/auth?callbackUrl=/dashboard"
            className="inline-flex h-9 shrink-0 items-center rounded-app-control border border-app-line-strong px-3 text-app-ui text-app-ink-1 hover:bg-app-hover"
          >
            Sign in
          </Link>
          {!compact && (
            <div data-user-text className="min-w-0">
              <p className="text-app-ui text-app-ink-1">Guest</p>
              <p className="text-app-small text-app-ink-3">Sign in to keep your history</p>
            </div>
          )}
        </Unauthenticated>
      </div>
    </aside>
  );
};
