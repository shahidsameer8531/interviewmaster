import { cn } from "@/lib/utils";

/**
 * Section eyebrow. Monospace, tracked out, with a short gold rule so it reads
 * as a label rather than a pill.
 */
export const ChipBanner = ({ text, className }: { text: string; className?: string }) => {
    return (
        <div className={cn("inline-flex items-center gap-3", className)}>
            <span aria-hidden className="h-px w-6 bg-gold/70" />
            <span className="eyebrow">{text}</span>
        </div>
    );
};
