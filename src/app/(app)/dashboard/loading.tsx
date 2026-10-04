/**
 * Quiet loading state for app screens. The root loading.tsx carries
 * marketing copy and animation, which does not belong in Prep Room.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
      <p className="font-mono text-app-label uppercase text-app-ink-3">Loading</p>
    </div>
  );
}
