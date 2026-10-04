import { CalendarDays } from "lucide-react";

import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

/**
 * Today. Phase 2 replaces this with the real screen; for now it proves the
 * shell and carries no numbers.
 */
export default function TodayPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader eyebrow="Today" title="Prep Room" meta="Your practice home. Sessions, scores and the next round appear here." />
      <EmptyState
        icon={CalendarDays}
        text="Today arrives in the next phase. Until then, nothing here is a real number."
        action={{ label: "Open the component kit", href: "/dashboard/dev-kit" }}
      />
    </div>
  );
}
