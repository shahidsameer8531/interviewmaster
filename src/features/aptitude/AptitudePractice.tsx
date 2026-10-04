"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Meter } from "@/components/app/Meter";
import { StatusChip } from "@/components/app/StatusChip";
import { EmptyState } from "@/components/app/EmptyState";
import { useAptitudeAttempts } from "@/features/app-data/hooks";
import { COMPANIES, companyLabel, isCompanyId, questionsFor, topicLabel, topicSection, type AptitudeQuestion, type CompanyId, type Difficulty, type TopicId } from "@/data/aptitude";
import { computeMastery, nextFocus } from "./mastery";

const SET_SIZE = 20;
const TARGET_SEC = 60;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

const harder = (d: Difficulty): Difficulty => (d === "Easy" ? "Medium" : "Hard");
const easier = (d: Difficulty): Difficulty => (d === "Hard" ? "Medium" : "Easy");

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Splits an explanation into numbered steps on sentence or "Step" boundaries. */
const stepsOf = (text: string): string[] => {
  const byNumber = text.split(/\s*(?:\n|(?=\b\d+[.)]\s))/).map((s) => s.replace(/^\d+[.)]\s*/, "").trim()).filter(Boolean);
  if (byNumber.length > 1) return byNumber;
  const bySentence = text.split(/(?<=[.!?])\s+(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);
  return bySentence.length ? bySentence : [text];
};

type Answered = { id: string; correct: boolean; timeSec: number };

