"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Mic, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { PillGroup } from "@/components/app/PillGroup";
import { Eyebrow } from "@/components/app/Eyebrow";
import { useSessions } from "@/features/app-data/hooks";
import { TRACK_LABELS, TRACKS } from "@/features/app-data/types";
import { computeRecent, trackLabel } from "@/features/today/compute";

const PERIODS = [
  { value: "all", label: "All time" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

export const ProgressScreen = () => {
  const { sessions, isLoading } = useSessions();
  const [track, setTrack] = useState("all");
  const [period, setPeriod] = useState("all");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const rows = useMemo(() => {
    const all = computeRecent(sessions, 1000);
    const cutoff = now !== null && period !== "all" ? now - Number(period) * 86_400_000 : null;
    return all.filter((r) => (track === "all" || r.track === track) && (cutoff === null || r.date >= cutoff));
  }, [sessions, track, period, now]);

  const tracksWithData = TRACKS.filter((t) => sessions.some((s) => s.track === t && s.report));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Progress"
        title="All reports"
        meta="Every scored round. Change compares each round with the previous one in the same track."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/interview/new">New session</Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <Eyebrow className="mb-2">Track</Eyebrow>
          <PillGroup label="Track" size="sm" value={track} onChange={setTrack} options={[{ value: "all", label: "All" }, ...tracksWithData.map((t) => ({ value: t, label: TRACK_LABELS[t] }))]} />
        </div>
        <div>
          <Eyebrow className="mb-2">Period</Eyebrow>
          <PillGroup label="Period" size="sm" value={period} onChange={setPeriod} options={PERIODS} />
        </div>
      </div>

      {isLoading || now === null ? (
        <p className="text-app-small text-app-ink-3" role="status">
          Loading
        </p>
      ) : rows.length === 0 ? (
        <EmptyState icon={Mic} text={sessions.some((s) => s.report) ? "No rounds match these filters." : "Your scored rounds will be listed here."} action={{ label: "Start a round", href: "/dashboard/interview/new" }} />
      ) : (
        <div className="overflow-x-auto rounded-app-card border border-app-line bg-app-card">
          <table className="w-full min-w-[640px] text-left text-app-small">
            <thead>
              <tr className="border-b border-app-line font-mono text-app-label uppercase text-app-ink-3">
                <th className="px-5 py-3 font-normal">Session</th>
                <th className="px-5 py-3 font-normal">Track</th>
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Length</th>
                <th className="px-5 py-3 font-normal">Score</th>
                <th className="px-5 py-3 font-normal">Change</th>
                <th className="px-5 py-3 font-normal">
                  <span className="sr-only">Report</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-app-line/60 last:border-0">
                  <td className="px-5 py-3 text-app-ink-1">{r.scenario}</td>
                  <td className="px-5 py-3 text-app-ink-2">{trackLabel(r.track)}</td>
                  <td className="px-5 py-3 text-app-ink-2">{new Date(r.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-app-ink-2">{r.lengthMin} min</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-app-ink-1">{r.score}</td>
                  <td className="px-5 py-3">
                    {r.change === null ? (
                      <span className="text-app-ink-3">—</span>
                    ) : (
                      <span className={cn("inline-flex items-center gap-1 font-mono tabular-nums", r.change >= 0 ? "text-app-sky-text" : "text-app-orange-text")}>
                        {r.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                        <span className="sr-only">{r.change >= 0 ? "up" : "down"} </span>
                        {r.change >= 0 ? "+" : ""}
                        {r.change}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
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
    </div>
  );
};
