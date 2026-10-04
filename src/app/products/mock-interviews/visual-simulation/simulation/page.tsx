'use client';

import dynamic from 'next/dynamic';

// The simulation pulls in face-api.js and TensorFlow, which touch `navigator`
// at import time, so the whole room is loaded on the client only.
const SimulationRoom = dynamic(() => import('./SimulationPage'), {
  ssr: false,
  loading: () => (
    <div className="grid min-h-[60vh] place-items-center font-mono text-sm text-muted-foreground">
      Loading the interview room…
    </div>
  ),
});

export default function Page() {
  return <SimulationRoom />;
}
