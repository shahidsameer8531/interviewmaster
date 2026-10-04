"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, Download, Minus, Mic, RotateCcw, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Meter } from "@/components/app/Meter";
import { ScoreRing } from "@/components/app/ScoreRing";
import { StatusChip } from "@/components/app/StatusChip";
import { EmptyState } from "@/components/app/EmptyState";
import { useSession, useSessions } from "@/features/app-data/hooks";
import { STYLE_LABELS, TRACK_LABELS, type InterviewerStyle, type InterviewSession, type SessionReport, type Track } from "@/features/app-data/types";
import { DELIVERY } from "./config";
import { countFillers, markFillers, mmss } from "./delivery";
import { loadClip, loadRoomOptionsForReport } from "./recordings";
import { ORANGE_GAP, barFor, barLabel } from "./scoring";

type ScoringState = { status: "idle" | "running" | "error"; message?: string; retryable?: boolean };

const Card = ({ title, children, className, id }: { title?: string; children: React.ReactNode; className?: string; id?: string }) => (
  <section id={id} className={cn("rounded-app-card border border-app-line bg-app-card p-6", className)} aria-label={title}>
    {title && <h2 className="font-display text-app-section text-app-ink-1">{title}</h2>}
    <div className={cn(title && "mt-4")}>{children}</div>
  </section>
);

/** Answer text with sky highlights for phrases that landed and wavy orange fillers. */
const AnswerText = ({ text, highlights }: { text: string; highlights: string[] }) => {
  const segments = useMemo(() => {
    type Seg = { text: string; hit: boolean };
    let segs: Seg[] = [{ text, hit: false }];
    for (const h of highlights.filter((x) => x.trim().length > 2)) {
      const next: Seg[] = [];
      for (const seg of segs) {
        if (seg.hit) {
          next.push(seg);
          continue;
        }
        const idx = seg.text.toLowerCase().indexOf(h.toLowerCase());
        if (idx === -1) {
          next.push(seg);
          continue;
        }
        if (idx > 0) next.push({ text: seg.text.slice(0, idx), hit: false });
        next.push({ text: seg.text.slice(idx, idx + h.length), hit: true });
        if (idx + h.length < seg.text.length) next.push({ text: seg.text.slice(idx + h.length), hit: false });
      }
      segs = next;
    }
    return segs;
  }, [text, highlights]);

  return (
    <p className="text-app-body leading-relaxed text-app-ink-1">
      {segments.map((seg, i) =>
        seg.hit ? (
          <mark key={i} className="rounded-sm bg-app-sky/20 px-0.5 text-app-ink-1">
            {seg.text}
          </mark>
        ) : (
          markFillers(seg.text).map((p, k) =>
            p.filler ? (
              <mark key={`${i}-${k}`} className="bg-transparent text-app-ink-1 underline decoration-app-orange decoration-wavy underline-offset-4">
                {p.text}
              </mark>
            ) : (
              <span key={`${i}-${k}`}>{p.text}</span>
            )
          )
        )
      )}
    </p>
  );
};

const ClipRow = ({ sessionId, index }: { sessionId: string; index: number }) => {
  const [url, setUrl] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    let revoked: string | null = null;
    loadClip(sessionId, index).then((blob) => {
      if (!blob) return setUrl(null);
      revoked = URL.createObjectURL(blob);
      setUrl(revoked);
    });
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [sessionId, index]);
  if (url === undefined || url === null) return null;
  return (
    <div className="mt-4">
      <Eyebrow className="mb-2">Your clip</Eyebrow>
      <video src={url} controls className="max-h-64 w-full rounded-app-panel bg-app-sidebar" />
    </div>
  );
};

