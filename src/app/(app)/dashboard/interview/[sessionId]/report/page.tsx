import { ReportScreen } from "@/features/interview/ReportScreen";

export default function ReportPage({ params }: { params: { sessionId: string } }) {
  return <ReportScreen sessionId={params.sessionId} />;
}