export const AptitudePractice = ({ topic }: { topic: TopicId }) => {
  const router = useRouter();
  const params = useSearchParams();
  const companyParam = params.get("company") ?? "common";
  const company: CompanyId = isCompanyId(companyParam) ? companyParam : "common";
  const { attempts, recordAttempt } = useAptitudeAttempts();

  const bank = useMemo(() => questionsFor(topic, company), [topic, company]);
  const mastery = useMemo(() => computeMastery(attempts), [attempts]);
  const focus = useMemo(() => nextFocus(mastery), [mastery]);

  const [queue, setQueue] = useState<AptitudeQuestion[]>([]);
  const [extra, setExtra] = useState<AptitudeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [streak, setStreak] = useState(0);
  const [ended, setEnded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [more, setMore] = useState<"idle" | "loading" | "error">("idle");
  const [moreError, setMoreError] = useState<string | null>(null);
  const startRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const usedRef = useRef(new Set<string>());

  const total = Math.min(SET_SIZE, bank.length + extra.length) || SET_SIZE;

  // Pick the next question at the wanted difficulty, falling back to any unused one.
  const pickNext = useCallback(
    (want: Difficulty) => {
      const pool = [...bank, ...extra].filter((q) => !usedRef.current.has(q.id));
      const atLevel = pool.filter((q) => q.difficulty === want);
      const source = atLevel.length ? atLevel : pool;
      if (!source.length) return null;
      const q = source[Math.floor(Math.random() * source.length)];
      usedRef.current.add(q.id);
      return q;
    },
    [bank, extra]
  );

  useEffect(() => {
    if (queue.length === 0 && bank.length) {
      const first = pickNext("Medium");
      if (first) setQueue([first]);
    }
  }, [bank, queue.length, pickNext]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const current = queue[index];
  const elapsedSec = Math.floor((now - startRef.current) / 1000);
  const budgetSec = total * TARGET_SEC;
  const leftSec = Math.max(0, budgetSec - elapsedSec);
  const onQuestionSec = Math.floor((now - questionStartRef.current) / 1000);

  useEffect(() => {
    if (leftSec === 0 && !ended && answered.length > 0) setEnded(true);
  }, [leftSec, ended, answered.length]);

  const check = async () => {
    if (!current || picked === null || checked) return;
    const correct = picked === current.correctIndex;
    const timeSec = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000));
    setChecked(true);
    setAnswered((a) => [...a, { id: current.id, correct, timeSec }]);
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    if (nextStreak > 0 && nextStreak % 3 === 0) setDifficulty((d) => harder(d));
    if (!correct) setDifficulty((d) => easier(d));
    await recordAttempt({ topic, company, questionId: current.id, correct, timeSec });
  };

  const next = () => {
    if (answered.length >= total) {
      setEnded(true);
      return;
    }
    const q = pickNext(difficulty);
    if (!q) {
      setEnded(true);
      return;
    }
    setQueue((qs) => [...qs, q]);
    setIndex((i) => i + 1);
    setPicked(null);
    setChecked(false);
    setShowHint(false);
    questionStartRef.current = Date.now();
  };

  const fetchMore = async () => {
    setMore("loading");
    setMoreError(null);
    try {
      const res = await fetch("/api/aptitude/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, count: 5, avoid: queue.slice(-10).map((q) => q.question) }),
      });
      const data = (await res.json().catch(() => ({}))) as { questions?: { question: string; options: string[]; correctIndex: number; explanation: string; hint?: string; category?: string }[]; error?: string };
      if (!res.ok || !data.questions?.length) throw new Error(data.error || "Couldn't get more questions. Try again.");
      const generated: AptitudeQuestion[] = data.questions.map((g, i) => ({
        id: `${topic}:gen:${Date.now()}:${i}`,
        topic,
        company,
        question: g.question,
        options: g.options,
        correctIndex: g.correctIndex,
        explanation: g.explanation,
        category: g.category ?? topicLabel(topic),
        difficulty,
        hints: g.hint ? [g.hint] : [],
      }));
      setExtra((e) => [...e, ...generated]);
      setMore("idle");
    } catch (err) {
      setMoreError(err instanceof Error ? err.message : "Couldn't get more questions. Try again.");
      setMore("error");
    }
  };

  const correctCount = answered.filter((a) => a.correct).length;
  const accuracy = answered.length ? Math.round((correctCount / answered.length) * 100) : null;
  const avgTime = answered.length ? Math.round(answered.reduce((s, a) => s + a.timeSec, 0) / answered.length) : null;
  const inARow = (() => {
    let n = 0;
    for (let i = answered.length - 1; i >= 0 && answered[i].correct; i--) n++;
    return n;
  })();
  const poolLeft = [...bank, ...extra].filter((q) => !usedRef.current.has(q.id)).length;
  const breadcrumb = [{ label: "Aptitude", href: "/dashboard/aptitude" }, { label: topicSection(topic) }, { label: `${companyLabel(company)} pattern` }];

  if (bank.length === 0) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState icon={Lightbulb} text={`No ${companyLabel(company)} questions for ${topicLabel(topic).toLowerCase()} yet.`} action={{ label: "Back to topics", href: "/dashboard/aptitude" }} />
      </div>
    );
  }

  if (ended) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <PageHeader breadcrumb={breadcrumb} title={`${topicLabel(topic)} · set finished`} meta={`${answered.length} question${answered.length === 1 ? "" : "s"} in ${mmss(elapsedSec)}`} />
        <div className="rounded-app-card border border-app-line bg-app-card p-6">
          <dl className="grid grid-cols-3 gap-3">
            {[
              ["Accuracy", accuracy !== null ? `${accuracy}%` : "—"],
              ["Correct", `${correctCount} of ${answered.length}`],
              ["Average time", avgTime !== null ? `${avgTime}s` : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-app-panel bg-app-hover/40 p-3">
                <dt className="font-mono text-app-label uppercase text-app-ink-3">{k}</dt>
                <dd className="mt-1 font-display text-xl font-semibold tabular-nums text-app-ink-1">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => router.refresh()} asChild>
              <Link href={`/dashboard/aptitude/${topic}?company=${company}&again=${Date.now()}`}>Another set</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/aptitude">Back to topics</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="grid min-h-[40vh] place-items-center" role="status">
        <Eyebrow>Loading</Eyebrow>
      </div>
    );
  }

  const hint = current.hints[0];
  const steps = stepsOf(current.explanation);
  const summary = `${correctCount} correct, ${answered.length - correctCount} wrong, question ${index + 1} now, ${Math.max(0, total - answered.length - 1)} to go`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <PageHeader
        breadcrumb={breadcrumb}
        title={topicLabel(topic)}
        meta={`Question ${index + 1} of ${total} · ${mmss(leftSec)} left`}
        actions={
          <Button variant="outline" size="sm" onClick={() => setEnded(true)} disabled={answered.length === 0}>
            End session
          </Button>
        }
      />

      {/* Progress strip */}
      <ol className="flex gap-1" aria-label={summary}>
        {Array.from({ length: total }, (_, i) => {
          const a = answered[i];
          const cls = a ? (a.correct ? "bg-app-sky" : "bg-app-orange") : i === index ? "bg-app-ink-1" : "bg-app-hover";
          return <li key={i} className={cn("h-1.5 flex-1 rounded-full", cls)} aria-hidden />;
        })}
      </ol>

      <div className="grid gap-5 lg:grid-cols-12">
        <section className="rounded-app-card border border-app-line bg-app-card p-6 lg:col-span-8" aria-label="Question">
          <div className="flex flex-wrap items-center gap-2">
            <StatusChip tone={current.difficulty === "Hard" ? "orange" : "neutral"}>{current.difficulty}</StatusChip>
            <StatusChip>{companyLabel(current.company)}</StatusChip>
            {current.category && <StatusChip>{current.category}</StatusChip>}
            <span className="ml-auto font-mono text-app-small tabular-nums text-app-ink-3">{mmss(onQuestionSec)} on this question</span>
          </div>

          <p className="mt-5 whitespace-pre-line font-display text-app-question text-app-ink-1">{current.question}</p>

          <div role="radiogroup" aria-label="Answer options" className="mt-5 grid gap-2">
            {current.options.map((o, i) => {
              const isPick = picked === i;
              const isRight = i === current.correctIndex;
              let cls = "border-app-line-strong bg-transparent text-app-ink-1 hover:bg-app-hover";
              let note: string | null = null;
              if (!checked && isPick) cls = "border-app-ink-1 bg-app-hover text-app-ink-1";
              if (checked) {
                if (isRight) {
                  cls = "border-app-sky bg-app-sky/10 text-app-ink-1";
                  note = "Correct answer";
                } else if (isPick) {
                  cls = "border-app-orange bg-app-orange/10 text-app-ink-1";
                  note = "Your answer";
                } else cls = "border-app-line text-app-ink-3";
              }
              return (
                <label key={i} className={cn("flex min-h-[44px] cursor-pointer items-center gap-3 rounded-app-control border px-3 py-2.5 text-app-body transition-colors", cls, checked && "cursor-default")}>
                  <input type="radio" name="option" className="peer sr-only" checked={isPick} disabled={checked} onChange={() => setPicked(i)} />
                  <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border font-mono text-app-small", checked && isRight ? "border-app-sky bg-app-sky text-app-bg" : checked && isPick ? "border-app-orange bg-app-orange text-app-bg" : "border-app-line-strong")}>{LETTERS[i]}</span>
                  <span className="flex-1">{o}</span>
                  {note && <span className={cn("font-mono text-app-label uppercase", isRight ? "text-app-sky-text" : "text-app-orange-text")}>{note}</span>}
                </label>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {!checked ? (
              <Button onClick={check} aria-disabled={picked === null} disabled={picked === null}>
                Check answer
              </Button>
            ) : (
              <Button onClick={next}>
                Next question <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {hint && !checked && (
              <Button variant="ghost" size="sm" onClick={() => setShowHint((v) => !v)} aria-pressed={showHint}>
                <Lightbulb className="h-4 w-4" /> Hint
              </Button>
            )}
            {!checked && !hint && <span className="text-app-small text-app-ink-3">No hint for this one.</span>}
          </div>

          {showHint && hint && !checked && (
            <div className="mt-4 rounded-app-panel border border-app-sky/30 bg-app-sky/10 p-4 text-app-body text-app-ink-1">
              <Eyebrow className="mb-1 text-app-sky-text">Hint</Eyebrow>
              {hint}
            </div>
          )}

          {checked && (
            <div className="mt-5 rounded-app-panel border border-app-line bg-app-raised p-4">
              <Eyebrow className="mb-2">Explanation</Eyebrow>
              <ol className="list-decimal space-y-1.5 pl-5 text-app-body text-app-ink-1">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          )}

          {poolLeft === 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-app-line pt-4">
              <span className="text-app-small text-app-ink-2">You have used every {companyLabel(company)} question in this topic.</span>
              <Button variant="outline" size="sm" onClick={fetchMore} disabled={more === "loading"}>
                {more === "loading" ? "Writing questions" : "More questions"}
              </Button>
              {moreError && (
                <span className="text-app-small text-app-orange-text" role="alert">
                  {moreError}
                </span>
              )}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:col-span-4">
          <section className="rounded-app-card border border-app-line bg-app-card p-5" aria-label="This session">
            <h2 className="font-display text-app-section text-app-ink-1">This session</h2>
            <dl className="mt-3 grid gap-3">
              <div className="flex items-baseline justify-between">
                <dt className="text-app-small text-app-ink-2">Accuracy</dt>
                <dd className="font-mono tabular-nums text-app-ink-1">{accuracy !== null ? `${accuracy}%` : "—"}</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-app-small text-app-ink-2">Average time</dt>
                <dd className="font-mono tabular-nums text-app-ink-1">
                  {avgTime !== null ? `${avgTime}s` : "—"} <span className="text-app-ink-3">of {TARGET_SEC}s target</span>
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-app-small text-app-ink-2">Correct in a row</dt>
                <dd className="font-mono tabular-nums text-app-ink-1">{inARow}</dd>
              </div>
            </dl>
            <p className="mt-4 text-app-small text-app-ink-3">After 3 correct in a row, the next question is harder. Now at {difficulty.toLowerCase()}.</p>
          </section>

          <section className="rounded-app-card border border-app-line bg-app-card p-5" aria-label="Topic mastery">
            <h2 className="font-display text-app-section text-app-ink-1">Topic mastery</h2>
            <div className="mt-3 grid gap-3">
              {mastery.map((m) => (
                <Meter key={m.topic} label={m.label} value={m.accuracy ?? 0} tone={m.accuracy === null ? "neutral" : focus === m.topic ? "orange" : "sky"} tag={focus === m.topic ? "Next focus" : undefined} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {COMPANIES.map((c) => (
                <Link key={c.id} href={`/dashboard/aptitude/${topic}?company=${c.id}`} className={cn("rounded-full border px-2.5 py-1 text-app-small", c.id === company ? "border-app-ink-1 bg-app-ink-1 text-app-bg" : "border-app-line-strong text-app-ink-2 hover:bg-app-hover")}>
                  {c.label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};
