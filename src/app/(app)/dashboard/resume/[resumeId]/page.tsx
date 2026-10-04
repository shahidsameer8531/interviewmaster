import { ResumeBuilder } from "@/features/resume/ResumeBuilder";

export default function ResumeBuilderPage({ params }: { params: { resumeId: string } }) {
  return <ResumeBuilder resumeId={params.resumeId} />;
}
