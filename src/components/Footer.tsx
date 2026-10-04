import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Logo } from "@/components/Logo";
import { MaxWidthWrapper } from "./MaxWidthWrapper";
import { legalLinks, navigationSections, socialLinks } from "./navigation-data";

export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="relative mt-24 border-t border-border bg-navy-950">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <MaxWidthWrapper>
                <div className="grid gap-12 py-16 md:grid-cols-12 md:py-20">
                    <div className="md:col-span-4">
                        <Logo size="md" />
                        <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            Practise the interview out loud with an AI that listens, scores your answer and tells you what to fix. Then do it again.
                        </p>
                        <div className="mt-6 flex items-center gap-1">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-gold"
                                >
                                    <s.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 lg:grid-cols-5">
                        {navigationSections.map((section) => (
                            <div key={section.key}>
                                <Link href={section.href} className="group inline-flex items-center gap-1 font-display text-sm font-semibold text-foreground">
                                    {section.title}
                                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                                </Link>
                                <ul className="mt-4 space-y-2.5">
                                    {section.links
                                        .filter((l) => !l.indexOnly)
                                        .map((link) => (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    {link.label}
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-white/5 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
                    <p>© {year} Sameer · InterviewMaster.ai. All rights reserved.</p>
                    <ul className="flex items-center gap-5">
                        {legalLinks.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="transition-colors hover:text-foreground">
                                    {l.label}
                                </Link>
                            </li>
                        ))}
                        <li className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Built for candidates</li>
                    </ul>
                </div>
            </MaxWidthWrapper>
        </footer>
    );
}
