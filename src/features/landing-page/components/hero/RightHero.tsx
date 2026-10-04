'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The hero's signature: a live mock-interview console.
 * It plays a scripted exchange for the chosen track, then scores it.
 * Visitors can switch tracks; auto-advance pauses while they interact.
 */

type Script = {
    id: string;
    label: string;
    role: string;
    question: string;
    answer: string;
    scores: { clarity: number; structure: number; confidence: number };
    tip: string;
};

const scripts: Script[] = [
    {
        id: "behavioral",
        label: "Behavioral",
        role: "Product Manager · Amazon",
        question: "Tell me about a time you disagreed with a stakeholder and how you handled it.",
        answer:
            "At my last company the sales lead wanted a feature shipped in two weeks. I shared usage data showing only 4% of accounts would use it, proposed a lighter version, and we agreed on a two-step rollout. It shipped in nine days and adoption hit 18%.",
        scores: { clarity: 86, structure: 91, confidence: 78 },
        tip: "Strong STAR structure. Say the result first next time, then the story.",
    },
    {
        id: "technical",
        label: "Technical",
        role: "Backend Engineer · Stripe",
        question: "How would you make an idempotent payment endpoint?",
        answer:
            "The client sends an idempotency key with each request. I store the key with the response in a table that has a unique constraint, and on a retry I return the stored response instead of charging again. Keys expire after 24 hours.",
        scores: { clarity: 82, structure: 74, confidence: 88 },
        tip: "Good. Mention how you handle a retry that arrives while the first request is still running.",
    },
    {
        id: "system",
        label: "System design",
        role: "Senior Engineer · Netflix",
        question: "Design the notification service for a streaming app.",
        answer:
            "I'd start with the requirements: 50 million users, push and email, and delivery within a minute. Producers publish events to a queue, workers fan out per channel with retries, and a preferences service filters before send so we never spam.",
        scores: { clarity: 79, structure: 83, confidence: 72 },
        tip: "You covered scale and channels. Add how you de-duplicate when a user has multiple devices.",
    },
    {
        id: "leadership",
        label: "Leadership",
        role: "Engineering Manager · Shopify",
        question: "How do you handle an underperforming senior engineer?",
        answer:
            "First I make sure the gap is real and specific, with examples. Then a direct conversation, a 30-day plan with measurable outcomes, and weekly check-ins. In the one case I had, the issue was unclear ownership and it resolved in three weeks.",
        scores: { clarity: 90, structure: 88, confidence: 85 },
        tip: "Clear and humane. Quantify the outcome of the plan, not just the timeline.",
    },
];

type Phase = "asking" | "answering" | "scoring" | "done";

const useTypewriter = (text: string, active: boolean, speed: number, onDone?: () => void) => {
    const [out, setOut] = useState("");
    const doneRef = useRef(onDone);
    doneRef.current = onDone;

    useEffect(() => {
        if (!active) return;
        setOut("");
        let i = 0;
        const id = setInterval(() => {
            i += 1;
            setOut(text.slice(0, i));
            if (i >= text.length) {
                clearInterval(id);
                doneRef.current?.();
            }
        }, speed);
        return () => clearInterval(id);
    }, [text, active, speed]);

    return out;
};

const Meter = ({ label, value, show, delay }: { label: string; value: number; show: boolean; delay: number }) => (
    <div>
        <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
            <span className="font-mono text-xs tabular-nums text-foreground">
                {show ? <Counter to={value} delay={delay} /> : "--"}
            </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <motion.div
                className={cn("h-full rounded-full", value >= 85 ? "bg-gold" : value >= 75 ? "bg-gold/80" : "bg-navy-300")}
                initial={{ width: 0 }}
                animate={{ width: show ? `${value}%` : 0 }}
                transition={{ duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] }}
            />
        </div>
    </div>
);

