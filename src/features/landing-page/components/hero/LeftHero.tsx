'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AudioLines, ScanFace, ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";

const tracks = ["technical", "behavioral", "system design", "leadership", "product"];

const RotatingTrack = () => {
    const [i, setI] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setI((v) => (v + 1) % tracks.length), 2400);
        return () => clearInterval(t);
    }, []);
    return (
        <span className="relative inline-grid overflow-hidden align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={tracks[i]}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                    className="text-gold"
                >
                    {tracks[i]}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

const proofPoints = [
    { icon: AudioLines, text: "Speak your answer. It is transcribed live." },
    { icon: ListChecks, text: "Scored on structure, clarity and confidence." },
    { icon: ScanFace, text: "Optional camera feedback on eye contact and posture." },
];

export const LeftHero = () => {
    return (
        <div className="relative z-10">
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="eyebrow"
            >
                AI mock interviews · resume · aptitude
            </motion.p>

            <motion.h1
                id="hero-title"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="mt-5 font-display text-[2.75rem] font-bold leading-[1.02] tracking-[-0.02em] text-foreground sm:text-6xl lg:text-[4.25rem]"
            >
                Rehearse your <RotatingTrack /> interview with an AI that talks back.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.5 }}
                className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
            >
                InterviewMaster.ai asks the question, listens to your answer and tells you exactly what to fix.
                Practise out loud as many times as you need before the one that counts.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
                <Button size="xl" asChild>
                    <Link href="/products/mock-interviews">
                        Start a mock interview
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                </Button>
                <Button size="xl" variant="glass" asChild>
                    <Link href="#how-it-works">See how it works</Link>
                </Button>
            </motion.div>

            <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } } }}
                className="mt-10 space-y-3"
            >
                {proofPoints.map((p) => (
                    <motion.li
                        key={p.text}
                        variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-gold/10 text-gold ring-1 ring-gold/15">
                            <p.icon className="h-3.5 w-3.5" />
                        </span>
                        {p.text}
                    </motion.li>
                ))}
            </motion.ul>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
            >
                No credit card · Free practice sessions every day
            </motion.p>
        </div>
    );
};
