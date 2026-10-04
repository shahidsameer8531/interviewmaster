"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Brain } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { Meter } from "@/components/app/Meter";
import { PillGroup } from "@/components/app/PillGroup";
import { StatusChip } from "@/components/app/StatusChip";
import { useAptitudeAttempts } from "@/features/app-data/hooks";
import { COMPANIES, TOPICS, bankSize, questionsFor, type CompanyId } from "@/data/aptitude";
import { computeMastery, nextFocus } from "./mastery";

export const AptitudeHub = () => {
  const { attempts } = useAptitudeAttempts();
  const [company, setCompany] = useState<CompanyId>("common");
  const mastery = useMemo(() => computeMastery(attempts), [attempts]);
  const focus = useMemo(() => nextFocus(mastery), [mastery]);
  const byTopic = Object.fromEntries(mastery.map((m) => [m.topic, m]));
  const focusTopic = focus ?? TOPICS[0].id;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Aptitude"
        title="Timed practice that gets harder as you improve"
        meta="Six topics, five company patterns. After 3 correct in a row, the next question is harder."
        actions={
          <Button asChild>
            <Link href={`/dashboard/aptitude/${focusTopic}?company=${company}`}>
              {focus ? `Practise ${byTopic[focus].label.toLowerCase()}` : "Start a set"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Eyebrow>Company pattern</Eyebrow>
        <PillGroup label="Company pattern" size="sm" value={company} onChange={(v) => setCompany(v as CompanyId)} options={COMPANIES.map((c) => ({ value: c.id, label: c.label }))} />
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Topics">
        {TOPICS.map((t) => {
          const m = byTopic[t.id];
          const count = questionsFor(t.id, company).length;
          const isFocus = focus === t.id;
          return (
            <li key={t.id}>
              <Link href={`/dashboard/aptitude/${t.id}?company=${company}`} className="group flex h-full flex-col rounded-app-card border border-app-line bg-app-card p-5 transition-colors hover:border-app-line-strong hover:bg-app-raised">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Eyebrow>{t.section}</Eyebrow>
                    <h2 className="mt-1 font-display text-app-section text-app-ink-1">{t.label}</h2>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-app-control bg-app-hover text-app-ink-3 group-hover:text-app-sky">
                    <Brain className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className="mt-4">
                  {m.accuracy === null ? (
                    <p className="text-app-small text-app-ink-3">Not practised yet.</p>
                  ) : (
                    <Meter label={`Mastery · last ${m.attempts}`} value={m.accuracy} tone={isFocus ? "orange" : "sky"} tag={isFocus ? "Next focus" : undefined} />
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-app-small text-app-ink-3">
                  <StatusChip>
                    {count} {count === 1 ? "question" : "questions"} · {COMPANIES.find((c) => c.id === company)?.label}
                  </StatusChip>
                  <span>{bankSize(t.id)} in all patterns</span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
