"use client";

import dynamic from "next/dynamic";

import { Eyebrow } from "@/components/app/Eyebrow";

// The room uses face-api.js and the browser media APIs, so it is loaded on
// the client only.
const RoomScreen = dynamic(() => import("@/features/interview/RoomScreen"), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center" role="status">
      <Eyebrow>Opening your room</Eyebrow>
    </div>
  ),
});

export default function InterviewRoomPage({ params }: { params: { sessionId: string } }) {
  return <RoomScreen sessionId={params.sessionId} />;
}
