"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { Reveal } from "./Section";

const points = ["Free practice sessions every day", "No credit card to start", "Works with a microphone or typed answers"];

export const CTA = () => (
    <section id="cta" className="py-24 md:py-28">
        <MaxWidthWrapper>
            <Reveal>
                <div className="surface relative overflow-hidden rounded-[2rem] border-gold/25 px-6 py-14 text-center sm:px-12 md:py-20">
                    <div aria-hidden className="pointer-events-none absolute inset-0">
                        <div className="bg-grid mask-fade-b absolute inset-0 opacity-50" />
                        <div className="absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-[100px]" />
                    </div>
                    <div className="relative mx-auto max-w-2xl">
                        <p className="eyebrow">Ready when you are</p>
                        <h2 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                            The next interview you do should not be the real one.
                        </h2>
                        <p className="mt-5 text-lg text-muted-foreground">
                            Start a mock interview now. It takes about ten minutes and you will know exactly what to work on.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button size="xl" asChild>
                                <Link href="/products/mock-interviews">
                                    Start a mock interview <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="xl" variant="glass" asChild>
                                <Link href="/auth">Create a free account</Link>
                            </Button>
                        </div>
                        <ul className="mt-8 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                            {points.map((p) => (
                                <li key={p} className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-gold" /> {p}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Reveal>
        </MaxWidthWrapper>
    </section>
);
