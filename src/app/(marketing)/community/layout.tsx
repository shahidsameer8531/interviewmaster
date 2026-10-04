import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { generateMetadata } from "@/lib/generateMetadata";

export const metadata = generateMetadata({ title: "Community · InterviewMaster.ai" });

// The root layout already provides <html>, <body>, Header and Footer.
// This layout only frames the section content.
export default function CommunityLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MaxWidthWrapper className="py-10 md:py-14">{children}</MaxWidthWrapper>;
}
