"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { orderOf, type ResumeDoc, type SectionKey } from "./model";

/** A4 at 96dpi. The sheet is rendered at this size and scaled to fit its column. */
export const A4 = { w: 794, h: 1123 };

const Heading = ({ children, minimal }: { children: React.ReactNode; minimal: boolean }) => (
  <h2
    className={cn(
      "mb-2 mt-5 text-[13px] font-bold uppercase tracking-[0.12em]",
      minimal ? "border-b border-neutral-300 pb-1 text-neutral-800" : "text-[#0a1628] before:mr-2 before:inline-block before:h-[10px] before:w-[3px] before:bg-[#1f6fd1] before:align-[-1px]"
    )}
  >
    {children}
  </h2>
);

const Bullet = ({ text, id, highlight }: { text: string; id: string; highlight: boolean }) => (
  <li data-bullet={id} className={cn("pl-1 leading-snug", highlight && "rounded-sm bg-[#dbeeff] ring-1 ring-[#7cc4ff]")}>
    {text}
  </li>
);

/**
 * The printable sheet. Dark text on white, independent of the app theme.
 * `highlight` is "exp-<i>-<j>" for the bullet being edited.
 */
export const ResumeSheet = forwardRef<HTMLDivElement, { doc: ResumeDoc; highlight?: string | null }>(({ doc, highlight }, ref) => {
  const minimal = doc.template === "minimal";
  const p = doc.personalInfo;
  const order = orderOf(doc);

  const section = (key: SectionKey) => {
    switch (key) {
      case "personalInfo":
        return (
          <header key={key} className={cn("pb-3", minimal ? "text-left" : "text-center")}>
            <h1 className={cn("text-[26px] font-bold leading-tight", minimal ? "text-neutral-900" : "text-[#0a1628]")}>{p.fullName || "Your name"}</h1>
            <p className="mt-1 text-[11px] text-neutral-600">{[p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean).join("  ·  ")}</p>
            {p.summary && <p className="mt-3 text-[11.5px] leading-snug text-neutral-800">{p.summary}</p>}
          </header>
        );
      case "experiences":
        if (!doc.experiences.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Experience</Heading>
            {doc.experiences.map((e, i) => (
              <div key={i} className="mb-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[12px] font-semibold text-neutral-900">
                    {e.position || "Role"}
                    {e.company ? `, ${e.company}` : ""}
                  </p>
                  <p className="shrink-0 text-[10.5px] text-neutral-500">
                    {e.startDate}
                    {e.startDate || e.endDate || e.current ? " – " : ""}
                    {e.current ? "Present" : e.endDate}
                  </p>
                </div>
                {e.description.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-neutral-800">
                    {e.description.map((b, j) => (
                      <Bullet key={j} id={`exp-${i}-${j}`} text={b} highlight={highlight === `exp-${i}-${j}`} />
                    ))}
                  </ul>
                )}
                {e.technologies && e.technologies.length > 0 && <p className="mt-1 text-[10.5px] text-neutral-600">{e.technologies.join(" · ")}</p>}
              </div>
            ))}
          </section>
        );
      case "education":
        if (!doc.education.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Education</Heading>
            {doc.education.map((e, i) => (
              <div key={i} className="mb-2 flex items-baseline justify-between gap-3">
                <p className="text-[11.5px] text-neutral-900">
                  <span className="font-semibold">
                    {e.degree}
                    {e.field ? ` in ${e.field}` : ""}
                  </span>
                  {e.institution ? `, ${e.institution}` : ""}
                  {e.gpa ? ` · GPA ${e.gpa}` : ""}
                </p>
                <p className="shrink-0 text-[10.5px] text-neutral-500">
                  {e.startDate}
                  {e.startDate || e.endDate ? " – " : ""}
                  {e.endDate}
                </p>
              </div>
            ))}
          </section>
        );
      case "skills":
        if (!doc.skills.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Skills</Heading>
            <p className="text-[11px] leading-snug text-neutral-800">{doc.skills.join(" · ")}</p>
          </section>
        );
      case "projects":
        if (!doc.projects.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Projects</Heading>
            {doc.projects.map((x, i) => (
              <div key={i} className="mb-2">
                <p className="text-[11.5px] font-semibold text-neutral-900">
                  {x.name}
                  {x.link ? <span className="ml-2 font-normal text-neutral-500">{x.link}</span> : null}
                </p>
                {x.description && <p className="text-[11px] text-neutral-800">{x.description}</p>}
                {x.technologies.length > 0 && <p className="text-[10.5px] text-neutral-600">{x.technologies.join(" · ")}</p>}
              </div>
            ))}
          </section>
        );
      case "certifications":
        if (!doc.certifications.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Certifications</Heading>
            <ul className="space-y-0.5 text-[11px] text-neutral-800">
              {doc.certifications.map((c, i) => (
                <li key={i}>
                  {c.name}
                  {c.issuer ? `, ${c.issuer}` : ""}
                  {c.date ? ` (${c.date})` : ""}
                </li>
              ))}
            </ul>
          </section>
        );
      case "achievements":
        if (!doc.achievements.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Achievements</Heading>
            <ul className="list-disc space-y-0.5 pl-4 text-[11px] text-neutral-800">
              {doc.achievements.map((a, i) => (
                <li key={i}>
                  <span className="font-semibold">{a.title}</span>
                  {a.description ? ` — ${a.description}` : ""}
                </li>
              ))}
            </ul>
          </section>
        );
      case "languages":
        if (!doc.languages.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Languages</Heading>
            <p className="text-[11px] text-neutral-800">{doc.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ""}`).join(" · ")}</p>
          </section>
        );
      case "volunteer":
        if (!doc.volunteer.length) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Volunteering</Heading>
            {doc.volunteer.map((v, i) => (
              <div key={i} className="mb-2">
                <p className="text-[11.5px] font-semibold text-neutral-900">
                  {v.role}
                  {v.organization ? `, ${v.organization}` : ""}
                </p>
                {v.description && <p className="text-[11px] text-neutral-800">{v.description}</p>}
              </div>
            ))}
          </section>
        );
      case "declaration":
        if (!doc.declaration?.trim()) return null;
        return (
          <section key={key}>
            <Heading minimal={minimal}>Declaration</Heading>
            <p className="text-[11px] text-neutral-800">{doc.declaration}</p>
          </section>
        );
    }
  };

  return (
    <div
      ref={ref}
      className={cn("bg-white px-[56px] py-[48px] text-neutral-900", minimal ? "font-serif" : "font-sans")}
      style={{ width: A4.w, minHeight: A4.h, fontFamily: minimal ? "Georgia, 'Times New Roman', serif" : "Arial, Helvetica, sans-serif" }}
    >
      {order.map(section)}
    </div>
  );
});
ResumeSheet.displayName = "ResumeSheet";

/** The sheet scaled to fit its container's width. */
export const ResumePreview = ({ doc, highlight, sheetRef }: { doc: ResumeDoc; highlight?: string | null; sheetRef?: React.Ref<HTMLDivElement> }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / A4.w)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={wrapRef} className="w-full overflow-hidden rounded-app-panel bg-app-sidebar p-2 ring-1 ring-app-line" aria-label="Resume preview">
      <div style={{ width: A4.w * scale, height: A4.h * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }} className="shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]">
          <ResumeSheet ref={sheetRef} doc={doc} highlight={highlight} />
        </div>
      </div>
    </div>
  );
};
