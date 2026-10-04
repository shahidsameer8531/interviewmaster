import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";

const variants = ["rail", "focus"] as const;

/**
 * Shell previews. /dashboard/dev-kit/rail shows the icon rail and
 * /dashboard/dev-kit/focus the full-screen room layout.
 */
export default function DevKitVariantPage({ params }: { params: { variant: string } }) {
  if (process.env.NODE_ENV === "production") notFound();
  if (!variants.includes(params.variant as (typeof variants)[number])) notFound();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        breadcrumb={[{ label: "Dev kit", href: "/dashboard/dev-kit" }, { label: `${params.variant} shell` }]}
        title={params.variant === "rail" ? "Icon rail shell" : "Focus shell"}
        meta={
          params.variant === "rail"
            ? "76px icon-only navigation. Used by the resume builder."
            : "No navigation. Used by the interview room."
        }
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/dev-kit">Back to the kit</Link>
          </Button>
        }
      />
      <div className="grid min-h-[40vh] place-items-center rounded-app-card border border-app-line bg-app-card p-6 text-app-small text-app-ink-2">
        Resize the window below 820px to see the shell stack.
      </div>
    </div>
  );
}
