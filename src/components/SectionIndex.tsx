'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { ChipBanner } from "@/components/ChipBanner";
import { getSection, type NavSection } from "@/components/navigation-data";

export const SectionIndex = ({ sectionKey }: { sectionKey: NavSection["key"] }) => {
    const section = getSection(sectionKey);

    return (
        <div>
            <div className="max-w-2xl">
                <ChipBanner text={section.eyebrow} />
                <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    {section.title}
                </h1>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{section.tagline}</p>
            </div>

            <motion.ul
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
                {section.links.map((link) => (
                    <motion.li key={link.href} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>
                        <Link
                            href={link.href}
                            className="surface group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_60px_-28px_rgba(252,186,40,0.35)]"
                        >
                            <div className="flex items-start justify-between">
                                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/15 transition-colors group-hover:bg-gold group-hover:text-navy-950">
                                    <link.icon className="h-5 w-5" />
                                </span>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-gold group-hover:opacity-100" />
                            </div>
                            <h2 className="mt-5 font-display text-lg font-semibold text-foreground">{link.label}</h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{link.description}</p>
                        </Link>
                    </motion.li>
                ))}
            </motion.ul>
        </div>
    );
};
