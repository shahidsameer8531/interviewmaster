import { MaxWidthWrapper } from "@/components/MaxWidthWrapper";
import { generateMetadata } from "@/lib/generateMetadata";

export const metadata = generateMetadata({ title: "Company · InterviewMaster.ai" });

// The root layout already provides <html>, <body>, Header and Footer.
// This layout only frames the section content.
export default function CompanyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <MaxWidthWrapper className="py-10 md:py-14">{children}</MaxWidthWrapper>;
}
