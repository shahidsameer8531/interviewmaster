"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Brain, Check, FileText, Mic, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "./Section";

const tools = [
    {
        id: "mock",
        icon: Mic,
        label: "Mock interviews",
        title: "An interviewer that listens and follows up",
        text: "Behavioral, technical and leadership tracks. Speak your answer, get a transcript, a score and one thing to fix.",
        points: ["Follow-up questions based on what you said", "Scored on clarity, structure and confidence", "Optional camera feedback on posture and eye contact"],
        href: "/dashboard/interview/new",
        cta: "Start a mock interview",
        preview: (
            <div className="space-y-3">
                <div className="rounded-lg bg-white/[0.04] p-3 text-sm text-foreground">Walk me through a decision you got wrong.</div>
                <div className="rounded-lg border border-white/5 p-3 text-sm text-muted-foreground">
                    Last year I pushed to launch before the data pipeline was ready. We shipped, the dashboard was wrong for two days, and I...
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[["Clarity", 84], ["Structure", 79], ["Confidence", 88]].map(([k, v]) => (
                        <div key={k as string} className="rounded-md bg-white/[0.03] p-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{k}</p>
                            <p className="mt-1 font-mono text-lg text-gold">{v}</p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: "resume",
        icon: FileText,
        label: "Resume builder",
        title: "A resume that passes the screen and reads well",
        text: "Build from a template, paste a job description, and get an ATS match score with line-level suggestions.",
        points: ["ATS keyword match against the job post", "Rewrites weak bullet points with measurable results", "Export to PDF and DOCX"],
        href: "/dashboard/resume",
        cta: "Build your resume",
        preview: (
            <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.04] p-3">
                    <span className="text-sm text-foreground">ATS match · Senior PM, fintech</span>
                    <span className="font-mono text-lg text-gold">78%</span>
                </div>
                <div className="space-y-2 text-xs">
                    <p className="rounded-md border border-red-400/20 bg-red-400/5 p-2 text-muted-foreground line-through">Responsible for managing the payments roadmap.</p>
                    <p className="rounded-md border border-gold/30 bg-gold/[0.07] p-2 text-foreground">Owned the payments roadmap for 3 teams; cut checkout failures 31% in two quarters.</p>
                </div>
            </div>
        ),
    },
    {
        id: "aptitude",
        icon: Brain,
        label: "Aptitude AI",
        title: "Timed practice that adapts to you",
        text: "Numerical, logical and verbal questions that get harder as you improve, with worked explanations for every miss.",
        points: ["Adaptive difficulty per topic", "Explanations, not just answer keys", "Timed mode that mirrors real assessments"],
        href: "/dashboard/aptitude",
        cta: "Try a practice set",
        preview: (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Numerical · Q7 of 15</span>
                    <span className="font-mono text-xs text-foreground">01:42</span>
                </div>
                <p className="text-sm text-foreground">A train covers 240 km at 60 km/h and returns at 80 km/h. Average speed for the trip?</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {["70 km/h", "68.6 km/h", "72 km/h", "66.7 km/h"].map((o, i) => (
                        <span key={o} className={cn("rounded-md border p-2", i === 1 ? "border-gold bg-gold/10 text-foreground" : "border-white/10 text-muted-foreground")}>{o}</span>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: "generator",
        icon: Sparkles,
        label: "Question generator",
        title: "Questions for the exact job you applied to",
        text: "Paste the role and company. Get a question set that reflects their interview style, with model answers you can study.",
        points: ["Company-specific question styles", "Model answers with structure notes", "Save sets and practise them in the simulator"],
        href: "/products/interview-generator",
        cta: "Generate questions",
        preview: (
            <div className="space-y-2 text-sm">
                <div className="rounded-lg bg-white/[0.04] p-3 text-foreground">Backend Engineer · Stripe</div>
                {["Design a rate limiter shared across regions.", "How would you migrate a hot table without downtime?", "Tell me about a time you pushed back on a deadline."].map((q, i) => (
                    <div key={q} className="flex gap-3 rounded-lg border border-white/5 p-3 text-muted-foreground">
                        <span className="font-mono text-[10px] text-gold">0{i + 1}</span>
                        {q}
                    </div>
                ))}
            </div>
        ),
    },
] as const;

export const Tools = () => {
    const [active, setActive] = useState<(typeof tools)[number]["id"]>("mock");
    const tool = tools.find((t) => t.id === active)!;

    return (
        <Section id="tools" band>
            <SectionHeading
                eyebrow="The tools"
                title="Everything you need for the loop, in one place."
                lead="Four tools that share one scoring system, so a resume session and a mock interview both tell you the same story about where you stand."
                aside={
                    <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline">
                        See all products <ArrowRight className="h-4 w-4" />
                    </Link>
                }
            />

            {/* Tab bar */}
            <div className="mt-12 flex gap-1 overflow-x-auto rounded-2xl border border-white/5 bg-navy-900/60 p-1 [scrollbar-width:none]" role="tablist" aria-label="Tools">
                {tools.map((t) => {
                    const on = t.id === active;
                    return (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={on}
                            onClick={() => setActive(t.id)}
                            className={cn(
                                "relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                                on ? "text-navy-950" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {on && <motion.span layoutId="tool-tab" className="absolute inset-0 rounded-xl bg-gold" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                            <t.icon className="relative h-4 w-4" />
                            <span className="relative">{t.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Panel */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                    className="surface mt-4 grid gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-12 lg:gap-12"
                    role="tabpanel"
                >
                    <div className="lg:col-span-5">
                        <h3 className="font-display text-2xl font-semibold text-foreground">{tool.title}</h3>
                        <p className="mt-3 leading-relaxed text-muted-foreground">{tool.text}</p>
                        <ul className="mt-6 space-y-2.5">
                            {tool.points.map((p) => (
                                <li key={p} className="flex items-start gap-3 text-sm text-foreground/90">
                                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                                        <Check className="h-3 w-3" />
                                    </span>
                                    {p}
                                </li>
                            ))}
                        </ul>
                        <Button className="mt-8" asChild>
                            <Link href={tool.href}>
                                {tool.cta} <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="lg:col-span-7">
                        <div className="h-full rounded-2xl bg-navy-950/60 p-5 ring-1 ring-white/5 sm:p-6">{tool.preview}</div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </Section>
    );
};
