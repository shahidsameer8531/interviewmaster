"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { ChipBanner } from "@/components/ChipBanner";
import { Section } from "./Section";

const faqs = [
    {
        q: "How does the AI interview simulation work?",
        a: "The interviewer asks a question, listens to your spoken or typed answer, and follows up based on what you said. When you finish, your answer is scored on clarity, structure and confidence, and you get one concrete change to make. With the camera on, it also comments on eye contact and posture.",
    },
    {
        q: "Which technical interviews are covered?",
        a: "Data structures and algorithms, system design, full stack, machine learning and cloud architecture. Each track has questions in the style of large technology companies, a coding environment in the browser and an AI review of your solution.",
    },
    {
        q: "What does the feedback actually look like?",
        a: "For coding, it covers correctness, complexity and approach. For behavioral answers, it looks at structure, relevance and delivery. You get the scores, the transcript with the weak passages highlighted, and a short list of what to do differently next time.",
    },
    {
        q: "How is this different from reading question banks?",
        a: "Question banks tell you what might be asked. The simulator makes you answer it out loud, under a timer, with follow-ups, and then tells you how it went. The practice is in the answering, not the reading.",
    },
    {
        q: "How long until I notice a difference?",
        a: "Most members report a clear change within two to four weeks of regular sessions. The progress view shows the same scores session after session, so you can see it rather than guess.",
    },
    {
        q: "Can I get help when I am stuck?",
        a: "Yes. There are hints during coding challenges, worked solutions afterwards, and community forums. Pro and Elite plans include sessions with a human coach and priority support.",
    },
];

export const FAQ = () => {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <Section id="faq" band>
            <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <div className="lg:sticky lg:top-28">
                        <ChipBanner text="Questions" />
                        <h2 className="mt-4 font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl">
                            Things people ask before they start.
                        </h2>
                        <p className="mt-4 text-muted-foreground">
                            Not answered here? The full list is in the resources section, or ask the community.
                        </p>
                        <div className="mt-6 flex flex-col gap-2 text-sm">
                            <Link href="/resources/faq" className="inline-flex items-center gap-1 font-medium text-gold hover:underline">
                                All questions <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link href="/company/contact" className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground">
                                Contact us <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <dl className="surface divide-y divide-white/5 rounded-3xl lg:col-span-8">
                    {faqs.map((f, i) => {
                        const on = open === i;
                        return (
                            <div key={f.q}>
                                <dt>
                                    <button
                                        type="button"
                                        aria-expanded={on}
                                        aria-controls={`faq-${i}`}
                                        onClick={() => setOpen(on ? null : i)}
                                        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors hover:bg-white/[0.02] sm:px-8"
                                    >
                                        <span className={cn("font-display text-lg font-semibold", on ? "text-foreground" : "text-foreground/85")}>{f.q}</span>
                                        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full ring-1 transition-all", on ? "rotate-45 bg-gold text-navy-950 ring-gold" : "text-muted-foreground ring-white/10")}>
                                            <Plus className="h-4 w-4" />
                                        </span>
                                    </button>
                                </dt>
                                <AnimatePresence initial={false}>
                                    {on && (
                                        <motion.dd
                                            id={`faq-${i}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-6 leading-relaxed text-muted-foreground sm:px-8">{f.a}</p>
                                        </motion.dd>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </dl>
            </div>
        </Section>
    );
};
