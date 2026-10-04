"use client";

import { useCallback, useMemo } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/features/auth/api/useCurrentUser";
import {
  GUEST_KEYS,
  guestId,
  insertGuest,
  patchGuest,
  removeGuest,
  useGuestCollection,
  useGuestValue,
  writeJson,
} from "./guest-store";
import type {
  AptitudeAttempt,
  CoachingRequest,
  CoachingStatus,
  InterviewSession,
  NewSession,
  Resume,
  SessionPatch,
  Target,
} from "./types";

/**
 * One hook per collection. Signed-in people read and write Convex; guests
 * read and write localStorage with the same shapes. Screens never branch on
 * auth themselves.
 */

export function useAppUser() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useCurrentUser();
  return {
    isAuthenticated,
    isLoading,
    isGuest: !isLoading && !isAuthenticated,
    user,
    firstName: user?.name?.trim().split(/\s+/)[0] ?? null,
  };
}

/* ------------------------------ Target ------------------------------ */

export function useTarget() {
  const { isAuthenticated, user, isLoading } = useAppUser();
  const guestTarget = useGuestValue<Target | null>(GUEST_KEYS.target, null);
  const updateTarget = useMutation(api.users.updateTarget);

  const target: Target | null = isAuthenticated
    ? user
      ? {
          targetRole: user.targetRole,
          targetCompany: user.targetCompany,
          targetLevel: user.targetLevel,
          loopDate: user.loopDate,
          planStartedAt: user.planStartedAt,
        }
      : null
    : guestTarget;

  const save = useCallback(
    async (next: Omit<Target, "planStartedAt">) => {
      if (isAuthenticated) {
        await updateTarget(next);
        return;
      }
      const existing = guestTarget;
      writeJson(GUEST_KEYS.target, { ...existing, ...next, planStartedAt: existing?.planStartedAt ?? Date.now() });
    },
    [isAuthenticated, updateTarget, guestTarget]
  );

  return { target, save, isLoading };
}

/* ------------------------------ Sessions ------------------------------ */

type SessionDoc = NonNullable<ReturnType<typeof useQuery<typeof api.interviewSessions.list>>>[number];
const fromSessionDoc = (d: SessionDoc): InterviewSession => ({ ...d, id: d._id });

export function useSessions() {
  const { isAuthenticated, isLoading } = useAppUser();
  const docs = useQuery(api.interviewSessions.list, isAuthenticated ? {} : "skip");
  const guest = useGuestCollection<InterviewSession>(GUEST_KEYS.sessions);

  const create = useMutation(api.interviewSessions.create);
  const update = useMutation(api.interviewSessions.update);
  const remove = useMutation(api.interviewSessions.remove);

  const items = useMemo<InterviewSession[]>(() => {
    if (isAuthenticated) return (docs ?? []).map(fromSessionDoc);
    return [...guest].sort((a, b) => b.startedAt - a.startedAt);
  }, [isAuthenticated, docs, guest]);

  const createSession = useCallback(
    async (input: NewSession): Promise<string> => {
      if (isAuthenticated) return await create(input);
      const s: InterviewSession = { id: guestId("s"), ...input, status: "in_progress", startedAt: Date.now(), questions: [] };
      insertGuest(GUEST_KEYS.sessions, s);
      return s.id;
    },
    [isAuthenticated, create]
  );

  const updateSession = useCallback(
    async (id: string, patch: SessionPatch) => {
      if (isAuthenticated) {
        await update({ id: id as Id<"interviewSessions">, ...patch });
        return;
      }
      patchGuest<InterviewSession>(GUEST_KEYS.sessions, id, patch);
    },
    [isAuthenticated, update]
  );

  const removeSession = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await remove({ id: id as Id<"interviewSessions"> });
        return;
      }
      removeGuest<InterviewSession>(GUEST_KEYS.sessions, id);
    },
    [isAuthenticated, remove]
  );

  return {
    sessions: items,
    isLoading: isLoading || (isAuthenticated && docs === undefined),
    createSession,
    updateSession,
    removeSession,
  };
}

export function useSession(id: string | null) {
  const { isAuthenticated } = useAppUser();
  const looksConvex = Boolean(id) && !id!.startsWith("s_");
  const doc = useQuery(api.interviewSessions.get, isAuthenticated && id && looksConvex ? { id: id as Id<"interviewSessions"> } : "skip");
  const guest = useGuestCollection<InterviewSession>(GUEST_KEYS.sessions);
  if (!id) return null;
  if (isAuthenticated && looksConvex) return doc ? fromSessionDoc(doc) : doc === null ? null : undefined;
  return guest.find((s) => s.id === id) ?? null;
}

/* ------------------------------ Resumes ------------------------------ */

type ResumeDoc = NonNullable<ReturnType<typeof useQuery<typeof api.resumes.list>>>[number];
const fromResumeDoc = (d: ResumeDoc): Resume => ({ ...d, id: d._id });

