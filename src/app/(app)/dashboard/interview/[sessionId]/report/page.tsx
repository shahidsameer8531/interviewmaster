import { ReportPlaceholder } from "@/features/interview/ReportPlaceholder";

/** Stop B replaces this with the scored report. */
export default function ReportPage({ params }: { params: { sessionId: string } }) {
  return <ReportPlaceholder sessionId={params.sessionId} />;
}