/** Filler words a minute per question, with a dashed target line. */
const FillerChart = ({ session }: { session: InterviewSession }) => {
  const rows = session.questions.map((q, i) => {
    const minutes = q.durationSec / 60;
    return { label: `Q${i + 1}`, value: minutes > 0.1 ? Math.round((countFillers(q.transcript) / minutes) * 10) / 10 : 0 };
  });
  const max = Math.max(DELIVERY.fillerMaxPerMin * 1.5, ...rows.map((r) => r.value)) || 1;
  const w = 480;
  const h = 160;
  const pad = { l: 28, r: 8, t: 16, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const slot = innerW / Math.max(1, rows.length);
  const barW = Math.min(48, slot * 0.6);
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const targetY = y(DELIVERY.fillerMaxPerMin);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" role="img" aria-label={`Filler words a minute per question: ${rows.map((r) => `${r.label} ${r.value}`).join(", ")}. Target under ${DELIVERY.fillerMaxPerMin}.`}>
      <line x1={pad.l} x2={w - pad.r} y1={targetY} y2={targetY} stroke="var(--app-ink-1)" strokeWidth="1" strokeDasharray="4 4" />
      <text x={w - pad.r} y={targetY - 4} textAnchor="end" fontSize="10" fill="var(--app-ink-3)" fontFamily="var(--font-mono)">
        target {DELIVERY.fillerMaxPerMin}
      </text>
      {rows.map((r, i) => {
        const x = pad.l + i * slot + (slot - barW) / 2;
        const over = r.value > DELIVERY.fillerMaxPerMin;
        return (
          <g key={r.label}>
            <rect x={x} y={y(r.value)} width={barW} height={Math.max(0, pad.t + innerH - y(r.value))} rx="3" fill={over ? "var(--app-orange)" : "var(--app-sky)"} />
            <text x={x + barW / 2} y={y(r.value) - 5} textAnchor="middle" fontSize="11" fill="var(--app-ink-1)" fontFamily="var(--font-mono)">
              {r.value}
            </text>
            <text x={x + barW / 2} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--app-ink-3)" fontFamily="var(--font-mono)">
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const ReportScreen = ({ sessionId }: { sessionId: string }) => {
  const session = useSession(sessionId);
  const { sessions, updateSession } = useSessions();
  const [scoring, setScoring] = useState<ScoringState>({ status: "idle" });
  const [selected, setSelected] = useState(0);
  const [pdfState, setPdfState] = useState<"idle" | "working" | "error">("idle");
  const attemptedRef = useRef(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [keptRecording, setKeptRecording] = useState(false);
  useEffect(() => setKeptRecording(loadRoomOptionsForReport(sessionId)), [sessionId]);

  const score = useCallback(async () => {
    if (!session) return;
    setScoring({ status: "running" });
    try {
      const res = await fetch("/api/interview/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track: session.track,
          role: session.role,
          company: session.company,
          level: session.level,
          style: session.style,
          questions: session.questions.map((q) => ({ text: q.text, transcript: q.transcript, durationSec: q.durationSec })),
          delivery: session.delivery,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<SessionReport> & { error?: string };
      if (!res.ok || typeof data.overall !== "number") {
        setScoring({ status: "error", message: data.error || "Couldn't score this round. Try again.", retryable: res.status !== 422 });
        return;
      }
      const report = data as SessionReport;
      await updateSession(sessionId, {
        report,
        questions: session.questions.map((q, i) => ({ ...q, score: report.questions[i]?.score })),
      });
      setScoring({ status: "idle" });
    } catch {
      setScoring({ status: "error", message: "Couldn't score this round. Try again.", retryable: true });
    }
  }, [session, sessionId, updateSession]);

  // Score once when a finished, unscored round opens.
  useEffect(() => {
    if (!session || session.status !== "done" || session.report || attemptedRef.current) return;
    attemptedRef.current = true;
    score();
  }, [session, score]);

  const previous = useMemo(() => {
    if (!session) return null;
    return (
      sessions
        .filter((s) => s.id !== session.id && s.track === session.track && s.status === "done" && s.report && (s.endedAt ?? s.startedAt) < (session.endedAt ?? session.startedAt))
        .sort((a, b) => (b.endedAt ?? b.startedAt) - (a.endedAt ?? a.startedAt))[0] ?? null
    );
  }, [sessions, session]);

  const downloadPdf = async () => {
    const node = printRef.current;
    if (!node) return;
    setPdfState("working");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(node, { backgroundColor: "#070c1c", scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;
      let offset = 0;
      const img = canvas.toDataURL("image/jpeg", 0.92);
      while (offset < imgH) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, -offset, imgW, imgH);
        offset += pageH;
      }
      pdf.save(`interview-report-${sessionId}.pdf`);
      setPdfState("idle");
    } catch {
      setPdfState("error");
    }
  };

  /* ---------------- states ---------------- */
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
  const lengthMin = session.endedAt ? Math.max(1, Math.round((session.endedAt - session.startedAt) / 60_000)) : session.lengthMin;
  const meta = `${new Date(session.startedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })} · ${lengthMin} min · ${session.questions.length} question${session.questions.length === 1 ? "" : "s"} · ${style} interviewer${session.role ? ` · ${session.role}` : ""}`;

  if (session.status === "in_progress") {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState icon={Mic} text="This round is still in progress." action={{ label: "Back to the room", href: `/dashboard/interview/${sessionId}` }} />
      </div>
    );
  }

  const report = session.report;

  if (!report) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <PageHeader breadcrumb={[{ label: "Today", href: "/dashboard" }, { label: "Report" }]} title={where ? `${where} · ${track}` : `${track} round`} meta={meta} />
        <Card>
          {scoring.status === "error" ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-app-body text-app-ink-1" role="alert">
                {scoring.message}
              </p>
              <div className="flex flex-wrap gap-2">
                {scoring.retryable !== false && (
                  <Button variant="outline" size="sm" onClick={score}>
                    <RotateCcw className="h-4 w-4" /> Try again
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/interview/new">Start a new round</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3" role="status" aria-live="polite">
              <StatusChip tone="sky" live>
                Scoring your round
              </StatusChip>
              <span className="text-app-small text-app-ink-2">Reading {session.questions.length} transcript{session.questions.length === 1 ? "" : "s"}. This takes a few seconds.</span>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* ---------------- scored ---------------- */
  const bar = barFor(session.level);
  const weakest = [...report.dimensions].sort((a, b) => a.score - b.score)[0];
  const change = previous?.report ? report.overall - previous.report.overall : null;
  const diff = report.overall - bar;
  const standing = report.summary ?? (diff >= 0 ? `${diff} point${diff === 1 ? "" : "s"} above the ${barLabel(session.level).toLowerCase()}.` : `${Math.abs(diff)} point${diff === -1 ? "" : "s"} under the ${barLabel(session.level).toLowerCase()}.`);
  const q = report.questions[selected] ?? report.questions[0];
  const sq = session.questions[q?.index ?? 0];
  const drillHref = `/dashboard/interview/new?track=${session.track}&focus=${encodeURIComponent(weakest?.label ?? "")}`;
  const nextTracks = (Object.keys(TRACK_LABELS) as Track[]).filter((t) => t !== session.track);

  return (
    <div ref={printRef} className="mx-auto flex max-w-6xl flex-col gap-5">
      <PageHeader
        breadcrumb={[{ label: "Today", href: "/dashboard" }, { label: "Progress", href: "/dashboard/progress" }, { label: "Report" }]}
        title={`${report.scenario} · ${track}`}
        meta={meta}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={downloadPdf} disabled={pdfState === "working"}>
              <Download className="h-4 w-4" /> {pdfState === "working" ? "Preparing PDF" : pdfState === "error" ? "PDF failed, try again" : "Download PDF"}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/coaching?report=${sessionId}`}>
                <Users className="h-4 w-4" /> Share with a coach
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={drillHref}>Practise the weak spots</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-12">
        <Card title="Overall" className="lg:col-span-4">
          <div className="flex items-center gap-5">
            <ScoreRing value={report.overall} />
            <div className="min-w-0">
              {change !== null ? (
                <StatusChip tone={change >= 0 ? "sky" : "orange"}>
                  {change >= 0 ? "+" : ""}
                  {change} vs your last {track.toLowerCase()} round
                </StatusChip>
              ) : (
                <StatusChip>First {track.toLowerCase()} round</StatusChip>
              )}
              <p className="mt-3 text-app-body text-app-ink-2">{standing}</p>
            </div>
          </div>
        </Card>

        <Card title="How you scored" className="lg:col-span-8">
          <p className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-app-label font-mono uppercase text-app-ink-3">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block h-3 w-0.5 bg-app-ink-1" /> {barLabel(session.level)}
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block h-2 w-3 rounded-sm bg-app-orange" /> Orange bars are more than {ORANGE_GAP} points under the bar.
            </span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {report.dimensions.map((d) => (
              <Meter
                key={d.key}
                label={d.label}
                value={d.score}
                tone={d.score < bar - ORANGE_GAP ? "orange" : "sky"}
                tag={d.key === weakest?.key ? "Weakest" : undefined}
                target={{ value: bar, label: barLabel(session.level) }}
                showLegend={false}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="border-app-sky/30">
          <Eyebrow className="text-app-sky-text">Biggest win</Eyebrow>
          <p className="mt-2 text-app-body text-app-ink-1">{report.biggestWin}</p>
        </Card>
        <Card className="border-app-orange/30">
          <Eyebrow className="text-app-orange-text">Biggest fix</Eyebrow>
          <p className="mt-2 text-app-body text-app-ink-1">{report.biggestFix}</p>
        </Card>
      </div>

      <Card title="Question by question">
        <div className="grid gap-5 lg:grid-cols-12">
          <ol className="flex flex-col gap-2 lg:col-span-4" aria-label="Questions">
            {report.questions.map((rq, i) => {
              const s = session.questions[rq.index];
              const on = i === selected;
              return (
                <li key={rq.index}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected(i)}
                    className={cn(
                      "w-full rounded-app-panel border p-3 text-left transition-colors",
                      on ? "border-transparent bg-app-raised shadow-[0_0_0_1.5px_var(--app-sky)]" : "border-app-line hover:bg-app-hover/60"
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-mono text-app-label text-app-ink-3">Q{rq.index + 1} · {mmss(s?.durationSec ?? 0)}</span>
                      <span className="font-mono text-app-small tabular-nums text-app-ink-1">{rq.score}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-app-small text-app-ink-1">{s?.text}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-app-hover">
                      <div className={cn("h-full rounded-full", rq.score < bar - ORANGE_GAP ? "bg-app-orange" : "bg-app-sky")} style={{ width: `${rq.score}%` }} />
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          {q && sq && (
            <div className="lg:col-span-8">
              <p className="font-display text-app-question text-app-ink-1">{sq.text}</p>

              <div className="mt-5">
                <Eyebrow className="mb-2">Your answer</Eyebrow>
                {sq.transcript ? (
                  <AnswerText text={sq.transcript} highlights={q.highlights ?? []} />
                ) : (
                  <p className="text-app-body text-app-ink-3">Skipped, or nothing was transcribed.</p>
                )}
                <p className="mt-2 text-app-small text-app-ink-3">
                  <mark className="rounded-sm bg-app-sky/20 px-0.5 text-app-ink-2">Sky</mark> marks what landed.{" "}
                  <span className="underline decoration-app-orange decoration-wavy underline-offset-4">Wavy orange</span> marks filler words.
                </p>
                {keptRecording && <ClipRow sessionId={sessionId} index={q.index} />}
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Eyebrow className="mb-2 text-app-sky-text">What landed</Eyebrow>
                  {q.landed.length ? (
                    <ul className="space-y-1.5">
                      {q.landed.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-app-small text-app-ink-1">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-app-sky" aria-hidden /> {t}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-app-small text-app-ink-3">Nothing stood out here.</p>
                  )}
                </div>
                <div>
                  <Eyebrow className="mb-2 text-app-orange-text">What to fix</Eyebrow>
                  {q.fix.length ? (
                    <ul className="space-y-1.5">
                      {q.fix.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-app-small text-app-ink-1">
                          <Minus className="mt-0.5 h-4 w-4 shrink-0 text-app-orange" aria-hidden /> {t}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-app-small text-app-ink-3">Nothing to fix on this one.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-app-panel border border-app-sky/25 bg-app-raised p-4">
                <Eyebrow className="mb-2">A stronger answer, in {q.strongerAnswer.length} move{q.strongerAnswer.length === 1 ? "" : "s"}</Eyebrow>
                <ol className="list-decimal space-y-1.5 pl-5 text-app-body text-app-ink-1">
                  {q.strongerAnswer.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ol>
              </div>

              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/interview/new?track=${session.track}&length=15&retry=${encodeURIComponent(sq.text)}`}>
                    <RotateCcw className="h-4 w-4" /> Retry this question
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title="Delivery">
        {session.delivery ? (
          <div className="grid gap-5 lg:grid-cols-12">
            <dl className="grid grid-cols-2 gap-3 lg:col-span-5">
              {[
                ["Pace", `${session.delivery.wpm} wpm`, `target ${DELIVERY.paceMin} to ${DELIVERY.paceMax}`],
                ["Filler words", `${session.delivery.fillerPerMin} / min`, `target under ${DELIVERY.fillerMaxPerMin}`],
                ["Eye contact", session.delivery.eyeContactPct !== undefined ? `${session.delivery.eyeContactPct}%` : "no camera signal", `target ${DELIVERY.eyeContactMinPct}% or more`],
                ["Longest pause", `${session.delivery.longestPauseSec}s`, "between words"],
              ].map(([k, v, note]) => (
                <div key={k} className="rounded-app-panel bg-app-hover/40 p-3">
                  <dt className="font-mono text-app-label uppercase text-app-ink-3">{k}</dt>
                  <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-app-ink-1">{v}</dd>
                  <dd className="text-app-small text-app-ink-3">{note}</dd>
                </div>
              ))}
            </dl>
            <div className="lg:col-span-7">
              <Eyebrow className="mb-2">Filler words a minute, per question</Eyebrow>
              <FillerChart session={session} />
            </div>
          </div>
        ) : (
          <p className="text-app-body text-app-ink-2">No delivery signals were recorded for this round.</p>
        )}
      </Card>

      <Card title="Do next">
        <ul className="divide-y divide-app-line">
          {[
            { href: drillHref, label: `Practise the weak spots`, detail: weakest ? `${weakest.label} scored ${weakest.score} of 100` : "" },
            { href: `/dashboard/interview/new?track=${nextTracks[0]}`, label: `Try a ${TRACK_LABELS[nextTracks[0]].toLowerCase()} round`, detail: "Readiness blends every track" },
            { href: "/dashboard", label: "Back to Today", detail: "See this round in your week" },
          ].map((row) => (
            <li key={row.href}>
              <Link href={row.href} className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-app-sky-text">
                <span>
                  <span className="block text-app-ui text-app-ink-1">{row.label}</span>
                  {row.detail && <span className="block text-app-small text-app-ink-3">{row.detail}</span>}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-app-ink-3" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-app-small text-app-ink-3">
          Scores come from the AI&apos;s read of your transcript and from on-device delivery signals. Treat them as practice feedback, not a hiring prediction.
        </p>
      </Card>
    </div>
  );
};

export default ReportScreen;