const Counter = ({ to, delay }: { to: number; delay: number }) => {
    const [n, setN] = useState(0);
    useEffect(() => {
        let raf = 0;
        const start = performance.now() + delay * 1000;
        const tick = (t: number) => {
            const p = Math.min(1, Math.max(0, (t - start) / 900));
            setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [to, delay]);
    return <>{n}</>;
};

export const RightHero = () => {
    const reduce = useReducedMotion();
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState<Phase>("asking");
    const [paused, setPaused] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const script = scripts[idx];

    const qSpeed = reduce ? 0 : 28;
    const aSpeed = reduce ? 0 : 18;

    const question = useTypewriter(script.question, phase === "asking", qSpeed, () =>
        setTimeout(() => setPhase("answering"), 500)
    );
    const answer = useTypewriter(script.answer, phase === "answering", aSpeed, () =>
        setTimeout(() => setPhase("scoring"), 300)
    );

    // Scoring then done, then auto-advance unless the visitor is interacting.
    useEffect(() => {
        if (phase !== "scoring") return;
        const t = setTimeout(() => setPhase("done"), 1400);
        return () => clearTimeout(t);
    }, [phase]);

    useEffect(() => {
        if (phase !== "done" || paused) return;
        const t = setTimeout(() => select((idx + 1) % scripts.length), 5200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, paused, idx]);

    // Session timer
    useEffect(() => {
        const t = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const select = (i: number) => {
        setIdx(i);
        setPhase("asking");
    };

    const mmss = useMemo(() => {
        const m = Math.floor(elapsed / 60).toString().padStart(2, "0");
        const s = (elapsed % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }, [elapsed]);

    const showScores = phase === "scoring" || phase === "done";

    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="relative mx-auto w-full max-w-[560px] [perspective:1200px]"
            aria-label="Live mock interview demo"
        >
            <div className="surface rounded-3xl p-1.5 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)]">
                <div className="rounded-[1.25rem] bg-navy-950/60 ring-1 ring-white/5">
                    {/* Title bar */}
                    <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                            <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                                Mock interview
                            </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                            <span className="relative flex items-center gap-1.5 text-foreground">
                                <span className="relative grid h-2 w-2 place-items-center">
                                    <span className="absolute h-2 w-2 rounded-full bg-red-500/70 animate-pulse-ring" />
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                </span>
                                REC
                            </span>
                            <span className="tabular-nums">{mmss}</span>
                        </div>
                    </div>

                    {/* Track picker */}
                    <div className="flex gap-1.5 overflow-x-auto px-4 pt-4 [scrollbar-width:none]" role="tablist" aria-label="Interview track">
                        {scripts.map((s, i) => (
                            <button
                                key={s.id}
                                role="tab"
                                aria-selected={i === idx}
                                onClick={() => select(i)}
                                className={cn(
                                    "relative shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                                    i === idx ? "text-navy-950" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {i === idx && (
                                    <motion.span
                                        layoutId="track-pill"
                                        className="absolute inset-0 rounded-full bg-gold"
                                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                                    />
                                )}
                                <span className="relative">{s.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Transcript */}
                    <div className="space-y-4 px-4 py-5">
                        <div className="flex gap-3">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gold/15 text-gold ring-1 ring-gold/20">
                                <Sparkles className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                    Interviewer · {script.role}
                                </p>
                                <p className={cn("mt-1 text-[0.95rem] leading-relaxed text-foreground", phase === "asking" && "caret")}>
                                    {question}
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {phase !== "asking" && (
                                <motion.div
                                    key={script.id + "-answer"}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex gap-3"
                                >
                                    <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-foreground ring-1 ring-white/10">
                                        <Mic className="h-4 w-4" />
                                        {phase === "answering" && (
                                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold animate-pulse" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                                            You · {phase === "answering" ? "listening" : "transcript"}
                                        </p>
                                        <p className={cn("mt-1 text-[0.95rem] leading-relaxed text-muted-foreground", phase === "answering" && "caret")}>
                                            {answer}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Scores + tip */}
                    <div className="border-t border-white/5 px-4 py-4">
                        <div className="grid grid-cols-3 gap-4">
                            <Meter label="Clarity" value={script.scores.clarity} show={showScores} delay={0} />
                            <Meter label="Structure" value={script.scores.structure} show={showScores} delay={0.15} />
                            <Meter label="Confidence" value={script.scores.confidence} show={showScores} delay={0.3} />
                        </div>
                        <div className="mt-4 min-h-[2.5rem]">
                            <AnimatePresence mode="wait">
                                {phase === "done" ? (
                                    <motion.p
                                        key={script.id + "-tip"}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-lg border border-gold/20 bg-gold/[0.07] px-3 py-2 text-sm text-foreground"
                                    >
                                        <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">AI feedback</span>
                                        {script.tip}
                                    </motion.p>
                                ) : (
                                    <motion.p
                                        key="waiting"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="px-1 font-mono text-[11px] text-muted-foreground"
                                    >
                                        {phase === "scoring" ? "Scoring your answer…" : "Feedback appears after your answer."}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating note */}
            <motion.div
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="surface-glass absolute -bottom-5 -left-4 hidden items-center gap-3 rounded-2xl px-4 py-3 sm:flex"
            >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-navy-950">
                    <Mic className="h-4 w-4" />
                </span>
                <div className="text-xs">
                    <p className="font-semibold text-foreground">Works with your microphone</p>
                    <p className="text-muted-foreground">Or type if you prefer.</p>
                </div>
            </motion.div>
        </motion.div>
    );
};
