import { Suspense } from "react";

import { CoachingScreen } from "@/features/coaching/CoachingScreen";
import { Eyebrow } from "@/components/app/Eyebrow";

export default function CoachingPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[40vh] place-items-center" role="status">
          <Eyebrow>Loading</Eyebrow>
        </div>
      }
    >
      <CoachingScreen />
    </Suspense>
  );
}
