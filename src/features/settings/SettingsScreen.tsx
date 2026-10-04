"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { Field, Input, Select } from "@/components/app/Field";
import { StatusChip } from "@/components/app/StatusChip";
import { Eyebrow } from "@/components/app/Eyebrow";
import { useAppUser, useTarget } from "@/features/app-data/hooks";
import { LEVELS } from "@/features/app-data/types";

/**
 * Settings. For now only the target: role, company, level and loop date.
 * Everything on Today and in interview setup is prefilled from it.
 */
export const SettingsScreen = () => {
  const { target, save, isLoading } = useTarget();
  const { isGuest } = useAppUser();
  const [form, setForm] = useState({ targetRole: "", targetCompany: "", targetLevel: "", loopDate: "" });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load the saved target into the form once it arrives.
  useEffect(() => {
    if (!target) return;
    setForm({
      targetRole: target.targetRole ?? "",
      targetCompany: target.targetCompany ?? "",
      targetLevel: target.targetLevel ?? "",
      loopDate: target.loopDate ?? "",
    });
  }, [target]);

  useEffect(() => {
    if (state !== "saved") return;
    const t = setTimeout(() => setState("idle"), 2500);
    return () => clearTimeout(t);
  }, [state]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("saving");
    try {
      await save({
        targetRole: form.targetRole.trim() || undefined,
        targetCompany: form.targetCompany.trim() || undefined,
        targetLevel: form.targetLevel || undefined,
        loopDate: form.loopDate || undefined,
      });
      setState("saved");
    } catch {
      setState("error");
    }
  };

  const planStarted = target?.planStartedAt ? new Date(target.planStartedAt) : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Settings"
        title="Your target"
        meta="Today, the sidebar and interview setup are built around this. Change it any time."
      />

      <form onSubmit={onSubmit} className="rounded-app-card border border-app-line bg-app-card p-6" aria-busy={state === "saving"}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Target role" htmlFor="target-role" hint="What the job posting calls it.">
            <Input
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              placeholder="Senior Product Manager"
              autoComplete="organization-title"
              disabled={isLoading}
            />
          </Field>
          <Field label="Company" htmlFor="target-company">
            <Input
              value={form.targetCompany}
              onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
              placeholder="Stripe"
              autoComplete="organization"
              disabled={isLoading}
            />
          </Field>
          <Field label="Level" htmlFor="target-level" hint="Sets the bar your report scores are measured against.">
            <Select value={form.targetLevel} onChange={(e) => setForm({ ...form, targetLevel: e.target.value })} disabled={isLoading}>
              <option value="">Choose a level</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Loop date" htmlFor="target-loop" hint="The day of the real interview, if you have one.">
            <Input type="date" value={form.loopDate} onChange={(e) => setForm({ ...form, loopDate: e.target.value })} disabled={isLoading} />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-app-line pt-5">
          <Button type="submit" disabled={state === "saving" || isLoading}>
            {state === "saving" ? "Saving" : "Save target"}
          </Button>
          {state === "saved" && (
            <StatusChip tone="sky" icon={Check}>
              Saved
            </StatusChip>
          )}
          {state === "error" && <StatusChip tone="orange">Could not save. Try again.</StatusChip>}
          {planStarted && (
            <span className="ml-auto text-app-small text-app-ink-3">
              Plan started {planStarted.toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </form>

      {isGuest && (
        <div className="rounded-app-card border border-app-line bg-app-card p-6">
          <Eyebrow>Account</Eyebrow>
          <p className="mt-2 text-app-body text-app-ink-2">
            You are practising as a guest. Your target and history live in this browser. Sign in to keep them on every device.
          </p>
        </div>
      )}
    </div>
  );
};
