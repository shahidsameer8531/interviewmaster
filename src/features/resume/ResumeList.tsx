"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip } from "@/components/app/StatusChip";
import { useResumes } from "@/features/app-data/hooks";
import { emptyResume, timeAgo } from "./model";

export const ResumeList = () => {
  const router = useRouter();
  const { resumes, isLoading, createResume } = useResumes();
  const [creating, setCreating] = useState(false);

  const create = async () => {
    setCreating(true);
    try {
      const id = await createResume({ name: `Resume ${resumes.length + 1}`, data: emptyResume() });
      router.push(`/dashboard/resume/${id}`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Resume"
        title="Your resumes"
        meta="Build one per target role. Each keeps its own job description and match score."
        actions={
          <Button onClick={create} disabled={creating}>
            <Plus className="h-4 w-4" /> {creating ? "Creating" : "New resume"}
          </Button>
        }
      />

      {isLoading ? (
        <p className="text-app-small text-app-ink-3" role="status">
          Loading
        </p>
      ) : resumes.length === 0 ? (
        <EmptyState icon={FileText} text="No resumes saved yet. Start one and the builder opens with a blank sheet." />
      ) : (
        <div className="overflow-x-auto rounded-app-card border border-app-line bg-app-card">
          <table className="w-full min-w-[560px] text-left text-app-small">
            <thead>
              <tr className="border-b border-app-line font-mono text-app-label uppercase text-app-ink-3">
                <th className="px-5 py-3 font-normal">Name</th>
                <th className="px-5 py-3 font-normal">Version</th>
                <th className="px-5 py-3 font-normal">Updated</th>
                <th className="px-5 py-3 font-normal">Job match</th>
                <th className="px-5 py-3 font-normal">
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {resumes.map((r) => (
                <tr key={r.id} className="border-b border-app-line/60 last:border-0">
                  <td className="px-5 py-3 text-app-ink-1">{r.name}</td>
                  <td className="px-5 py-3 font-mono text-app-ink-2">v{r.version}</td>
                  <td className="px-5 py-3 text-app-ink-2">{timeAgo(r.updatedAt)}</td>
                  <td className="px-5 py-3">
                    {typeof r.atsScore === "number" ? (
                      <StatusChip tone={r.atsScore >= 70 ? "sky" : "orange"}>{r.atsScore} of 100</StatusChip>
                    ) : (
                      <span className="text-app-ink-3">Not checked</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/dashboard/resume/${r.id}`} className="font-semibold text-app-sky-text hover:underline">
                      Open
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