export function useResumes() {
  const { isAuthenticated, isLoading } = useAppUser();
  const docs = useQuery(api.resumes.list, isAuthenticated ? {} : "skip");
  const guest = useGuestCollection<Resume>(GUEST_KEYS.resumes);
  const create = useMutation(api.resumes.create);
  const update = useMutation(api.resumes.update);
  const remove = useMutation(api.resumes.remove);

  const items = useMemo<Resume[]>(() => {
    if (isAuthenticated) return (docs ?? []).map(fromResumeDoc);
    return [...guest].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [isAuthenticated, docs, guest]);

  const createResume = useCallback(
    async (input: { name: string; data: unknown; jobDescription?: string }): Promise<string> => {
      if (isAuthenticated) return await create(input);
      const r: Resume = { id: guestId("r"), ...input, version: 1, updatedAt: Date.now() };
      insertGuest(GUEST_KEYS.resumes, r);
      return r.id;
    },
    [isAuthenticated, create]
  );

  const updateResume = useCallback(
    async (id: string, patch: Partial<Pick<Resume, "name" | "data" | "jobDescription" | "atsScore">>) => {
      if (isAuthenticated) {
        await update({ id: id as Id<"resumes">, ...patch });
        return;
      }
      const existing = guest.find((r) => r.id === id);
      patchGuest<Resume>(GUEST_KEYS.resumes, id, {
        ...patch,
        version: patch.data !== undefined && existing ? existing.version + 1 : existing?.version,
        updatedAt: Date.now(),
      });
    },
    [isAuthenticated, update, guest]
  );

  const removeResume = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        await remove({ id: id as Id<"resumes"> });
        return;
      }
      removeGuest<Resume>(GUEST_KEYS.resumes, id);
    },
    [isAuthenticated, remove]
  );

  return { resumes: items, isLoading: isLoading || (isAuthenticated && docs === undefined), createResume, updateResume, removeResume };
}

/* ------------------------------ Aptitude ------------------------------ */

type AttemptDoc = NonNullable<ReturnType<typeof useQuery<typeof api.aptitudeAttempts.list>>>[number];
const fromAttemptDoc = (d: AttemptDoc): AptitudeAttempt => ({ ...d, id: d._id });

export function useAptitudeAttempts() {
  const { isAuthenticated, isLoading } = useAppUser();
  const docs = useQuery(api.aptitudeAttempts.list, isAuthenticated ? {} : "skip");
  const guest = useGuestCollection<AptitudeAttempt>(GUEST_KEYS.aptitude);
  const record = useMutation(api.aptitudeAttempts.record);

  const items = useMemo<AptitudeAttempt[]>(() => {
    if (isAuthenticated) return (docs ?? []).map(fromAttemptDoc);
    return [...guest].sort((a, b) => b.at - a.at);
  }, [isAuthenticated, docs, guest]);

  const recordAttempt = useCallback(
    async (input: Omit<AptitudeAttempt, "id" | "at">) => {
      if (isAuthenticated) {
        await record(input);
        return;
      }
      insertGuest(GUEST_KEYS.aptitude, { id: guestId("a"), ...input, at: Date.now() });
    },
    [isAuthenticated, record]
  );

  return { attempts: items, isLoading: isLoading || (isAuthenticated && docs === undefined), recordAttempt };
}

/* ------------------------------ Coaching ------------------------------ */

type CoachingDoc = NonNullable<ReturnType<typeof useQuery<typeof api.coachingRequests.list>>>[number];
const fromCoachingDoc = (d: CoachingDoc): CoachingRequest => ({ ...d, id: d._id });

export function useCoachingRequests() {
  const { isAuthenticated, isLoading } = useAppUser();
  const docs = useQuery(api.coachingRequests.list, isAuthenticated ? {} : "skip");
  const guest = useGuestCollection<CoachingRequest>(GUEST_KEYS.coaching);
  const create = useMutation(api.coachingRequests.create);
  const updateStatus = useMutation(api.coachingRequests.updateStatus);

  const items = useMemo<CoachingRequest[]>(() => {
    if (isAuthenticated) return (docs ?? []).map(fromCoachingDoc);
    return [...guest].sort((a, b) => b.createdAt - a.createdAt);
  }, [isAuthenticated, docs, guest]);

  const createRequest = useCallback(
    async (input: Omit<CoachingRequest, "id" | "status" | "createdAt">): Promise<string> => {
      if (isAuthenticated) return await create(input);
      const r: CoachingRequest = { id: guestId("c"), ...input, status: "requested", createdAt: Date.now() };
      insertGuest(GUEST_KEYS.coaching, r);
      return r.id;
    },
    [isAuthenticated, create]
  );

  const setStatus = useCallback(
    async (id: string, status: CoachingStatus) => {
      if (isAuthenticated) {
        await updateStatus({ id: id as Id<"coachingRequests">, status });
        return;
      }
      patchGuest<CoachingRequest>(GUEST_KEYS.coaching, id, { status });
    },
    [isAuthenticated, updateStatus]
  );

  return { requests: items, isLoading: isLoading || (isAuthenticated && docs === undefined), createRequest, setStatus };
}
