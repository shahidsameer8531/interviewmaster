"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";

import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./Section";

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Software Engineer",
        company: "Google",
        quote: "The mock interviews and the real-time feedback changed how I prepared. I stopped memorising answers and started fixing the way I structured them.",
        track: "Behavioral + coding",
    },
    {
        name: "Michael Chen",
        role: "Senior Developer",
        company: "Microsoft",
        quote: "The coding challenges and system design scenarios felt like the real thing. By the on-site I had already been asked most of the shapes of question.",
        track: "System design",
    },
    {
        name: "Emma Rodriguez",
        role: "Product Manager",
        company: "Amazon",
        quote: "From behavioral questions to case studies, it covered everything I needed. The feedback was specific enough to act on the same evening.",
        track: "Product sense",
    },
    {
        name: "David Patel",
        role: "Full Stack Developer",
        company: "Meta",
        quote: "The instant feedback showed me my weak areas before a human interviewer did. I felt calmer in the real rounds because nothing was new.",
        track: "Full stack",
    },
    {
        name: "Lisa Wang",
        role: "Data Scientist",
        company: "Netflix",
        quote: "The machine learning focused prep was exactly what I needed. The platform's coverage helped me get through the technical rounds.",
        track: "ML + statistics",
    },
];

const AUTO_MS = 7000;

export const Testimonials = () => {
    const reduce = useReducedMotion();
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    const [dir, setDir] = useState(1);

    const go = useCallback((next: number, d = 1) => {
        setDir(d);
        setI((next + testimonials.length) % testimonials.length);
    }, []);

    useEffect(() => {
        if (paused || reduce) return;
        const t = setTimeout(() => go(i + 1, 1), AUTO_MS);
        return () => clearTimeout(t);
    }, [i, paused, reduce, go]);

    const onKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowRight") go(i + 1, 1);
        if (e.key === "ArrowLeft") go(i - 1, -1);
    };

    const t = testimonials[i];

    return (
        <Section id="stories">
            <SectionHeading
                eyebrow="From members"
                title="What people say after the offer."
                lead="A few of the stories members have shared. Read more in the community."
            />

            <div
                className="mt-12 grid gap-6 lg:grid-cols-12"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
                onKeyDown={onKey}
                tabIndex={0}
                aria-roledescription="carousel"
                aria-label="Member stories"
            >
                {/* Featured quote */}
                <div className="surface relative overflow-hidden rounded-3xl p-7 sm:p-10 lg:col-span-8">
                    <Quote className="absolute right-8 top-8 h-16 w-16 text-gold/10" aria-hidden />
                    <div className="min-h-[220px]">
                        <AnimatePresence mode="wait" custom={dir}>
                            <motion.figure
                                key={i}
                                custom={dir}
                                initial={{ opacity: 0, x: 24 * dir }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 * dir }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <blockquote className="font-display text-2xl font-medium leading-snug text-foreground sm:text-[1.75rem]">
                                    “{t.quote}”
                                </blockquote>
                                <figcaption className="mt-8 flex items-center gap-4">
                                    <span className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-gold/30">
                                        <Image src="/avatar.png" alt="" fill className="object-cover" />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-foreground">{t.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {t.role} · {t.company}
                                        </p>
                                    </div>
                                    <span className="ml-auto hidden rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground sm:inline">
                                        {t.track}
                                    </span>
                                </figcaption>
                            </motion.figure>
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex gap-1.5" role="tablist" aria-label="Choose a story">
                            {testimonials.map((_, k) => (
                                <button
                                    key={k}
                                    role="tab"
                                    aria-selected={k === i}
                                    aria-label={`Story ${k + 1}`}
                                    onClick={() => go(k, k > i ? 1 : -1)}
                                    className={cn("h-1.5 rounded-full transition-all", k === i ? "w-8 bg-gold" : "w-3 bg-white/15 hover:bg-white/30")}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => go(i - 1, -1)} aria-label="Previous story" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => go(i + 1, 1)} aria-label="Next story" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold">
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Picker list */}
                <ul className="hidden gap-2 lg:col-span-4 lg:flex lg:flex-col">
                    {testimonials.map((m, k) => (
                        <li key={m.name}>
                            <button
                                type="button"
                                onClick={() => go(k, k > i ? 1 : -1)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors",
                                    k === i ? "surface border-gold/30" : "border-transparent hover:bg-white/[0.03]"
                                )}
                            >
                                <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                                    <Image src="/avatar.png" alt="" fill className="object-cover" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium text-foreground">{m.name}</span>
                                    <span className="block truncate text-xs text-muted-foreground">{m.role} · {m.company}</span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </Section>
    );
};
