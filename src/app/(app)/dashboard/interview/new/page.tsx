import { Suspense } from "react";

import { SetupScreen } from "@/features/interview/SetupScreen";
import { Eyebrow } from "@/components/app/Eyebrow";

export default function InterviewSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[40vh] place-items-center" role="status">
          <Eyebrow>Loading</Eyebrow>
        </div>
      }
    >
      <SetupScreen />
    </Suspense>
  );
}
