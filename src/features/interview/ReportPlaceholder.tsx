"use client";

import Link from "next/link";
import { Mic } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { Eyebrow } from "@/components/app/Eyebrow";
import { StatusChip } from "@/components/app/StatusChip";
import { useSession } from "@/features/app-data/hooks";
import { STYLE_LABELS, TRACK_LABELS, type InterviewerStyle, type Track } from "@/features/app-data/types";
import { mmss } from "./delivery";

/**
 * What was saved for a round, without scores. The scored report arrives in
 * the next stop; nothing here is a made-up number.
 */
export const ReportPlaceholder = ({ sessionId }: { sessionId: string }) => {
  const session = useSession(sessionId);

  if (session === undefined) {
    return (
      <div className="grid min-h-[40vh] place-items-center" role="status">
        <Eyebrow>Loading</Eyebrow>
      </div>
    );
  }
  if (session === null) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState icon={Mic} text="This session doesn't exist or belongs to another account." action={{ label: "Set up a new round", href: "/dashboard/interview/new" }} />
      </div>
    );
  }

  const track = TRACK_LABELS[session.track as Track] ?? session.track;
  const style = STYLE_LABELS[session.style as InterviewerStyle] ?? session.style;
  const where = [session.role, session.company].filter(Boolean).join(" at ");
  const length = session.endedAt ? Math.round((session.endedAt - session.startedAt) / 60_000) : null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "Today", href: "/dashboard" }, { label: "Report" }]}
        title={where ? `${where} · ${track}` : `${track} round`}
        meta={`${new Date(session.startedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}${length !== null ? ` · ${length} min` : ""} · ${session.questions.length} question${session.questions.length === 1 ? "" : "s"} · ${style} interviewer`}
        actions={
          <>
            <StatusChip tone={session.status === "done" ? "sky" : "neutral"}>{session.status === "done" ? "Saved" : session.status === "in_progress" ? "In progress" : "Abandoned"}</StatusChip>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/interview/new">New round</Link>
            </Button>
          </>
        }
      />

      <div className="rounded-app-card border border-app-line bg-app-card p-6">
        <Eyebrow>Scoring</Eyebrow>
        <p className="mt-2 text-app-body text-app-ink-2">The scored report is not built yet. This page shows exactly what was saved for the round.</p>
      </div>

      {session.delivery && (
        <section className="rounded-app-card border border-app-line bg-app-card p-6" aria-label="Delivery">
          <h2 className="font-display text-app-section text-app-ink-1">Delivery</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Pace", `${session.delivery.wpm} wpm`],
              ["Filler words", `${session.delivery.fillerPerMin} / min`],
              ["Eye contact", session.delivery.eyeContactPct !== undefined ? `${session.delivery.eyeContactPct}%` : "no camera signal"],
              ["Longest pause", `${session.delivery.longestPauseSec}s`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-app-panel bg-app-hover/40 p-3">
                <dt className="font-mono text-app-label uppercase text-app-ink-3">{k}</dt>
                <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-app-ink-1">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rounded-app-card border border-app-line bg-app-card p-6" aria-label="Questions">
        <h2 className="font-display text-app-section text-app-ink-1">Question by question</h2>
        {session.questions.length === 0 ? (
          <p className="mt-3 text-app-body text-app-ink-2">No questions were answered in this round.</p>
        ) : (
          <ol className="mt-4 divide-y divide-app-line">
            {session.questions.map((q, i) => (
              <li key={i} className="py-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-app-label text-app-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-app-body font-medium text-app-ink-1">{q.text}</p>
                  <span className="ml-auto shrink-0 font-mono text-app-small text-app-ink-3">{mmss(q.durationSec)}</span>
                </div>
                <p className={`mt-2 pl-8 text-app-body ${q.transcript ? "text-app-ink-2" : "text-app-ink-3"}`}>{q.transcript || "Skipped, or nothing was transcribed."}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};
