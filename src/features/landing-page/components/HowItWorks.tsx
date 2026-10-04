"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Target, Mic, Code2, LineChart, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./Section";

const STEP_MS = 5200;

const steps = [
    {
        id: "target",
        icon: Target,
        title: "Pick a role and a track",
        text: "Tell us the job, your experience and the companies you are aiming for. The interviewer adapts its questions to that.",
    },
    {
        id: "practice",
        icon: Mic,
        title: "Answer out loud",
        text: "The AI asks, listens and follows up. Your answer is transcribed as you speak, so nothing you said gets lost.",
    },
    {
        id: "technical",
        icon: Code2,
        title: "Do the technical round",
        text: "Coding, system design and aptitude questions run in the browser, with hints when you are stuck and a review when you are done.",
    },
    {
        id: "progress",
        icon: LineChart,
        title: "See what moved",
        text: "Every session is scored the same way, so you can watch clarity, structure and confidence improve week to week.",
    },
] as const;

type StepId = (typeof steps)[number]["id"];

/* ---------- Illustrations: one small, honest panel per step ---------- */

const TargetPanel = () => {
    const roles = ["Product Manager", "Software Engineer", "Data Scientist"];
    const [picked, setPicked] = useState(0);
    return (
        <div className="space-y-4">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Target role</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {roles.map((r, i) => (
                        <button
                            key={r}
                            type="button"
                            onClick={() => setPicked(i)}
                            className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                i === picked ? "border-gold bg-gold text-navy-950" : "border-white/10 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Experience</p>
                <div className="mt-2 flex gap-1.5">
                    {["0-2", "3-5", "6-9", "10+"].map((e, i) => (
                        <span key={e} className={cn("flex-1 rounded-md py-1.5 text-center text-xs", i === 1 ? "bg-white/10 text-foreground" : "bg-white/[0.03] text-muted-foreground")}>
                            {e} yrs
                        </span>
                    ))}
                </div>
            </div>
            <div className="rounded-lg border border-gold/20 bg-gold/[0.06] p-3 text-xs text-foreground">
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Plan</span>
                {picked === 0 ? "Behavioral, product sense, prioritisation. 3 sessions a week." : picked === 1 ? "Behavioral, coding, system design. 3 sessions a week." : "Behavioral, SQL and statistics, case study. 3 sessions a week."}
            </div>
        </div>
    );
};

const PracticePanel = () => (
    <div className="space-y-3 text-sm">
        <div className="flex gap-3">
            <span className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-gold/15 ring-1 ring-gold/20" />
            <p className="text-foreground">Why do you want to leave your current role?</p>
        </div>
        <div className="flex gap-3">
            <span className="mt-0.5 h-6 w-6 shrink-0 rounded-md bg-white/5 ring-1 ring-white/10" />
            <p className="text-muted-foreground">
                I have shipped the roadmap I joined to build, and the next step for me is owning a product end to end, which this role...
                <span className="caret" />
            </p>
        </div>
        <div className="flex items-center gap-2 pt-1">
            {[3, 6, 9, 12, 8, 5, 10, 7, 4, 9, 6, 3].map((h, i) => (
                <motion.span
                    key={i}
                    className="w-1 rounded-full bg-gold/70"
                    animate={{ height: [h, h + 8, h] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
                    style={{ height: h }}
                />
            ))}
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Listening</span>
        </div>
    </div>
);

const TechnicalPanel = () => (
    <div className="space-y-3">
        <pre className="overflow-x-auto rounded-lg bg-navy-950/70 p-3 font-mono text-[11.5px] leading-relaxed text-muted-foreground ring-1 ring-white/5">
            <code>
                <span className="text-navy-300">def</span> <span className="text-foreground">two_sum</span>(nums, target):{"\n"}
                {"    "}seen = {"{}"}{"\n"}
                {"    "}<span className="text-navy-300">for</span> i, n <span className="text-navy-300">in</span> enumerate(nums):{"\n"}
                {"        "}<span className="text-navy-300">if</span> target - n <span className="text-navy-300">in</span> seen:{"\n"}
                {"            "}<span className="text-navy-300">return</span> [seen[target - n], i]{"\n"}
                {"        "}seen[n] = i
            </code>
        </pre>
        <ul className="space-y-1.5 text-xs">
            {["Passes 12 of 12 tests", "O(n) time, O(n) space", "Hint used: 0"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-gold" /> {t}
                </li>
            ))}
        </ul>
    </div>
);

const ProgressPanel = () => {
    const series = [52, 58, 55, 63, 70, 68, 76, 82];
    const w = 280, h = 90, pad = 6;
    const pts = series.map((v, i) => [pad + (i * (w - pad * 2)) / (series.length - 1), h - pad - ((v - 40) / 50) * (h - pad * 2)] as const);
    const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return (
        <div>
            <div className="flex items-baseline justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Structure score · 8 sessions</p>
                <p className="font-mono text-xs text-foreground">52 → 82</p>
            </div>
            <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-24 w-full" role="img" aria-label="Structure score rising from 52 to 82 over eight sessions">
                <defs>
                    <linearGradient id="hiw-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#fcba28" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#fcba28" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <motion.path d={`${d} L${w - pad},${h - pad} L${pad},${h - pad} Z`} fill="url(#hiw-fill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} />
                <motion.path d={d} fill="none" stroke="#fcba28" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                {pts.map(([x, y], i) => (
                    <motion.circle key={i} cx={x} cy={y} r="3" fill="#0a1628" stroke="#fcba28" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15 * i }} />
                ))}
            </svg>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {[["Clarity", "+18"], ["Structure", "+30"], ["Confidence", "+22"]].map(([k, v]) => (
                    <div key={k} className="rounded-md bg-white/[0.03] py-2">
                        <p className="font-mono text-sm text-gold">{v}</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{k}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const panels: Record<StepId, () => JSX.Element> = {
    target: TargetPanel,
    practice: PracticePanel,
    technical: TechnicalPanel,
    progress: ProgressPanel,
};

/* ------------------------------ Section ------------------------------ */

export const HowItWorks = () => {
    const reduce = useReducedMotion();
    const [active, setActive] = useState<StepId>("target");
    const [paused, setPaused] = useState(false);

    // Auto-advance unless the visitor is hovering or has reduced motion on.
    useEffect(() => {
        if (paused || reduce) return;
        const t = setTimeout(() => {
            const i = steps.findIndex((s) => s.id === active);
            setActive(steps[(i + 1) % steps.length].id);
        }, STEP_MS);
        return () => clearTimeout(t);
    }, [active, paused, reduce]);

    const Panel = panels[active];
    const activeIndex = steps.findIndex((s) => s.id === active);

    return (
        <Section id="how-it-works">
            <SectionHeading
                eyebrow="How it works"
                title="Four steps, repeated until the real one feels familiar."
                lead="The order matters. Decide what you are preparing for, practise it out loud, cover the technical round, then look at the numbers."
            />

            <div
                className="mt-14 grid gap-6 lg:grid-cols-12"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {/* Step list */}
                <ol className="space-y-2 lg:col-span-5" role="tablist" aria-label="Steps">
                    {steps.map((s, i) => {
                        const on = s.id === active;
                        return (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={on}
                                    onClick={() => setActive(s.id)}
                                    className={cn(
                                        "group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-colors",
                                        on ? "surface border-gold/30" : "border-transparent hover:bg-white/[0.03]"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <span className={cn(
                                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition-colors",
                                            on ? "bg-gold text-navy-950 ring-gold" : "bg-white/5 text-muted-foreground ring-white/10 group-hover:text-foreground"
                                        )}>
                                            <s.icon className="h-[18px] w-[18px]" />
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">0{i + 1}</span>
                                                <h3 className={cn("font-display text-lg font-semibold", on ? "text-foreground" : "text-foreground/85")}>{s.title}</h3>
                                            </div>
                                            <AnimatePresence initial={false}>
                                                {on && (
                                                    <motion.p
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden text-sm leading-relaxed text-muted-foreground"
                                                    >
                                                        <span className="block pt-2">{s.text}</span>
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    {on && !paused && !reduce && (
                                        <motion.span
                                            key={s.id}
                                            className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold/70"
                                            initial={{ scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: STEP_MS / 1000, ease: "linear" }}
                                        />
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ol>

                {/* Illustration panel */}
                <div className="lg:col-span-7">
                    <div className="surface relative h-full min-h-[320px] rounded-3xl p-1.5">
                        <div className="flex h-full flex-col rounded-[1.25rem] bg-navy-950/60 ring-1 ring-white/5">
                            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                    Step {activeIndex + 1} of {steps.length}
                                </span>
                                <div className="flex gap-1">
                                    {steps.map((s) => (
                                        <span key={s.id} className={cn("h-1.5 w-5 rounded-full transition-colors", s.id === active ? "bg-gold" : "bg-white/10")} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 p-5 sm:p-6">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={active}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        <Panel />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};
