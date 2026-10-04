"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { ChipBanner } from "@/components/ChipBanner";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";

/**
 * Every homepage section shares this scaffold so the page reads as one
 * system: identical vertical rhythm, one heading grid, and an optional
 * "band" variant that alternates the background for pacing.
 */
export const Section = ({
    id,
    band = false,
    className,
    children,
}: {
    id?: string;
    band?: boolean;
    className?: string;
    children: ReactNode;
}) => (
    <section
        id={id}
        className={cn(
            "relative scroll-mt-20 py-24 md:py-28",
            band && "border-y border-white/5 bg-navy-950/40",
            className
        )}
    >
        <MaxWidthWrapper>{children}</MaxWidthWrapper>
    </section>
);

export const SectionHeading = ({
    eyebrow,
    title,
    lead,
    aside,
    className,
}: {
    eyebrow: string;
    title: ReactNode;
    lead?: ReactNode;
    /** Optional element rendered on the right on large screens (a link, a toggle). */
    aside?: ReactNode;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn("grid gap-6 lg:grid-cols-12 lg:items-end", className)}
    >
        <div className="lg:col-span-7">
            <ChipBanner text={eyebrow} />
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
                {title}
            </h2>
        </div>
        <div className="lg:col-span-5 lg:flex lg:flex-col lg:items-start lg:justify-end">
            {lead && <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:text-lg">{lead}</p>}
            {aside && <div className={cn(lead && "mt-5")}>{aside}</div>}
        </div>
    </motion.div>
);

/** Reveal-on-scroll wrapper for grids and panels below a heading. */
export const Reveal = ({
    children,
    delay = 0,
    className,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, delay, ease: [0.2, 0.7, 0.2, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);
