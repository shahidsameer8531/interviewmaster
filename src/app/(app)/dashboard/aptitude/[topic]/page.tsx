import { Suspense } from "react";
import { notFound } from "next/navigation";

import { AptitudePractice } from "@/features/aptitude/AptitudePractice";
import { Eyebrow } from "@/components/app/Eyebrow";
import { isTopicId } from "@/data/aptitude";

export default function AptitudeTopicPage({ params }: { params: { topic: string } }) {
  if (!isTopicId(params.topic)) notFound();
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[40vh] place-items-center" role="status">
          <Eyebrow>Loading</Eyebrow>
        </div>
      }
    >
      <AptitudePractice key={params.topic} topic={params.topic} />
    </Suspense>
  );
}
