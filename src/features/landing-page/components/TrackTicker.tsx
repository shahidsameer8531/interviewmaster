"use client";

const tracks = [
    "Software Engineer",
    "Product Manager",
    "Data Scientist",
    "Frontend Engineer",
    "Backend Engineer",
    "Engineering Manager",
    "DevOps / SRE",
    "Business Analyst",
    "UX Designer",
    "Machine Learning Engineer",
    "QA Engineer",
    "Solutions Architect",
];

/**
 * A quiet strip under the hero listing the interview tracks you can practise.
 * It scrolls continuously and pauses on hover; the list is duplicated so the
 * loop is seamless.
 */
export const TrackTicker = () => {
    const items = [...tracks, ...tracks];
    return (
        <div className="relative border-y border-white/5 bg-navy-950/40 py-4" aria-label="Interview tracks available">
            <div className="mask-fade-x overflow-hidden">
                <ul className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap px-4 [animation-play-state:running] hover:[animation-play-state:paused] motion-reduce:animate-none">
                    {items.map((t, i) => (
                        <li
                            key={`${t}-${i}`}
                            className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                            aria-hidden={i >= tracks.length}
                        >
                            <span className="h-1 w-1 rounded-full bg-gold/80" />
                            {t}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
