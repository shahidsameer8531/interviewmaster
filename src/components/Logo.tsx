import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string; }) => {
    return (
        <Link href="/" className={cn("flex items-center", className)}>
            <Image
                width={50}
                height={50}
                src="/logo.svg"
                alt="InterviewMaster.ai"
            />
            <p className="font-semibold leading-relaxed text-2xl">interviewmaster.ai</p>
        </Link>
    )
}