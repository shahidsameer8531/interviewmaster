"use client";

import { LeftHero } from "./LeftHero";
import { RightHero } from "./RightHero";
import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";

export const Hero = () => {
    return (
        <section className="relative overflow-hidden" aria-labelledby="hero-title">
            {/* Atmosphere: a faint grid that fades out, and one gold glow behind the console. */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="bg-grid mask-fade-b absolute inset-0 opacity-70" />
                <div className="absolute -right-32 top-10 h-[520px] w-[520px] rounded-full bg-gold/10 blur-[120px]" />
                <div className="absolute -left-40 bottom-0 h-[420px] w-[420px] rounded-full bg-navy-400/20 blur-[120px]" />
            </div>

            <MaxWidthWrapper className="relative">
                <div className="grid items-center gap-14 py-20 md:py-28 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-32">
                    <LeftHero />
                    <RightHero />
                </div>
            </MaxWidthWrapper>
        </section>
    );
};
