"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronDown, ChevronUp, Download, FileText, GripVertical, Plus, Trash2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Eyebrow } from "@/components/app/Eyebrow";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip } from "@/components/app/StatusChip";
import { Field, Input, Select, Textarea } from "@/components/app/Field";
import { useResumes } from "@/features/app-data/hooks";
import { ResumePreview } from "./ResumePreview";
import {
  DEFAULT_ORDER,
  SECTION_KEYS,
  SECTION_LABELS,
  emptyResume,
  needsResult,
  orderOf,
  sectionStatus,
  timeAgo,
  type Experience,
  type ResumeDoc,
  type SectionKey,
} from "./model";

/* ------------------------------ Sections column ------------------------------ */

const SortableSection = ({
  id,
  doc,
  active,
  onSelect,
  onMove,
  onRemove,
  canMoveUp,
  canMoveDown,
}: {
  id: SectionKey;
  doc: ResumeDoc;
  active: boolean;
  onSelect: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const status = sectionStatus(doc, id);
  const locked = id === "personalInfo";
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("rounded-app-panel border", active ? "border-transparent bg-app-raised shadow-[0_0_0_1.5px_var(--app-sky)]" : "border-app-line bg-app-card", isDragging && "opacity-70")}>
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          className="grid h-9 w-7 shrink-0 cursor-grab place-items-center rounded-md text-app-ink-3 hover:text-app-ink-1"
          aria-label={`Drag to reorder ${SECTION_LABELS[id]}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" onClick={onSelect} aria-current={active ? "true" : undefined} className="min-w-0 flex-1 rounded-md px-1 py-1.5 text-left">
          <span className="block truncate text-app-ui text-app-ink-1">{SECTION_LABELS[id]}</span>
          <span className="mt-0.5 flex items-center gap-1 text-app-small">
            {status.kind === "complete" && <Check className="h-3.5 w-3.5 text-app-sky" aria-hidden />}
            <span className={status.kind === "complete" ? "text-app-sky-text" : status.kind === "too-long" ? "text-app-orange-text" : "text-app-ink-3"}>{status.label}</span>
          </span>
        </button>
        {/* Keyboard fallback for reordering. */}
        <div className="flex shrink-0 flex-col">
          <button type="button" onClick={() => onMove(-1)} disabled={!canMoveUp} className="grid h-5 w-7 place-items-center rounded text-app-ink-3 hover:text-app-ink-1 disabled:opacity-30" aria-label={`Move ${SECTION_LABELS[id]} up`}>
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={!canMoveDown} className="grid h-5 w-7 place-items-center rounded text-app-ink-3 hover:text-app-ink-1 disabled:opacity-30" aria-label={`Move ${SECTION_LABELS[id]} down`}>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        {!locked && (
          <button type="button" onClick={onRemove} className="grid h-9 w-7 shrink-0 place-items-center rounded-md text-app-ink-3 hover:text-app-rec" aria-label={`Remove ${SECTION_LABELS[id]} section`}>
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );
};

/* ------------------------------ Bullet with rewrite ------------------------------ */

type Suggestion = { text: string; history: string[] };

const BulletEditor = ({
  value,
  id,
  context,
  onChange,
  onRemove,
  onFocus,
  onBlur,
}: {
  value: string;
  id: string;
  context: { role?: string; company?: string; jobDescription?: string };
  onChange: (v: string) => void;
  onRemove: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) => {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const flagged = needsResult(value);

  const fetchRewrite = async (history: string[]) => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/resume/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: value, role: context.role, company: context.company, jobDescription: context.jobDescription, avoid: history }),
      });
      const data = (await res.json().catch(() => ({}))) as { rewrite?: string; error?: string };
      if (!res.ok || !data.rewrite) throw new Error(data.error || "Couldn't rewrite this bullet. Try again.");
      setSuggestion({ text: data.rewrite, history: [...history, data.rewrite] });
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't rewrite this bullet. Try again.");
      setState("error");
    }
  };

  return (
    <div className="rounded-app-panel border border-app-line p-2">
      <div className="flex items-start gap-2">
        <span className="mt-2 grid h-7 w-6 shrink-0 place-items-center text-app-ink-3" aria-hidden>
          <GripVertical className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <label htmlFor={id} className="sr-only">
            Bullet point
          </label>
          <Textarea id={id} rows={2} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur} placeholder="What you did and what changed because of it" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {flagged && (
              <>
                <StatusChip tone="orange">No result or number yet</StatusChip>
                {!suggestion && (
                  <Button variant="ghost" size="sm" onClick={() => fetchRewrite([])} disabled={state === "loading"}>
                    {state === "loading" ? "Thinking" : "Suggest a rewrite"}
                  </Button>
                )}
              </>
            )}
            {error && (
              <span className="text-app-small text-app-orange-text" role="alert">
                {error}
              </span>
            )}
          </div>
          {suggestion && (
            <div className="mt-2 rounded-app-panel border border-app-sky/40 bg-app-sky/10 p-3">
              <Eyebrow className="text-app-sky-text">Suggested rewrite</Eyebrow>
              <p className="mt-1 text-app-body text-app-ink-1">{suggestion.text}</p>
              <p className="mt-1 text-app-small text-app-ink-3">Fill in the brackets with your real numbers. We won&apos;t guess them.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange(suggestion.text);
                    setSuggestion(null);
                  }}
                >
                  Use this
                </Button>
                <Button variant="ghost" size="sm" onClick={() => fetchRewrite(suggestion.history)} disabled={state === "loading"}>
                  {state === "loading" ? "Thinking" : "Try another"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSuggestion(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
        <button type="button" onClick={onRemove} className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-app-ink-3 hover:text-app-rec" aria-label="Remove bullet">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

/* ------------------------------ Section editors ------------------------------ */

const ListHeader = ({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) => (
  <div className="flex items-center justify-between">
    <h2 className="font-display text-app-section text-app-ink-1">{title}</h2>
    <Button variant="outline" size="sm" onClick={onAdd}>
      <Plus className="h-4 w-4" /> {addLabel}
    </Button>
  </div>
);

const ItemFrame = ({ children, onRemove, label }: { children: React.ReactNode; onRemove: () => void; label: string }) => (
  <div className="rounded-app-panel border border-app-line p-4">
    <div className="flex items-center justify-between">
      <Eyebrow>{label}</Eyebrow>
      <button type="button" onClick={onRemove} className="grid h-8 w-8 place-items-center rounded-md text-app-ink-3 hover:text-app-rec" aria-label={`Remove ${label}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
    <div className="mt-3 grid gap-3">{children}</div>
  </div>
);

/* ------------------------------ Builder ------------------------------ */

export const ResumeBuilder = ({ resumeId }: { resumeId: string }) => {
  const { resumes, isLoading, updateResume } = useResumes();
  const resume = resumes.find((r) => r.id === resumeId) ?? null;

  const [doc, setDoc] = useState<ResumeDoc | null>(null);
  const [name, setName] = useState("");
  const [active, setActive] = useState<SectionKey>("personalInfo");
  const [editingBullet, setEditingBullet] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [now, setNow] = useState(() => Date.now());
  const [jd, setJd] = useState("");
  const [match, setMatch] = useState<{ score: number; found: string[]; missing: string[]; checks: { label: string; ok: boolean }[] } | null>(null);
  const [matchState, setMatchState] = useState<"idle" | "loading" | "error">("idle");
  const [matchError, setMatchError] = useState<string | null>(null);
  const [exportState, setExportState] = useState<"idle" | "pdf" | "docx" | "error">("idle");
  const sheetRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false);

  // Load once; later edits flow from local state to storage, not back.
  useEffect(() => {
    if (loadedRef.current || !resume) return;
    loadedRef.current = true;
    const data = (resume.data ?? {}) as Partial<ResumeDoc>;
    setDoc({ ...emptyResume(), ...data, personalInfo: { ...emptyResume().personalInfo, ...(data.personalInfo ?? {}) } });
    setName(resume.name);
    setJd(resume.jobDescription ?? "");
    if (typeof resume.atsScore === "number") setMatch({ score: resume.atsScore, found: [], missing: [], checks: [] });
  }, [resume]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  // Autosave, debounced.
  useEffect(() => {
    if (!doc || !dirtyRef.current) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await updateResume(resumeId, { data: doc, name: name.trim() || "Untitled resume" });
        dirtyRef.current = false;
        setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [doc, name, resumeId, updateResume]);

  const patch = useCallback((fn: (d: ResumeDoc) => ResumeDoc) => {
    dirtyRef.current = true;
    setDoc((d) => (d ? fn(d) : d));
  }, []);

  const order = useMemo(() => (doc ? orderOf(doc) : DEFAULT_ORDER), [doc]);
  const available = SECTION_KEYS.filter((k) => !order.includes(k));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const from = order.indexOf(a.id as SectionKey);
    const to = order.indexOf(over.id as SectionKey);
    if (from < 0 || to < 0) return;
    patch((d) => ({ ...d, sectionOrder: arrayMove(order, from, to) }));
  };
  const move = (key: SectionKey, dir: -1 | 1) => {
    const i = order.indexOf(key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= order.length) return;
    patch((d) => ({ ...d, sectionOrder: arrayMove(order, i, j) }));
  };
  const removeSection = (key: SectionKey) => {
    patch((d) => ({ ...d, sectionOrder: order.filter((k) => k !== key) }));
    if (active === key) setActive("personalInfo");
  };
  const addSection = (key: SectionKey) => {
    patch((d) => ({ ...d, sectionOrder: [...order, key] }));
    setActive(key);
  };

  const checkMatch = async () => {
    if (!doc) return;
    setMatchState("loading");
    setMatchError(null);
    try {
      const res = await fetch("/api/resume/analyze-ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: doc, jobDescription: jd.trim() || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as { score?: number; found?: string[]; missing?: string[]; checks?: { label: string; ok: boolean }[]; error?: string };
      if (!res.ok || typeof data.score !== "number") throw new Error(data.error || "Couldn't score this resume. Try again.");
      setMatch({ score: data.score, found: data.found ?? [], missing: data.missing ?? [], checks: data.checks ?? [] });
      setMatchState("idle");
      await updateResume(resumeId, { atsScore: data.score, jobDescription: jd.trim() || undefined });
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : "Couldn't score this resume. Try again.");
      setMatchState("error");
    }
  };

  const downloadPdf = async () => {
    const node = sheetRef.current;
    if (!node) return;
    setExportState("pdf");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const canvas = await html2canvas(node, { backgroundColor: "#ffffff", scale: 2 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      const img = canvas.toDataURL("image/jpeg", 0.95);
      let offset = 0;
      while (offset < imgH) {
        if (offset > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, -offset, pageW, imgH);
        offset += pageH;
      }
      pdf.save(`${(name || "resume").replace(/[^\w-]+/g, "-")}.pdf`);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  };

  const exportDocx = async () => {
    if (!doc) return;
    setExportState("docx");
    try {
      const { generateDocx } = await import("@/app/(marketing)/products/resume-builder/features/ai-resume/utils/docx-generator");
      const blob = await generateDocx(doc, doc.template ?? "modern");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(name || "resume").replace(/[^\w-]+/g, "-")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportState("idle");
    } catch {
      setExportState("error");
    }
  };

  /* ---------------- states ---------------- */
  if (isLoading && !resume) {
    return (
      <div className="grid min-h-[40vh] place-items-center" role="status">
        <Eyebrow>Loading</Eyebrow>
      </div>
    );
  }
  if (!resume || !doc) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState icon={FileText} text="This resume doesn't exist or belongs to another account." action={{ label: "Your resumes", href: "/dashboard/resume" }} />
      </div>
    );
  }

  const ctx = { role: doc.experiences[0]?.position, company: doc.experiences[0]?.company, jobDescription: jd || undefined };
  const setExp = (i: number, fn: (e: Experience) => Experience) => patch((d) => ({ ...d, experiences: d.experiences.map((e, k) => (k === i ? fn(e) : e)) }));

  const editor = (() => {
    switch (active) {
      case "personalInfo":
        return (
          <div className="grid gap-4">
            <h2 className="font-display text-app-section text-app-ink-1">Contact and summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="pi-name" required>
                <Input value={doc.personalInfo.fullName} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, fullName: e.target.value } }))} />
              </Field>
              <Field label="Email" htmlFor="pi-email" required>
                <Input type="email" value={doc.personalInfo.email} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, email: e.target.value } }))} />
              </Field>
              <Field label="Phone" htmlFor="pi-phone">
                <Input value={doc.personalInfo.phone} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, phone: e.target.value } }))} />
              </Field>
              <Field label="Location" htmlFor="pi-location">
                <Input value={doc.personalInfo.location} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, location: e.target.value } }))} />
              </Field>
              <Field label="LinkedIn" htmlFor="pi-linkedin">
                <Input value={doc.personalInfo.linkedin ?? ""} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, linkedin: e.target.value } }))} />
              </Field>
              <Field label="Portfolio" htmlFor="pi-portfolio">
                <Input value={doc.personalInfo.portfolio ?? ""} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, portfolio: e.target.value } }))} />
              </Field>
            </div>
            <Field label="Summary" htmlFor="pi-summary" hint="Two or three sentences. Under 90 words reads best.">
              <Textarea rows={4} value={doc.personalInfo.summary} onChange={(e) => patch((d) => ({ ...d, personalInfo: { ...d.personalInfo, summary: e.target.value } }))} />
            </Field>
          </div>
        );
      case "experiences":
        return (
          <div className="grid gap-4">
            <ListHeader title="Experience" addLabel="Add role" onAdd={() => patch((d) => ({ ...d, experiences: [...d.experiences, { company: "", position: "", startDate: "", endDate: "", current: false, description: [""], technologies: [] }] }))} />
            {doc.experiences.length === 0 && <p className="text-app-small text-app-ink-3">No roles yet.</p>}
            {doc.experiences.map((e, i) => (
              <ItemFrame key={i} label={`Role ${i + 1}`} onRemove={() => patch((d) => ({ ...d, experiences: d.experiences.filter((_, k) => k !== i) }))}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Position" htmlFor={`exp-${i}-position`}>
                    <Input value={e.position} onChange={(ev) => setExp(i, (x) => ({ ...x, position: ev.target.value }))} />
                  </Field>
                  <Field label="Company" htmlFor={`exp-${i}-company`}>
                    <Input value={e.company} onChange={(ev) => setExp(i, (x) => ({ ...x, company: ev.target.value }))} />
                  </Field>
                  <Field label="Start" htmlFor={`exp-${i}-start`}>
                    <Input placeholder="Jan 2022" value={e.startDate} onChange={(ev) => setExp(i, (x) => ({ ...x, startDate: ev.target.value }))} />
                  </Field>
                  <Field label="End" htmlFor={`exp-${i}-end`} hint={e.current ? "Current role" : undefined}>
                    <Input placeholder="Present" value={e.current ? "" : e.endDate} disabled={e.current} onChange={(ev) => setExp(i, (x) => ({ ...x, endDate: ev.target.value }))} />
                  </Field>
                </div>
                <label className="flex items-center gap-2 text-app-small text-app-ink-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#7cc4ff]" checked={e.current} onChange={(ev) => setExp(i, (x) => ({ ...x, current: ev.target.checked }))} /> I still work here
                </label>
                <div>
                  <div className="flex items-center justify-between">
                    <Eyebrow>Bullets</Eyebrow>
                    <Button variant="ghost" size="sm" onClick={() => setExp(i, (x) => ({ ...x, description: [...x.description, ""] }))}>
                      <Plus className="h-4 w-4" /> Add bullet
                    </Button>
                  </div>
                  <div className="mt-2 grid gap-2">
                    {e.description.map((b, j) => (
                      <BulletEditor
                        key={j}
                        id={`exp-${i}-bullet-${j}`}
                        value={b}
                        context={{ ...ctx, role: e.position || ctx.role, company: e.company || ctx.company }}
                        onChange={(v) => setExp(i, (x) => ({ ...x, description: x.description.map((d, k) => (k === j ? v : d)) }))}
                        onRemove={() => setExp(i, (x) => ({ ...x, description: x.description.filter((_, k) => k !== j) }))}
                        onFocus={() => setEditingBullet(`exp-${i}-${j}`)}
                        onBlur={() => setEditingBullet(null)}
                      />
                    ))}
                  </div>
                </div>
                <Field label="Technologies" htmlFor={`exp-${i}-tech`} hint="Comma separated.">
                  <Input value={(e.technologies ?? []).join(", ")} onChange={(ev) => setExp(i, (x) => ({ ...x, technologies: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} />
                </Field>
              </ItemFrame>
            ))}
          </div>
        );
      case "education":
        return (
          <div className="grid gap-4">
            <ListHeader title="Education" addLabel="Add education" onAdd={() => patch((d) => ({ ...d, education: [...d.education, { institution: "", degree: "", field: "", startDate: "", endDate: "" }] }))} />
            {doc.education.map((e, i) => (
              <ItemFrame key={i} label={`Education ${i + 1}`} onRemove={() => patch((d) => ({ ...d, education: d.education.filter((_, k) => k !== i) }))}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["degree", "field", "institution", "gpa", "startDate", "endDate"] as const).map((f) => (
                    <Field key={f} label={{ degree: "Degree", field: "Field", institution: "Institution", gpa: "GPA", startDate: "Start", endDate: "End" }[f]} htmlFor={`edu-${i}-${f}`}>
                      <Input value={e[f] ?? ""} onChange={(ev) => patch((d) => ({ ...d, education: d.education.map((x, k) => (k === i ? { ...x, [f]: ev.target.value } : x)) }))} />
                    </Field>
                  ))}
                </div>
              </ItemFrame>
            ))}
          </div>
        );
      case "skills":
        return (
          <div className="grid gap-4">
            <h2 className="font-display text-app-section text-app-ink-1">Skills</h2>
            <Field label="Skills" htmlFor="skills" hint="Comma separated. Keep the ones the job asks for near the front.">
              <Textarea rows={4} value={doc.skills.join(", ")} onChange={(e) => patch((d) => ({ ...d, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))} />
            </Field>
          </div>
        );
      case "projects":
        return (
          <div className="grid gap-4">
            <ListHeader title="Projects" addLabel="Add project" onAdd={() => patch((d) => ({ ...d, projects: [...d.projects, { name: "", description: "", technologies: [], link: "" }] }))} />
            {doc.projects.map((p, i) => (
              <ItemFrame key={i} label={`Project ${i + 1}`} onRemove={() => patch((d) => ({ ...d, projects: d.projects.filter((_, k) => k !== i) }))}>
                <Field label="Name" htmlFor={`proj-${i}-name`}>
                  <Input value={p.name} onChange={(ev) => patch((d) => ({ ...d, projects: d.projects.map((x, k) => (k === i ? { ...x, name: ev.target.value } : x)) }))} />
                </Field>
                <Field label="Description" htmlFor={`proj-${i}-desc`}>
                  <Textarea rows={3} value={p.description} onChange={(ev) => patch((d) => ({ ...d, projects: d.projects.map((x, k) => (k === i ? { ...x, description: ev.target.value } : x)) }))} />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Technologies" htmlFor={`proj-${i}-tech`} hint="Comma separated.">
                    <Input value={p.technologies.join(", ")} onChange={(ev) => patch((d) => ({ ...d, projects: d.projects.map((x, k) => (k === i ? { ...x, technologies: ev.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)) }))} />
                  </Field>
                  <Field label="Link" htmlFor={`proj-${i}-link`}>
                    <Input value={p.link ?? ""} onChange={(ev) => patch((d) => ({ ...d, projects: d.projects.map((x, k) => (k === i ? { ...x, link: ev.target.value } : x)) }))} />
                  </Field>
                </div>
              </ItemFrame>
            ))}
          </div>
        );
      case "certifications":
        return (
          <div className="grid gap-4">
            <ListHeader title="Certifications" addLabel="Add certification" onAdd={() => patch((d) => ({ ...d, certifications: [...d.certifications, { name: "", issuer: "", date: "" }] }))} />
            {doc.certifications.map((c, i) => (
              <ItemFrame key={i} label={`Certification ${i + 1}`} onRemove={() => patch((d) => ({ ...d, certifications: d.certifications.filter((_, k) => k !== i) }))}>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(["name", "issuer", "date"] as const).map((f) => (
                    <Field key={f} label={f[0].toUpperCase() + f.slice(1)} htmlFor={`cert-${i}-${f}`}>
                      <Input value={c[f]} onChange={(ev) => patch((d) => ({ ...d, certifications: d.certifications.map((x, k) => (k === i ? { ...x, [f]: ev.target.value } : x)) }))} />
                    </Field>
                  ))}
                </div>
              </ItemFrame>
            ))}
          </div>
        );
      case "achievements":
        return (
          <div className="grid gap-4">
            <ListHeader title="Achievements" addLabel="Add achievement" onAdd={() => patch((d) => ({ ...d, achievements: [...d.achievements, { title: "", description: "" }] }))} />
            {doc.achievements.map((a, i) => (
              <ItemFrame key={i} label={`Achievement ${i + 1}`} onRemove={() => patch((d) => ({ ...d, achievements: d.achievements.filter((_, k) => k !== i) }))}>
                <Field label="Title" htmlFor={`ach-${i}-title`}>
                  <Input value={a.title} onChange={(ev) => patch((d) => ({ ...d, achievements: d.achievements.map((x, k) => (k === i ? { ...x, title: ev.target.value } : x)) }))} />
                </Field>
                <Field label="Description" htmlFor={`ach-${i}-desc`}>
                  <Textarea rows={2} value={a.description} onChange={(ev) => patch((d) => ({ ...d, achievements: d.achievements.map((x, k) => (k === i ? { ...x, description: ev.target.value } : x)) }))} />
                </Field>
              </ItemFrame>
            ))}
          </div>
        );
      case "languages":
        return (
          <div className="grid gap-4">
            <ListHeader title="Languages" addLabel="Add language" onAdd={() => patch((d) => ({ ...d, languages: [...d.languages, { name: "", proficiency: "" }] }))} />
            {doc.languages.map((l, i) => (
              <ItemFrame key={i} label={`Language ${i + 1}`} onRemove={() => patch((d) => ({ ...d, languages: d.languages.filter((_, k) => k !== i) }))}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Language" htmlFor={`lang-${i}-name`}>
                    <Input value={l.name} onChange={(ev) => patch((d) => ({ ...d, languages: d.languages.map((x, k) => (k === i ? { ...x, name: ev.target.value } : x)) }))} />
                  </Field>
                  <Field label="Proficiency" htmlFor={`lang-${i}-prof`}>
                    <Input placeholder="Fluent" value={l.proficiency} onChange={(ev) => patch((d) => ({ ...d, languages: d.languages.map((x, k) => (k === i ? { ...x, proficiency: ev.target.value } : x)) }))} />
                  </Field>
                </div>
              </ItemFrame>
            ))}
          </div>
        );
      case "volunteer":
        return (
          <div className="grid gap-4">
            <ListHeader title="Volunteering" addLabel="Add role" onAdd={() => patch((d) => ({ ...d, volunteer: [...d.volunteer, { organization: "", role: "", startDate: "", endDate: "", description: "" }] }))} />
            {doc.volunteer.map((v, i) => (
              <ItemFrame key={i} label={`Volunteering ${i + 1}`} onRemove={() => patch((d) => ({ ...d, volunteer: d.volunteer.filter((_, k) => k !== i) }))}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["role", "organization", "startDate", "endDate"] as const).map((f) => (
                    <Field key={f} label={{ role: "Role", organization: "Organisation", startDate: "Start", endDate: "End" }[f]} htmlFor={`vol-${i}-${f}`}>
                      <Input value={v[f]} onChange={(ev) => patch((d) => ({ ...d, volunteer: d.volunteer.map((x, k) => (k === i ? { ...x, [f]: ev.target.value } : x)) }))} />
                    </Field>
                  ))}
                </div>
                <Field label="Description" htmlFor={`vol-${i}-desc`}>
                  <Textarea rows={2} value={v.description} onChange={(ev) => patch((d) => ({ ...d, volunteer: d.volunteer.map((x, k) => (k === i ? { ...x, description: ev.target.value } : x)) }))} />
                </Field>
              </ItemFrame>
            ))}
          </div>
        );
      case "declaration":
        return (
          <div className="grid gap-4">
            <h2 className="font-display text-app-section text-app-ink-1">Declaration</h2>
            <Field label="Declaration" htmlFor="declaration">
              <Textarea rows={3} value={doc.declaration ?? ""} onChange={(e) => patch((d) => ({ ...d, declaration: e.target.value }))} />
            </Field>
          </div>
        );
    }
  })();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        breadcrumb={[{ label: "Resumes", href: "/dashboard/resume" }, { label: name || "Untitled" }]}
        title={name || "Untitled resume"}
        meta={
          <span className="inline-flex flex-wrap items-center gap-2">
            <StatusChip>v{resume.version}</StatusChip>
            <span>{saveState === "saving" ? "Saving" : saveState === "error" ? "Could not save. Changes stay in this tab." : `Saved ${timeAgo(resume.updatedAt, now)}`}</span>
          </span>
        }
        actions={
          <>
            <label htmlFor="template" className="sr-only">
              Template
            </label>
            <div className="w-36">
              <Select id="template" value={doc.template ?? "modern"} onChange={(e) => patch((d) => ({ ...d, template: e.target.value as ResumeDoc["template"] }))}>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={exportDocx} disabled={exportState === "docx"}>
              {exportState === "docx" ? "Exporting" : "Export DOCX"}
            </Button>
            <Button size="sm" onClick={downloadPdf} disabled={exportState === "pdf"}>
              <Download className="h-4 w-4" /> {exportState === "pdf" ? "Preparing" : "Download PDF"}
            </Button>
            {exportState === "error" && <StatusChip tone="orange">Export failed. Try again.</StatusChip>}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Sections */}
        <aside className="flex flex-col gap-3 xl:col-span-3" aria-label="Sections">
          <Field label="Resume name" htmlFor="resume-name">
            <Input
              value={name}
              onChange={(e) => {
                dirtyRef.current = true;
                setName(e.target.value);
              }}
            />
          </Field>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={order} strategy={verticalListSortingStrategy}>
              <ol className="flex flex-col gap-2">
                {order.map((key, i) => (
                  <SortableSection key={key} id={key} doc={doc} active={active === key} onSelect={() => setActive(key)} onMove={(dir) => move(key, dir)} onRemove={() => removeSection(key)} canMoveUp={i > 1} canMoveDown={i > 0 && i < order.length - 1} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
          {available.length > 0 && (
            <div>
              <label htmlFor="add-section" className="sr-only">
                Add section
              </label>
              <Select id="add-section" value="" onChange={(e) => e.target.value && addSection(e.target.value as SectionKey)}>
                <option value="">Add section</option>
                {available.map((k) => (
                  <option key={k} value={k}>
                    {SECTION_LABELS[k]}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </aside>

        {/* Editor */}
        <section className="rounded-app-card border border-app-line bg-app-card p-6 xl:col-span-5" aria-label="Editor">
          {editor}
        </section>

        {/* Preview and match */}
        <aside className="flex flex-col gap-4 xl:col-span-4" aria-label="Preview">
          <ResumePreview doc={doc} highlight={editingBullet} sheetRef={sheetRef} />

          <section className="rounded-app-card border border-app-line bg-app-card p-5" aria-label="Job match">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-app-section text-app-ink-1">Job match</h2>
                <p className="mt-0.5 text-app-small text-app-ink-3">Against the saved job description.</p>
              </div>
              {match && (
                <p className="font-display text-[32px] font-semibold leading-none tabular-nums text-app-ink-1">
                  {match.score}
                  <span className="ml-1 font-mono text-app-label uppercase text-app-ink-3">of 100</span>
                </p>
              )}
            </div>
            <div className="mt-3">
              <Field label="Job description" htmlFor="jd">
                <Textarea rows={4} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the posting" />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={checkMatch} disabled={matchState === "loading"}>
                {matchState === "loading" ? "Checking" : match ? "Check again" : "Check match"}
              </Button>
              {matchError && (
                <span className="text-app-small text-app-orange-text" role="alert">
                  {matchError}
                </span>
              )}
            </div>
            {match && (match.found.length > 0 || match.missing.length > 0 || match.checks.length > 0) && (
              <div className="mt-4 grid gap-4">
                {match.found.length > 0 && (
                  <div>
                    <Eyebrow className="mb-2 text-app-sky-text">Found in your resume</Eyebrow>
                    <div className="flex flex-wrap gap-1.5">
                      {match.found.map((k) => (
                        <StatusChip key={k} tone="sky">
                          {k}
                        </StatusChip>
                      ))}
                    </div>
                  </div>
                )}
                {match.missing.length > 0 && (
                  <div>
                    <Eyebrow className="mb-2 text-app-orange-text">Missing from your resume</Eyebrow>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missing.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => patch((d) => ({ ...d, skills: d.skills.includes(k) ? d.skills : [...d.skills, k] }))}
                          className="inline-flex h-7 items-center gap-1 rounded-full border border-app-orange/30 bg-app-orange/10 px-2.5 text-app-small font-medium text-app-orange-text hover:bg-app-orange/20"
                          aria-label={`Add ${k} to skills`}
                        >
                          <Plus className="h-3 w-3" /> {k}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1.5 text-app-small text-app-ink-3">Add one only if it&apos;s true.</p>
                  </div>
                )}
                {match.checks.length > 0 && (
                  <ul className="grid gap-1.5">
                    {match.checks.map((c) => (
                      <li key={c.label} className="flex items-center gap-2 text-app-small text-app-ink-2">
                        {c.ok ? <Check className="h-4 w-4 text-app-sky" aria-hidden /> : <X className="h-4 w-4 text-app-orange" aria-hidden />}
                        {c.label}
                        <span className="sr-only">{c.ok ? ", passes" : ", fails"}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};
