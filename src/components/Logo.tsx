import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({
    className,
    size = "md",
    showWordmark = true,
    href = "/",
}: {
    className?: string;
    href?: string;
    size?: "sm" | "md" | "lg";
    showWordmark?: boolean;
    /** Kept for backwards compatibility with older call sites. */
    variant?: string;
}) => {
    const px = size === "lg" ? 44 : size === "sm" ? 28 : 36;
    return (
        <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="InterviewMaster.ai home">
            <span className="relative grid place-items-center rounded-xl bg-navy-800 ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-glow" style={{ width: px + 8, height: px + 8 }}>
                <Image width={px} height={px} src="/logo.svg" alt="" priority />
            </span>
            {showWordmark && (
                <span className="font-display text-[1.15rem] font-semibold tracking-tight text-foreground">
                    interviewmaster<span className="text-gold">.ai</span>
                </span>
            )}
        </Link>
    );
};
