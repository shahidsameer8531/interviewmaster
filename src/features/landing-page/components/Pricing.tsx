"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal, Section, SectionHeading } from "./Section";

const plans = [
    {
        id: "basic",
        icon: Star,
        name: "Basic",
        tagline: "Start practising",
        monthly: 19,
        yearly: 15,
        blurb: "For your first few interviews.",
        features: [
            "100+ mock interview questions",
            "Interview simulator",
            "Preparation guides",
            "Resume template library",
            "Performance dashboard",
            "10 recorded sessions",
            "Community forum",
            "Email support",
        ],
        cta: "Start with Basic",
    },
    {
        id: "pro",
        icon: Sparkles,
        name: "Pro",
        tagline: "Most people pick this",
        monthly: 49,
        yearly: 39,
        popular: true,
        blurb: "For an active job search.",
        plus: "Everything in Basic, plus",
        features: [
            "Unlimited mock interviews",
            "Real-time feedback while you answer",
            "Advanced analytics and reports",
            "Company-specific preparation",
            "Resume ATS optimisation",
            "2 sessions with a human coach",
            "Custom interview scenarios",
            "Priority support",
        ],
        cta: "Go Pro",
    },
    {
        id: "elite",
        icon: Crown,
        name: "Elite",
        tagline: "With a coach",
        monthly: 99,
        yearly: 79,
        blurb: "For senior and leadership roles.",
        plus: "Everything in Pro, plus",
        features: [
            "A dedicated career coach",
            "Weekly strategy sessions",
            "5 expert mock interviews",
            "Leadership interview training",
            "Salary negotiation preparation",
            "Executive presence coaching",
            "Personal brand development",
            "Lifetime access to updates",
        ],
        cta: "Talk to us",
    },
];

export const Pricing = () => {
    const [yearly, setYearly] = useState(true);

    return (
        <Section id="pricing" band>
            <SectionHeading
                eyebrow="Pricing"
                title="Pay for the month you are interviewing. Or the year you are growing."
                lead="Every plan includes the simulator and the scoring system. Higher tiers add volume, company-specific prep and human coaching."
                aside={
                    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-navy-900/60 p-1 pl-4 text-sm">
                        <span className={cn("transition-colors", !yearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={yearly}
                            aria-label="Bill yearly"
                            onClick={() => setYearly((v) => !v)}
                            className={cn("relative h-7 w-12 rounded-full transition-colors", yearly ? "bg-gold" : "bg-white/10")}
                        >
                            <motion.span
                                className="absolute top-1 h-5 w-5 rounded-full bg-navy-950 shadow"
                                animate={{ left: yearly ? 26 : 4 }}
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                        </button>
                        <span className={cn("flex items-center gap-2 pr-3 transition-colors", yearly ? "text-foreground" : "text-muted-foreground")}>
                            Yearly
                            <span className="rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold">2 months free</span>
                        </span>
                    </div>
                }
            />

            <div className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-end">
                {plans.map((p, i) => {
                    const price = yearly ? p.yearly : p.monthly;
                    return (
                        <Reveal key={p.id} delay={i * 0.08}>
                            <div
                                className={cn(
                                    "surface relative flex h-full flex-col rounded-3xl p-7",
                                    p.popular && "border-gold/50 glow-gold lg:-translate-y-3"
                                )}
                            >
                                {p.popular && (
                                    <span className="absolute -top-3 left-7 rounded-full bg-gold px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-navy-950">
                                        Most popular
                                    </span>
                                )}
                                <div className="flex items-center gap-3">
                                    <span className={cn("grid h-10 w-10 place-items-center rounded-xl ring-1", p.popular ? "bg-gold text-navy-950 ring-gold" : "bg-white/5 text-gold ring-white/10")}>
                                        <p.icon className="h-[18px] w-[18px]" />
                                    </span>
                                    <div>
                                        <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
                                        <p className="text-xs text-muted-foreground">{p.tagline}</p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-baseline gap-1">
                                    <span className="font-display text-5xl font-bold tracking-tight text-foreground">
                                        $<motion.span key={price} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{price}</motion.span>
                                    </span>
                                    <span className="text-sm text-muted-foreground">/ month</span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {yearly ? `Billed $${price * 12} a year` : "Billed monthly, cancel any time"} · {p.blurb}
                                </p>

                                <Button className="mt-6 w-full" variant={p.popular ? "default" : "outline"} asChild>
                                    <Link href={p.id === "elite" ? "/company/contact" : `/auth?plan=${p.id}`}>{p.cta}</Link>
                                </Button>

                                <ul className="mt-7 space-y-2.5 border-t border-white/5 pt-6 text-sm">
                                    {p.plus && <li className="pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-gold">{p.plus}</li>}
                                    {p.features.map((f) => (
                                        <li key={f} className="flex items-start gap-3 text-foreground/90">
                                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    );
                })}
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
                Free practice sessions are available every day without a plan. Prices in USD.
            </p>
        </Section>
    );
};
