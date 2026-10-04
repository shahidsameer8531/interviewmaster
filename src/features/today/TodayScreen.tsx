"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarClock, Check, Circle, Flame, Inbox, Mic, Target as TargetIcon, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Meter } from "@/components/app/Meter";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip } from "@/components/app/StatusChip";
import { SearchCommand } from "./SearchCommand";
import { useAppUser, useAptitudeAttempts, useCoachingRequests, useResumes, useSessions, useTarget } from "@/features/app-data/hooks";
import { STYLE_LABELS, type InterviewerStyle } from "@/features/app-data/types";
import {
  computeComingUp,
  computeFocusAreas,
  computeNextUp,
  computePlan,
  computeReadiness,
  computeRecent,
  computeWeek,
  greetingFor,
  trackLabel,
} from "./compute";

/** Time is read after mount so the server and client never disagree. */
const useNow = () => {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  return now;
};

const Card = ({ title, eyebrow, raised = false, children, className, footer }: { title?: string; eyebrow?: string; raised?: boolean; children: React.ReactNode; className?: string; footer?: React.ReactNode }) => (
  <section
    className={cn("flex flex-col rounded-app-card border border-app-line p-6", raised ? "bg-app-raised" : "bg-app-card", className)}
    aria-label={title ?? eyebrow}
  >
    {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    {title && <h2 className={cn("font-display text-app-section text-app-ink-1", eyebrow && "mt-1")}>{title}</h2>}
    <div className={cn("flex-1", (title || eyebrow) && "mt-4")}>{children}</div>
    {footer && <p className="mt-4 text-app-small text-app-ink-3">{footer}</p>}
  </section>
);

const Change = ({ value }: { value: number | null }) => {
  if (value === null) return <span className="text-app-ink-3">—</span>;
  const up = value >= 0;
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums", up ? "text-app-sky-text" : "text-app-orange-text")}>
      {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
      <span className="sr-only">{up ? "up" : "down"} </span>
      {up ? "+" : ""}
      {value}
    </span>
  );
};

export const TodayScreen = () => {
  const now = useNow();
  const { firstName, isLoading: userLoading } = useAppUser();
  const { target } = useTarget();
  const { sessions, isLoading: sessionsLoading } = useSessions();
  const { attempts } = useAptitudeAttempts();
  const { requests } = useCoachingRequests();
  const { resumes } = useResumes();

  const data = useMemo(() => {
    if (now === null) return null;
    const readiness = computeReadiness(sessions, now);
    const focus = computeFocusAreas(sessions);
    const nextUp = computeNextUp(sessions, target, readiness);
    return {
      readiness,
      focus,
      nextUp,
      plan: computePlan(sessions, attempts, nextUp, focus, now),
      week: computeWeek(sessions, attempts, now),
      comingUp: computeComingUp(requests, resumes, target, now),
      recent: computeRecent(sessions),
    };
  }, [now, sessions, attempts, requests, resumes, target]);

  const dateLine = now
    ? new Date(now).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })
    : "";
  const greeting = now ? greetingFor(new Date(now).getHours()) : "Hello";
  const loading = now === null || userLoading || sessionsLoading;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <PageHeader
        eyebrow={dateLine || "Today"}
        title={firstName ? `${greeting}, ${firstName}` : greeting}
        actions={
          <>
            <SearchCommand />
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/interview/new">New session</Link>
            </Button>
          </>
        }
      />

      {loading || !data ? (
        <div className="grid min-h-[30vh] place-items-center" role="status" aria-live="polite">
          <Eyebrow>Loading your day</Eyebrow>
        </div>
      ) : (
        <>
          {/* Next up + Today's plan */}
          <div className="grid gap-5 lg:grid-cols-12">
            <Card raised eyebrow={`Next up · ${trackLabel(data.nextUp.track)}`} className="lg:col-span-7">
              <h2 className="font-display text-app-question text-app-ink-1">{data.nextUp.title}</h2>
              {data.nextUp.why ? (
                <p className="mt-2 text-app-body text-app-ink-2">
                  <span className="text-app-ink-3">Why: </span>
                  {data.nextUp.why}
                </p>
              ) : (
                <p className="mt-2 text-app-body text-app-ink-2">One short round is enough to see how the scoring works.</p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusChip>{data.nextUp.lengthMin} min</StatusChip>
                <StatusChip>{STYLE_LABELS[data.nextUp.style as InterviewerStyle] ?? data.nextUp.style} interviewer</StatusChip>
                <StatusChip>Camera on</StatusChip>
                <StatusChip>Voice on</StatusChip>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Button asChild>
                  <Link href={data.nextUp.setupHref}>
                    <Mic className="h-4 w-4" /> Start round
                  </Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/interview/new">Pick a different round</Link>
                </Button>
              </div>
            </Card>

            <Card title="Today's plan" className="lg:col-span-5">
              <ol className="space-y-2">
                {data.plan.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-app-control px-2 py-2 text-app-body transition-colors hover:bg-app-hover"
                    >
                      {item.done ? (
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-app-sky text-app-bg">
                          <Check className="h-3 w-3" aria-hidden />
                          <span className="sr-only">Done:</span>
                        </span>
                      ) : (
                        <Circle className="h-5 w-5 shrink-0 text-app-line-strong" aria-hidden />
                      )}
                      <span className={cn("min-w-0 flex-1", item.done ? "text-app-ink-3 line-through" : "text-app-ink-1")}>{item.label}</span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-app-ink-3" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          {/* Readiness + Focus areas */}
          <div className="grid gap-5 lg:grid-cols-12">
            <Card title="Readiness" className="lg:col-span-7" footer={data.readiness.overall !== null ? "Blends your last 5 sessions in each track." : undefined}>
              {data.readiness.overall === null ? (
                <EmptyState icon={TargetIcon} text="Do one round in each track to see this." action={{ label: "Start a round", href: data.nextUp.setupHref }} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
                  <div>
                    <p className="font-display text-[52px] font-semibold leading-none tabular-nums text-app-ink-1">
                      {data.readiness.overall}
                      <span className="ml-1 font-mono text-app-label uppercase text-app-ink-3">of 100</span>
                    </p>
                    {data.readiness.change7d !== null && (
                      <StatusChip tone={data.readiness.change7d >= 0 ? "sky" : "orange"} className="mt-3">
                        {data.readiness.change7d >= 0 ? "+" : ""}
                        {data.readiness.change7d} since 7 days ago
                      </StatusChip>
                    )}
                  </div>
                  <div className="grid gap-4">
                    {data.readiness.tracks.map((t) => (
                      <Meter
                        key={t.track}
                        label={`${t.label} · ${t.count} session${t.count === 1 ? "" : "s"}`}
                        value={t.mean ?? 0}
                        tone={t.track === data.readiness.weakest ? "orange" : "sky"}
                        tag={t.track === data.readiness.weakest ? "Weakest" : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card title="Focus areas" className="lg:col-span-5">
              {data.focus.length === 0 ? (
                <EmptyState icon={Inbox} text="Your weakest dimensions from recent reports appear here." />
              ) : (
                <ul className="space-y-3">
                  {data.focus.map((f) => (
                    <li key={`${f.track}:${f.key}`} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-app-ui text-app-ink-1">{f.label}</p>
                        <p className="text-app-small text-app-ink-2">
                          <span className="font-mono tabular-nums text-app-orange-text">{f.score} of 100</span> in your last {trackLabel(f.track).toLowerCase()} round
                          {f.occurrences > 1 ? `, lowest ${f.occurrences} times` : ""}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/interview/new?track=${f.track}&focus=${encodeURIComponent(f.key)}`}
                        className="shrink-0 text-app-small font-semibold text-app-sky-text hover:underline"
                      >
                        Drill
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* This week + Coming up */}
          <div className="grid gap-5 lg:grid-cols-12">
            <Card title="This week" className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-4">
                <ol className="flex gap-1.5" aria-label="Days practised this week">
                  {data.week.days.map((d) => (
                    <li key={d.date} className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "h-8 w-8 rounded-md border",
                          d.practised ? "border-app-sky bg-app-sky" : d.isToday ? "border-dashed border-app-ink-2 bg-transparent" : "border-app-line bg-app-hover/40"
                        )}
                        aria-label={`${new Date(d.date).toLocaleDateString(undefined, { weekday: "long" })}: ${d.practised ? "practised" : d.isToday ? "today, not yet" : d.isFuture ? "upcoming" : "no practice"}`}
                      />
                      <span className="font-mono text-app-label uppercase text-app-ink-3" aria-hidden>
                        {d.label}
                      </span>
                    </li>
                  ))}
                </ol>
                {data.week.streak > 0 && (
                  <StatusChip tone="sky" icon={Flame}>
                    {data.week.streak}-day streak
                  </StatusChip>
                )}
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Practice time", `${data.week.practiceMinutes} min`],
                  ["Mock interviews", String(data.week.mockInterviews)],
                  ["Questions answered", String(data.week.questionsAnswered)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-app-panel bg-app-hover/40 p-3">
                    <dt className="font-mono text-app-label uppercase text-app-ink-3">{k}</dt>
                    <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-app-ink-1">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card title="Coming up" className="lg:col-span-5">
              {data.comingUp.length === 0 ? (
                <EmptyState
                  icon={CalendarClock}
                  text={target?.loopDate ? "Nothing else coming up." : "Add your loop date so the countdown shows here."}
                  action={target?.loopDate ? undefined : { label: "Set your target", href: "/settings" }}
                />
              ) : (
                <ul className="space-y-3">
                  {data.comingUp.map((c) => (
                    <li key={c.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-app-ui text-app-ink-1">{c.label}</p>
                        <p className="text-app-small text-app-ink-2">{c.detail}</p>
                      </div>
                      {c.href && (
                        <Link href={c.href} className="shrink-0 text-app-small font-semibold text-app-sky-text hover:underline">
                          Open
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Recent sessions */}
          <Card title="Recent sessions">
            {data.recent.length === 0 ? (
              <EmptyState icon={Mic} text="Your scored rounds will be listed here." action={{ label: "Start a round", href: data.nextUp.setupHref }} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-app-small">
                  <thead>
                    <tr className="border-b border-app-line font-mono text-app-label uppercase text-app-ink-3">
                      <th className="py-2 pr-4 font-normal">Session</th>
                      <th className="py-2 pr-4 font-normal">Track</th>
                      <th className="py-2 pr-4 font-normal">Date</th>
                      <th className="py-2 pr-4 font-normal">Length</th>
                      <th className="py-2 pr-4 font-normal">Score</th>
                      <th className="py-2 pr-4 font-normal">Change</th>
                      <th className="py-2 font-normal">
                        <span className="sr-only">Report</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((r) => (
                      <tr key={r.id} className="border-b border-app-line/60 last:border-0">
                        <td className="py-3 pr-4 text-app-ink-1">{r.scenario}</td>
                        <td className="py-3 pr-4 text-app-ink-2">{trackLabel(r.track)}</td>
                        <td className="py-3 pr-4 text-app-ink-2">{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</td>
                        <td className="py-3 pr-4 font-mono tabular-nums text-app-ink-2">{r.lengthMin} min</td>
                        <td className="py-3 pr-4 font-mono tabular-nums text-app-ink-1">{r.score}</td>
                        <td className="py-3 pr-4">
                          <Change value={r.change} />
                        </td>
                        <td className="py-3 text-right">
                          <Link href={`/dashboard/interview/${r.id}/report`} className="font-semibold text-app-sky-text hover:underline">
                            Report
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
