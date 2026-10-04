import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { generateMetadata } from "@/lib/generateMetadata";

export const metadata = generateMetadata({ title: "Resources · InterviewMaster.ai" });

// The root layout already provides <html>, <body>, Header and Footer.
// This layout only frames the section content.
export default function ResourcesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MaxWidthWrapper className="py-10 md:py-14">{children}</MaxWidthWrapper>;
}
