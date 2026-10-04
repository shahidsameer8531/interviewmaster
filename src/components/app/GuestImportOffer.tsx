"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { ArrowRight } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/app/StatusChip";
import { useAppUser } from "@/features/app-data/hooks";
import { GUEST_KEYS, clearGuestStore, useGuestCollection, useGuestValue } from "@/features/app-data/guest-store";
import type { AptitudeAttempt, CoachingRequest, InterviewSession, Resume, Target } from "@/features/app-data/types";

const DISMISS_PREFIX = "im.guest.import.dismissed.";

/**
 * Shown once someone signs in while guest history is still in this browser.
 * One bulk mutation moves everything into the account; the guest store is
 * cleared only after it succeeds.
 */
export const GuestImportOffer = () => {
  const { isAuthenticated, user } = useAppUser();
  const sessions = useGuestCollection<InterviewSession>(GUEST_KEYS.sessions);
  const resumes = useGuestCollection<Resume>(GUEST_KEYS.resumes);
  const aptitude = useGuestCollection<AptitudeAttempt>(GUEST_KEYS.aptitude);
  const coaching = useGuestCollection<CoachingRequest>(GUEST_KEYS.coaching);
  const target = useGuestValue<Target | null>(GUEST_KEYS.target, null);
  const importGuest = useMutation(api.importGuestData.importGuest);

  const [dismissed, setDismissed] = useState(true);
  const [state, setState] = useState<"idle" | "moving" | "done" | "error">("idle");
  const [moved, setMoved] = useState<number | null>(null);

  const userKey = user?._id ? `${DISMISS_PREFIX}${user._id}` : null;
  useEffect(() => {
    if (!userKey) return;
    try {
      setDismissed(localStorage.getItem(userKey) === "1");
    } catch {
      setDismissed(false);
    }
  }, [userKey]);

  const total = sessions.length + resumes.length + aptitude.length + coaching.length + (target ? 1 : 0);
  if (!isAuthenticated || !user || dismissed || (total === 0 && state !== "done")) return null;

  const parts = [
    sessions.length ? `${sessions.length} interview session${sessions.length === 1 ? "" : "s"}` : null,
    resumes.length ? `${resumes.length} resume${resumes.length === 1 ? "" : "s"}` : null,
    aptitude.length ? `${aptitude.length} aptitude answer${aptitude.length === 1 ? "" : "s"}` : null,
    coaching.length ? `${coaching.length} coaching request${coaching.length === 1 ? "" : "s"}` : null,
    target ? "your target" : null,
  ].filter(Boolean);

  const move = async () => {
    setState("moving");
    try {
      const strip = <T extends { id: string }>(items: T[]) => items.map(({ id: _id, ...rest }) => rest);
      const result = await importGuest({
        target: target ?? undefined,
        sessions: strip(sessions),
        resumes: strip(resumes),
        aptitude: strip(aptitude),
        coaching: strip(coaching),
      });
      clearGuestStore();
      setMoved(result.sessions + result.resumes + result.aptitude + result.coaching);
      setState("done");
    } catch {
      setState("error");
    }
  };

  const dismiss = () => {
    setDismissed(true);
    if (userKey) {
      try {
        localStorage.setItem(userKey, "1");
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <section
      className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-app-card border border-app-sky/30 bg-app-sky/10 px-5 py-4"
      aria-label="Guest history"
      role="status"
    >
      {state === "done" ? (
        <>
          <p className="text-app-body text-app-ink-1">
            Moved {moved} item{moved === 1 ? "" : "s"} into your account. Your guest history in this browser is cleared.
          </p>
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Close
          </Button>
        </>
      ) : (
        <>
          <div className="min-w-0">
            <p className="text-app-ui text-app-ink-1">You practised as a guest in this browser.</p>
            <p className="mt-0.5 text-app-small text-app-ink-2">
              Move {parts.join(", ")} into your account so it shows on every device.
            </p>
            {state === "error" && (
              <StatusChip tone="orange" className="mt-2">
                Couldn&apos;t move it. Try again.
              </StatusChip>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={dismiss} disabled={state === "moving"}>
              Not now
            </Button>
            <Button variant="outline" size="sm" onClick={move} disabled={state === "moving"}>
              {state === "moving" ? "Moving" : "Move into my account"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
