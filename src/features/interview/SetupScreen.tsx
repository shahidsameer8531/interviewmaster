"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, Mic, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { ChoiceCard, ChoiceCardGroup } from "@/components/app/ChoiceCard";
import { PillGroup } from "@/components/app/PillGroup";
import { Switch } from "@/components/app/Switch";
import { Field, Input, Select, Textarea } from "@/components/app/Field";
import { StatusChip } from "@/components/app/StatusChip";
import { useResumes, useSessions, useTarget } from "@/features/app-data/hooks";
import { INTERVIEWER_STYLES, TRACKS, TRACK_BLURBS, TRACK_LABELS, type InterviewerStyle, type Track } from "@/features/app-data/types";
import { DEFAULT_ROOM_OPTIONS, LENGTH_OPTIONS, QUESTIONS_FOR_LENGTH, STYLE_OPTIONS, saveRoomOptions, type RoomOptions } from "./config";
import type { Permissions } from "./CheckSetup";

const CheckSetup = dynamic(() => import("./CheckSetup"), {
  ssr: false,
  loading: () => <div className="aspect-video rounded-app-panel bg-app-sidebar ring-1 ring-app-line" aria-hidden />,
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-app-card border border-app-line bg-app-card p-6" aria-label={title}>
    <h2 className="font-display text-app-section text-app-ink-1">{title}</h2>
    <div className="mt-4 flex flex-col gap-4">{children}</div>
  </section>
);

const isTrack = (v: string | null): v is Track => Boolean(v) && (TRACKS as readonly string[]).includes(v!);
const isStyle = (v: string | null): v is InterviewerStyle => Boolean(v) && (INTERVIEWER_STYLES as readonly string[]).includes(v!);

export const SetupScreen = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { target } = useTarget();
  const { resumes } = useResumes();
  const { createSession } = useSessions();

  const [track, setTrack] = useState<Track>(isTrack(params.get("track")) ? (params.get("track") as Track) : "behavioral");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [length, setLength] = useState<number>(LENGTH_OPTIONS.includes(Number(params.get("length")) as 15) ? Number(params.get("length")) : 30);
  const [style, setStyle] = useState<InterviewerStyle>(isStyle(params.get("style")) ? (params.get("style") as InterviewerStyle) : "neutral");
  const [options, setOptions] = useState<RoomOptions>({
    ...DEFAULT_ROOM_OPTIONS,
    focus: params.get("focus") ?? undefined,
    openingQuestion: params.get("retry")?.slice(0, 600) || undefined,
  });
  const [jdOpen, setJdOpen] = useState(false);
  const [jdDraft, setJdDraft] = useState("");
  const [permissions, setPermissions] = useState<Permissions>({ camera: "idle", mic: "idle" });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prefill from the saved target once, without overwriting what the person typed.
  useEffect(() => {
    if (!target) return;
    setRole((r) => r || target.targetRole || "");
    setCompany((c) => c || target.targetCompany || "");
  }, [target]);

  const onPermissions = useCallback((p: Permissions) => setPermissions(p), []);
  const questions = QUESTIONS_FOR_LENGTH[length] ?? 3;
  const denied = (options.cameraAnalysis && permissions.camera === "denied") || (options.voiceAnalysis && permissions.mic === "denied");
  const selectedResume = useMemo(() => resumes.find((r) => r.id === options.resumeId) ?? null, [resumes, options.resumeId]);

  const start = async () => {
    setStarting(true);
    setError(null);
    try {
      const id = await createSession({ track, role: role.trim(), company: company.trim(), level: target?.targetLevel ?? "", style, lengthMin: length });
      saveRoomOptions(id, options);
      router.push(`/dashboard/interview/${id}`);
    } catch {
      setError("Could not create the session. Try again.");
      setStarting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "Mock interview", href: "/dashboard/interview/new" }, { label: "Setup" }]}
        title="Set up your round"
        meta="Choose a track and an interviewer, then check your camera and mic."
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Section title="Track">
            <ChoiceCardGroup label="Track" value={track} onChange={(v) => setTrack(v as Track)} columns={2}>
              {TRACKS.map((t) => (
                <ChoiceCard key={t} value={t} title={TRACK_LABELS[t]} description={TRACK_BLURBS[t]} />
              ))}
            </ChoiceCardGroup>
          </Section>

          <Section title="Round details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Role" htmlFor="setup-role">
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Product Manager" />
              </Field>
              <Field label="Company" htmlFor="setup-company">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Stripe" />
              </Field>
            </div>
            <div>
              <Eyebrow className="mb-2">Length</Eyebrow>
              <PillGroup
                label="Length"
                value={String(length)}
                onChange={(v) => setLength(Number(v))}
                options={LENGTH_OPTIONS.map((l) => ({ value: String(l), label: `${l} min` }))}
              />
            </div>
            <div>
              <Eyebrow className="mb-2">Interviewer</Eyebrow>
              <ChoiceCardGroup label="Interviewer" value={style} onChange={(v) => setStyle(v as InterviewerStyle)} columns={3}>
                {STYLE_OPTIONS.map((s) => (
                  <ChoiceCard key={s.value} value={s.value} title={s.title} description={s.description} />
                ))}
              </ChoiceCardGroup>
            </div>
          </Section>

          <Section title="Context and feedback">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-app-panel border border-app-line p-4">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-app-ink-3" aria-hidden />
                <div className="min-w-0">
                  <p className="text-app-ui text-app-ink-1">Resume</p>
                  <p className="truncate text-app-small text-app-ink-2">
                    {selectedResume ? `${selectedResume.name} · v${selectedResume.version}` : resumes.length ? "No resume attached" : "No saved resumes yet"}
                  </p>
                </div>
              </div>
              {resumes.length ? (
                <div className="w-full sm:w-56">
                  <label htmlFor="setup-resume" className="sr-only">
                    Choose a resume
                  </label>
                  <Select id="setup-resume" value={options.resumeId ?? ""} onChange={(e) => setOptions({ ...options, resumeId: e.target.value || undefined })}>
                    <option value="">None</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/resume">Build one</Link>
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-app-panel border border-app-line p-4">
              <div className="flex min-w-0 items-center gap-3">
                <Briefcase className="h-4 w-4 shrink-0 text-app-ink-3" aria-hidden />
                <div className="min-w-0">
                  <p className="text-app-ui text-app-ink-1">Job description</p>
                  <p className="truncate text-app-small text-app-ink-2">
                    {options.jobDescription ? `${options.jobDescription.split(/\s+/).length} words pasted` : "Paste it so the questions match the posting"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setJdDraft(options.jobDescription ?? "");
                  setJdOpen(true);
                }}
              >
                {options.jobDescription ? "Edit" : "Paste"}
              </Button>
            </div>

            <div className="grid gap-4 pt-1">
              <Switch label="Voice analysis" checked={options.voiceAnalysis} onCheckedChange={(v) => setOptions({ ...options, voiceAnalysis: v, typedAnswers: v ? false : options.typedAnswers })} />
              <Switch label="Camera analysis" description="Runs on this device" checked={options.cameraAnalysis} onCheckedChange={(v) => setOptions({ ...options, cameraAnalysis: v })} />
              <Switch
                label="Keep the recording"
                description="Saved in this browser so you can rewatch clips from the report"
                checked={options.keepRecording}
                onCheckedChange={(v) => setOptions({ ...options, keepRecording: v })}
                disabled={!options.cameraAnalysis && !options.voiceAnalysis}
              />
            </div>
          </Section>
        </div>

        <div className="lg:col-span-5">
          <div className="flex flex-col gap-4 rounded-app-card border border-app-line bg-app-card p-6 lg:sticky lg:top-6">
            <h2 className="font-display text-app-section text-app-ink-1">Check your setup</h2>

            <CheckSetup
              cameraOn={options.cameraAnalysis}
              micOn={options.voiceAnalysis}
              cameraDeviceId={options.cameraDeviceId}
              micDeviceId={options.micDeviceId}
              onDeviceChange={(next) => setOptions({ ...options, ...next })}
              onPermissions={onPermissions}
            />

            {denied && (
              <div className="rounded-app-panel border border-app-orange/30 bg-app-orange/10 p-4 text-app-small text-app-ink-1" role="alert">
                <p className="font-semibold">
                  {permissions.camera === "denied" && permissions.mic === "denied"
                    ? "Camera and microphone access was refused."
                    : permissions.camera === "denied"
                      ? "Camera access was refused."
                      : "Microphone access was refused."}
                </p>
                <p className="mt-1 text-app-ink-2">
                  To allow it, use the camera or lock icon in the address bar, set Camera and Microphone to Allow, then reload this page.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {permissions.camera === "denied" && (
                    <Button variant="outline" size="sm" onClick={() => setOptions({ ...options, cameraAnalysis: false })}>
                      Continue with voice only
                    </Button>
                  )}
                  {permissions.mic === "denied" && (
                    <Button variant="outline" size="sm" onClick={() => setOptions({ ...options, voiceAnalysis: false, typedAnswers: true })}>
                      Answer by typing
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-app-line pt-4">
              <p className="font-display text-app-section text-app-ink-1">
                {TRACK_LABELS[track]} · {length} min
              </p>
              <p className="mt-1 text-app-small text-app-ink-2">
                About {questions} questions with follow-ups. {STYLE_OPTIONS.find((s) => s.value === style)?.title} interviewer
                {role ? ` for ${role}` : ""}
                {company ? ` at ${company}` : ""}.
              </p>
              {options.typedAnswers && (
                <StatusChip className="mt-3" icon={Mic}>
                  Answering by typing
                </StatusChip>
              )}
              {options.focus && <StatusChip className="mt-3 ml-2">Drilling {options.focus}</StatusChip>}
              {options.openingQuestion && (
                <p className="mt-3 text-app-small text-app-ink-2">
                  <span className="text-app-ink-3">Opens with: </span>
                  {options.openingQuestion}
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-app-small text-app-orange-text">
                {error}
              </p>
            )}

            <Button size="lg" className="w-full" onClick={start} disabled={starting}>
              {starting ? "Creating your room" : "Start interview"}
            </Button>
            <p className="text-app-small text-app-ink-3">Video and face analysis stay in this browser. Your browser turns your speech into text, which can use its maker&apos;s speech service. Only that text is sent to the AI for feedback.</p>
          </div>
        </div>
      </div>

      <Dialog open={jdOpen} onOpenChange={setJdOpen}>
        <DialogContent className="border-app-line bg-app-card sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-app-section text-app-ink-1">Job description</DialogTitle>
            <DialogDescription className="text-app-ink-2">Paste the posting. The interviewer uses it to shape the questions.</DialogDescription>
          </DialogHeader>
          <Field label="Job description" htmlFor="setup-jd">
            <Textarea rows={10} value={jdDraft} onChange={(e) => setJdDraft(e.target.value)} placeholder="Paste the job posting here" />
          </Field>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setJdOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOptions({ ...options, jobDescription: jdDraft.trim() || undefined });
                setJdOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
