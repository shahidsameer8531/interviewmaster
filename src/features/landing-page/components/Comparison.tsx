"use client";

import { motion } from "framer-motion";
import { BookOpen, Brain, Briefcase, Code, LineChart, MessageSquare, Users, Video, X, Check } from "lucide-react";

import { Section, SectionHeading } from "./Section";

const rows = [
    { icon: Brain, name: "Mock interviews", before: "Ask a friend, when they are free", after: "Any time, with follow-ups" },
    { icon: Code, name: "Technical practice", before: "2 to 3 hours of setup", after: "15 minutes, in the browser" },
    { icon: MessageSquare, name: "Feedback", before: "Days later, if at all", after: "As soon as you finish" },
    { icon: Briefcase, name: "Company-specific prep", before: "Hours of forum reading", after: "Generated for the role" },
    { icon: Video, name: "Recording and review", before: "Set up, then forget to watch", after: "Recorded and scored for you" },
    { icon: LineChart, name: "Progress", before: "A feeling", after: "A number per session" },
    { icon: BookOpen, name: "Study material", before: "Self-curated tabs", after: "Picked from your weak spots" },
    { icon: Users, name: "Practice partners", before: "Hard to find", after: "Community, mentors, forums" },
];

export const Comparison = () => (
    <Section id="compare">
        <SectionHeading
            eyebrow="Before and after"
            title="What changes when the interviewer is always available."
            lead="Most preparation time goes on logistics. The point of the platform is to remove them."
        />

        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            className="surface mt-12 overflow-hidden rounded-3xl"
            role="table"
            aria-label="Preparing on your own compared with InterviewMaster.ai"
        >
            <div className="hidden grid-cols-12 gap-4 border-b border-white/5 px-6 py-4 md:grid" role="row">
                <span className="col-span-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground" role="columnheader">Task</span>
                <span className="col-span-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground" role="columnheader">On your own</span>
                <span className="col-span-4 font-mono text-[10px] uppercase tracking-[0.18em] text-gold" role="columnheader">With InterviewMaster.ai</span>
            </div>
            {rows.map((r) => (
                <motion.div
                    key={r.name}
                    variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }}
                    className="group grid gap-3 border-b border-white/5 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.03] md:grid-cols-12 md:gap-4 md:py-3.5"
                    role="row"
                >
                    <div className="flex items-center gap-3 md:col-span-4" role="cell">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-muted-foreground ring-1 ring-white/10 transition-colors group-hover:text-gold">
                            <r.icon className="h-4 w-4" />
                        </span>
                        <span className="font-medium text-foreground">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-4" role="cell">
                        <X className="h-3.5 w-3.5 shrink-0 text-red-400/70 md:hidden" />
                        <span className="md:hidden sr-only">On your own:</span>
                        {r.before}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground md:col-span-4" role="cell">
                        <Check className="h-3.5 w-3.5 shrink-0 text-gold" />
                        {r.after}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    </Section>
);
