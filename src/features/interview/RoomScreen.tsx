"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, Eye, EyeOff, Mic, MicOff, Pause, Play, RotateCcw, SkipForward } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eyebrow } from "@/components/app/Eyebrow";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusChip } from "@/components/app/StatusChip";
import { Textarea } from "@/components/app/Field";
import { speechService } from "@/services/speech";
import { useAppUser, useSession, useSessions } from "@/features/app-data/hooks";
import { STYLE_LABELS, TRACK_LABELS, type InterviewerStyle, type SessionQuestion, type Track } from "@/features/app-data/types";
import { QUESTIONS_FOR_LENGTH, loadRoomOptions, type RoomOptions } from "./config";
import { answerStats, eyeTone, fillerTone, lengthTone, markFillers, mmss, paceTone, sessionDelivery, type AnswerStats, type FaceSample, type TranscriptEvent } from "./delivery";
import { readFace } from "./face";
import { useUserMedia } from "./media";
import { saveClip, startClip } from "./recordings";
import { isSpeechRecognitionSupported, startRecognition, type RecognitionHandle } from "./speech-recognition";
import { WaveAvatar, type InterviewerState } from "./WaveAvatar";

type Phase = "loading" | "asking" | "speaking" | "answering" | "paused" | "finishing" | "error";
type Turn = { who: "interviewer" | "you"; text: string; isFollowUp?: boolean };

const SIGNALS_KEY = "im.room.hideSignals";

const readHideSignals = () => {
  try {
    return localStorage.getItem(SIGNALS_KEY) === "1";
  } catch {
    return false;
  }
};
const writeHideSignals = (v: boolean) => {
  try {
    localStorage.setItem(SIGNALS_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
};

const initialsOf = (name: string | null | undefined) =>
  (name ?? "You")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Signal = ({ label, value, note, tone }: { label: string; value: string; note: string; tone: "neutral" | "sky" | "orange" }) => (
  <div className="rounded-app-panel bg-app-hover/40 p-3">
    <Eyebrow>{label}</Eyebrow>
    <p className="mt-1 font-display text-xl font-semibold tabular-nums text-app-ink-1">{value}</p>
    <StatusChip tone={tone} className="mt-2">
      {note}
    </StatusChip>
  </div>
);

export const RoomScreen = ({ sessionId }: { sessionId: string }) => {
  const router = useRouter();
  const { user } = useAppUser();
  const session = useSession(sessionId);
  const { updateSession } = useSessions();

  const [options, setOptions] = useState<RoomOptions | null>(null);
  useEffect(() => setOptions(loadRoomOptions(sessionId)), [sessionId]);

  const total = session ? (QUESTIONS_FOR_LENGTH[session.lengthMin] ?? 3) : 3;

  /* ---------------- live state ---------------- */
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [current, setCurrent] = useState<{ text: string; isFollowUp: boolean; startedAt: number } | null>(null);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [typed, setTyped] = useState("");
  const [answerStartedAt, setAnswerStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [hideSignals, setHideSignals] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [typedMode, setTypedMode] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [lastFaces, setLastFaces] = useState<FaceSample[]>([]);

  const savedRef = useRef<SessionQuestion[]>([]);
  const statsRef = useRef<AnswerStats[]>([]);
  const eventsRef = useRef<TranscriptEvent[]>([]);
  const facesRef = useRef<FaceSample[]>([]);
  const recogRef = useRef<RecognitionHandle | null>(null);
  const clipRef = useRef<{ stop: () => Promise<Blob | null> } | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const startedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => setHideSignals(readHideSignals()), []);
  useEffect(() => {
    if (!options) return;
    setTypedMode(options.typedAnswers || !isSpeechRecognitionSupported());
  }, [options]);

  /* ---------------- media ---------------- */
  const media = useUserMedia({
    video: Boolean(options?.cameraAnalysis),
    audio: Boolean(options?.voiceAnalysis) || Boolean(options?.keepRecording),
    cameraDeviceId: options?.cameraDeviceId,
    micDeviceId: options?.micDeviceId,
    enabled: Boolean(options) && phase !== "finishing",
  });

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = media.stream && media.stream.getVideoTracks().length ? media.stream : null;
  }, [media.stream]);

  useEffect(() => {
    media.stream?.getVideoTracks().forEach((t) => (t.enabled = !cameraOff));
  }, [cameraOff, media.stream]);

  useEffect(() => {
    media.stream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }, [muted, media.stream]);

  // If the mic was refused in the room itself, switch to typing.
  useEffect(() => {
    if (options?.voiceAnalysis && media.mic === "denied") {
      setTypedMode(true);
      setMicError("Microphone access was refused. Type your answers instead.");
    }
  }, [media.mic, options?.voiceAnalysis]);

  /* ---------------- clock ---------------- */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const sessionStart = session?.startedAt ?? now;
  const elapsedSec = Math.max(0, Math.floor((now - sessionStart - pausedTotalRef.current) / 1000));

  /* ---------------- face sampling while answering ---------------- */
  const signalsOn = !hideSignals;
  useEffect(() => {
    const el = videoRef.current;
    if (phase !== "answering" || !options?.cameraAnalysis || cameraOff || !el || !media.stream?.getVideoTracks().length) return;
    let cancelled = false;
    let timer = 0;
    const tick = async () => {
      try {
        const r = await readFace(el);
        if (cancelled) return;
        const sample: FaceSample = { at: Date.now(), found: r.found, looking: r.looking, centered: r.centered };
        facesRef.current.push(sample);
        setLastFaces((prev) => [...prev.slice(-4), sample]);
      } catch {
        /* face-api unavailable; eye contact stays unknown */
      }
      if (!cancelled) timer = window.setTimeout(tick, 1000);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, options?.cameraAnalysis, cameraOff, media.stream]);

  /* ---------------- questions ---------------- */
  const fetchNext = useCallback(
    async (previous: { question: string; answer: string }[]) => {
      if (!session) return;
      setPhase("asking");
      setError(null);
      try {
        const res = await fetch("/api/interview/next-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            track: session.track,
            role: session.role,
            company: session.company,
            level: session.level,
            style: session.style,
            questionIndex: previous.length,
            totalQuestions: total,
            jobDescription: options?.jobDescription,
            focus: options?.focus,
            previous,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as { question?: string; isFollowUp?: boolean; error?: string };
        if (!res.ok || !data.question) throw new Error(data.error || "Couldn't get the next question. Try again.");
        const q = { text: data.question, isFollowUp: Boolean(data.isFollowUp), startedAt: Date.now() };
        setCurrent(q);
        setTurns((t) => [...t, { who: "interviewer", text: q.text, isFollowUp: q.isFollowUp }]);
        setPhase("speaking");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't get the next question. Try again.");
        setPhase("error");
      }
    },
    [session, total, options]
  );

  /* ---------------- listening ----------------
     Exactly one recognition instance at a time, and never while the
     interviewer is speaking, so the interviewer's voice is not transcribed
     as the answer. */
  const phaseRef = useRef<Phase>("loading");
  phaseRef.current = phase;
  const typedModeRef = useRef(typedMode);
  typedModeRef.current = typedMode;
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    recogRef.current = null;
  }, []);

  const startListening = useCallback(() => {
    stopListening();
    if (typedModeRef.current || mutedRef.current) return;
    recogRef.current = startRecognition({
      onFinal: (text) => {
        eventsRef.current.push({ at: Date.now(), text, isFinal: true });
        setFinalText((f) => (f ? `${f} ${text}` : text));
        setInterim("");
      },
      onInterim: (text) => {
        eventsRef.current.push({ at: Date.now(), text, isFinal: false });
        setInterim(text);
      },
      onError: (message) => {
        setMicError(message);
        if (message.includes("refused")) setTypedMode(true);
      },
    });
  }, [stopListening]);

  // Speaks a line with the mic paused. Only the latest utterance may resume
  // listening, so repeating a question mid-sentence cannot restart it twice.
  const speakTokenRef = useRef(0);
  const speakWithMicPaused = useCallback(
    (text: string, onDone?: () => void) => {
      const token = ++speakTokenRef.current;
      stopListening();
      const finish = () => {
        if (token !== speakTokenRef.current) return;
        if (phaseRef.current === "answering") startListening();
        onDone?.();
      };
      if (!speechService.isSupported) {
        finish();
        return;
      }
      speechService.speak(text, undefined, finish);
    },
    [stopListening, startListening]
  );

  const beginListening = useCallback(() => {
    const startedAt = Date.now();
    setAnswerStartedAt(startedAt);
    setFinalText("");
    setInterim("");
    setTyped("");
    eventsRef.current = [];
    facesRef.current = [];
    setLastFaces([]);
    setPhase("answering");
    phaseRef.current = "answering";
    if (options?.keepRecording && media.stream) clipRef.current = startClip(media.stream);
    startListening();
  }, [options?.keepRecording, media.stream, startListening]);

  // Speak the question, then listen. If speech synthesis is unavailable, listen straight away.
  // beginListening is read through a ref so a stream arriving mid-sentence
  // does not re-run this effect and repeat the question.
  const beginListeningRef = useRef(beginListening);
  beginListeningRef.current = beginListening;
  useEffect(() => {
    if (phase !== "speaking" || !current) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      beginListeningRef.current();
    };
    // Recognition is already stopped here (finalizeAnswer stops it), but the
    // mic is paused explicitly in case a repeat was still running.
    stopListening();
    if (speechService.isSupported) {
      const token = ++speakTokenRef.current;
      speechService.speak(current.text, undefined, () => {
        if (token === speakTokenRef.current) go();
      });
      const guard = setTimeout(go, 20_000);
      return () => clearTimeout(guard);
    }
    go();
  }, [phase, current, stopListening]);

  // Kick off the first question once the session and options are loaded.
  useEffect(() => {
    if (!session || !options || startedRef.current) return;
    if (session.status !== "in_progress") {
      router.replace(`/dashboard/interview/${sessionId}/report`);
      return;
    }
    startedRef.current = true;
    savedRef.current = session.questions ?? [];
    fetchNext(savedRef.current.map((q) => ({ question: q.text, answer: q.transcript })));
  }, [session, options, fetchNext, router, sessionId]);

  useEffect(() => () => stopListening(), [stopListening]);

  const transcriptNow = typedMode ? typed : [finalText, interim].filter(Boolean).join(" ");
  const liveStats = useMemo(
    () => (answerStartedAt ? answerStats(transcriptNow, eventsRef.current, facesRef.current, answerStartedAt, now) : null),
    [transcriptNow, answerStartedAt, now]
  );

  const finalizeAnswer = useCallback(
    async (skipped = false): Promise<SessionQuestion[]> => {
      stopListening();
      speakTokenRef.current++;
      speechService.stop();
      const endedAt = Date.now();
      const text = skipped ? "" : (typedMode ? typed : finalText).trim();
      const startedAt = answerStartedAt ?? current?.startedAt ?? endedAt;
      const stats = answerStats(text, eventsRef.current, facesRef.current, startedAt, endedAt);
      if (!skipped) statsRef.current.push(stats);
      const q: SessionQuestion = { text: current?.text ?? "", startedAt, durationSec: Math.round(stats.durationSec), transcript: text };
      const nextSaved = [...savedRef.current, q];
      savedRef.current = nextSaved;
      if (text) setTurns((t) => [...t, { who: "you", text }]);
      if (clipRef.current) {
        const clip = clipRef.current;
        clipRef.current = null;
        clip.stop().then((blob) => blob && saveClip(sessionId, nextSaved.length - 1, blob));
      }
      await updateSession(sessionId, { questions: nextSaved }).catch(() => {});
      setAnswerStartedAt(null);
      return nextSaved;
    },
    [typedMode, typed, finalText, answerStartedAt, current, sessionId, updateSession, stopListening]
  );

  const finishSession = useCallback(
    async (saved: SessionQuestion[]) => {
      setPhase("finishing");
      stopListening();
      speakTokenRef.current++;
      speechService.stop();
      const delivery = statsRef.current.length ? sessionDelivery(statsRef.current) : undefined;
      await updateSession(sessionId, { status: "done", endedAt: Date.now(), questions: saved, delivery }).catch(() => {});
      media.stop();
      router.push(`/dashboard/interview/${sessionId}/report`);
    },
    [sessionId, updateSession, media, router, stopListening]
  );

  const onFinishAnswer = async () => {
    const saved = await finalizeAnswer(false);
    if (saved.length >= total) return finishSession(saved);
    fetchNext(saved.map((q) => ({ question: q.text, answer: q.transcript })));
  };

  const onSkip = async () => {
    const saved = await finalizeAnswer(true);
    if (saved.length >= total) return finishSession(saved);
    fetchNext(saved.map((q) => ({ question: q.text, answer: q.transcript })));
  };

  const onEnd = async () => {
    setConfirmEnd(false);
    const saved = phase === "answering" || phase === "paused" ? await finalizeAnswer(false) : savedRef.current;
    await finishSession(saved);
  };

  const onPause = () => {
    if (phase === "answering") {
      stopListening();
      speakTokenRef.current++;
      speechService.stop();
      pausedAtRef.current = Date.now();
      setPhase("paused");
    } else if (phase === "paused") {
      if (pausedAtRef.current) pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
      setPhase("answering");
      phaseRef.current = "answering";
      startListening();
    }
  };

  // Repeating pauses the mic for the duration of the line and resumes it
  // only if an answer is still in progress.
  const onRepeat = () => {
    if (current) speakWithMicPaused(current.text);
  };

  const toggleSignals = () => {
    const next = !hideSignals;
    setHideSignals(next);
    writeHideSignals(next);
  };

  /* ---------------- render ---------------- */
  if (session === undefined) {
    return (
      <div className="grid min-h-[60vh] place-items-center" role="status">
        <Eyebrow>Loading your room</Eyebrow>
      </div>
    );
  }
  if (session === null) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <EmptyState icon={Mic} text="This session doesn't exist or belongs to another account." action={{ label: "Set up a new round", href: "/dashboard/interview/new" }} />
      </div>
    );
  }

  const track = TRACK_LABELS[session.track as Track] ?? session.track;
  const style = STYLE_LABELS[session.style as InterviewerStyle] ?? session.style;
  const questionNumber = Math.min(total, savedRef.current.length + (current ? 1 : 0)) || 1;
  const interviewerState: InterviewerState = phase === "speaking" ? "speaking" : phase === "answering" ? "listening" : phase === "asking" ? "thinking" : "idle";
  const statusLabel = phase === "speaking" ? "Speaking" : phase === "answering" ? "Listening" : phase === "asking" ? "Thinking" : phase === "paused" ? "Paused" : phase === "finishing" ? "Wrapping up" : "Waiting";
  const cameraLive = Boolean(options?.cameraAnalysis) && media.camera === "granted" && !cameraOff;
  const recent = lastFaces.slice(-5);
  const eyeSteady = recent.length >= 4 && recent.filter((f) => f.found && f.looking).length >= 4;
  const centered = recent.length > 0 && recent[recent.length - 1].found && recent[recent.length - 1].centered;
  const answerSec = liveStats?.durationSec ?? 0;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-4">
      {/* Top bar */}
      <header className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-app-card border border-app-line bg-app-card px-4 py-3">
        <Logo href="/dashboard" size="sm" showWordmark={false} />
        <div className="min-w-0">
          <p className="truncate text-app-ui text-app-ink-1">
            {track}
            {session.role || session.company ? ` · ${[session.role, session.company].filter(Boolean).join(", ")}` : ""}
          </p>
          <p className="text-app-small text-app-ink-2">
            Question {questionNumber} of {total} · {style} interviewer
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="inline-flex h-7 items-center gap-2 rounded-full border border-app-rec/40 bg-app-rec/10 px-2.5 font-mono text-app-small text-app-ink-1">
            <span className="relative grid h-2 w-2 place-items-center" aria-hidden>
              {phase !== "paused" && phase !== "finishing" && <span className="absolute h-2 w-2 animate-ping rounded-full bg-app-rec opacity-60 motion-reduce:animate-none" />}
              <span className="h-2 w-2 rounded-full bg-app-rec" />
            </span>
            <span>
              <span className="sr-only">Recording, </span>REC {mmss(elapsedSec)} <span className="text-app-ink-3">of {mmss(session.lengthMin * 60)}</span>
            </span>
          </span>
          <Button variant="ghost" size="sm" onClick={toggleSignals} aria-pressed={hideSignals}>
            {hideSignals ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {hideSignals ? "Show signals" : "Hide signals"}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)} disabled={phase === "finishing"}>
            End interview
          </Button>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: interviewer + video */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <section className="rounded-app-card border border-app-line bg-app-card p-5" aria-label="Interviewer">
            <div className="flex items-start gap-4">
              <WaveAvatar state={interviewerState} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip tone={phase === "answering" ? "sky" : "neutral"} live={phase === "answering" || phase === "speaking"}>
                    {statusLabel}
                  </StatusChip>
                  {current?.isFollowUp && <StatusChip>Follow-up</StatusChip>}
                </div>
                <p className="mt-3 font-display text-app-question text-app-ink-1">
                  {phase === "error" ? (
                    <span className="text-app-orange-text">{error}</span>
                  ) : current ? (
                    current.text
                  ) : (
                    <span className="text-app-ink-3">Getting your first question</span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {phase === "error" ? (
                    <Button variant="outline" size="sm" onClick={() => fetchNext(savedRef.current.map((q) => ({ question: q.text, answer: q.transcript })))}>
                      <RotateCcw className="h-4 w-4" /> Try again
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={onRepeat} disabled={!current || !speechService.isSupported}>
                      <RotateCcw className="h-4 w-4" /> Repeat question
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="relative h-[470px] overflow-hidden rounded-app-card border border-app-line bg-app-sidebar" aria-label="Your video">
            <video ref={videoRef} autoPlay muted playsInline className={cn("h-full w-full object-cover", !cameraLive && "hidden")} />
            {!cameraLive && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-app-hover font-display text-2xl font-semibold text-app-ink-1">{initialsOf(user?.name)}</span>
                  <p className="mt-3 text-app-small text-app-ink-2">{options?.cameraAnalysis ? (cameraOff ? "Camera is off" : media.camera === "denied" ? "Camera access was refused" : "Starting camera") : "Camera is off"}</p>
                </div>
              </div>
            )}
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              <StatusChip>You</StatusChip>
              {phase === "answering" && <StatusChip tone="sky">Answering · {mmss(answerSec)}</StatusChip>}
              {signalsOn && cameraLive && phase === "answering" && eyeSteady && <StatusChip tone="sky">Eye contact steady</StatusChip>}
              {signalsOn && cameraLive && phase === "answering" && centered && <StatusChip tone="sky">Centered in frame</StatusChip>}
            </div>
          </section>
        </div>

        {/* Right: transcript + signals */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          <section className="flex min-h-[320px] flex-col rounded-app-card border border-app-line bg-app-card p-5" aria-label="Live transcript">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-app-section text-app-ink-1">Live transcript</h2>
              {micError && <StatusChip tone="orange">{typedMode ? "Typing" : "Mic issue"}</StatusChip>}
            </div>
            <ol className="mt-3 flex max-h-[360px] flex-1 flex-col gap-3 overflow-y-auto pr-1" aria-live="polite">
              {turns.map((t, i) => (
                <li key={i} className="text-app-body">
                  <span className={cn("mr-2 font-mono text-app-label uppercase", t.who === "interviewer" ? "text-app-sky-text" : "text-app-ink-3")}>{t.who === "interviewer" ? "Interviewer" : "You"}</span>
                  <span className={t.who === "interviewer" ? "text-app-ink-1" : "text-app-ink-1"}>
                    {t.who === "you"
                      ? markFillers(t.text).map((p, k) =>
                          p.filler ? (
                            <mark key={k} className="bg-transparent text-app-ink-1 underline decoration-app-orange decoration-wavy underline-offset-4">
                              {p.text}
                            </mark>
                          ) : (
                            <span key={k}>{p.text}</span>
                          )
                        )
                      : t.text}
                  </span>
                </li>
              ))}
              {phase === "answering" && !typedMode && (finalText || interim) && (
                <li className="text-app-body">
                  <span className="mr-2 font-mono text-app-label uppercase text-app-ink-3">You</span>
                  {markFillers(finalText).map((p, k) =>
                    p.filler ? (
                      <mark key={k} className="bg-transparent text-app-ink-1 underline decoration-app-orange decoration-wavy underline-offset-4">
                        {p.text}
                      </mark>
                    ) : (
                      <span key={k}>{p.text}</span>
                    )
                  )}
                  {interim && <span className="text-app-ink-3"> {interim}</span>}
                  <span className="caret" aria-hidden />
                </li>
              )}
              {phase === "answering" && !typedMode && !finalText && !interim && (
                <li className="text-app-small text-app-ink-3">Listening. Start when you are ready.</li>
              )}
            </ol>
            {phase === "answering" && typedMode && (
              <div className="mt-3">
                <label htmlFor="typed-answer" className="sr-only">
                  Your answer
                </label>
                <Textarea id="typed-answer" rows={5} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your answer here" autoFocus />
              </div>
            )}
            <p className="mt-3 text-app-small text-app-ink-3">
              <span className="underline decoration-app-orange decoration-wavy underline-offset-4">Wavy orange</span> marks filler words. Interviewer lines are in sky.
            </p>
          </section>

          {signalsOn && (
            <section className="rounded-app-card border border-app-line bg-app-card p-5" aria-label="Delivery right now">
              <h2 className="font-display text-app-section text-app-ink-1">Delivery right now</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Signal label="Pace" value={liveStats?.wpm !== null && liveStats?.wpm !== undefined ? `${liveStats.wpm} wpm` : "—"} {...paceTone(liveStats?.wpm ?? null)} />
                <Signal label="Filler words" value={liveStats?.fillerPerMin !== null && liveStats?.fillerPerMin !== undefined ? `${liveStats.fillerPerMin} / min` : "—"} {...fillerTone(liveStats?.fillerPerMin ?? null)} />
                <Signal label="Eye contact" value={liveStats?.eyeContactPct !== null && liveStats?.eyeContactPct !== undefined ? `${liveStats.eyeContactPct}%` : "—"} {...eyeTone(cameraLive ? (liveStats?.eyeContactPct ?? null) : null)} />
                <Signal label="This answer" value={mmss(answerSec)} {...lengthTone(answerSec)} />
              </div>
              <p className="mt-3 text-app-small text-app-ink-3">Only you see this.</p>
            </section>
          )}
        </div>
      </div>

      {/* Control bar */}
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-app-card border border-app-line bg-app-card/95 p-3 backdrop-blur">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const next = !muted;
            setMuted(next);
            mutedRef.current = next;
            if (next) stopListening();
            else if (phaseRef.current === "answering") startListening();
          }}
          aria-pressed={muted}
          disabled={typedMode || media.mic !== "granted"}
        >
          {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />} {muted ? "Unmute" : "Mute"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setCameraOff((c) => !c)} aria-pressed={cameraOff} disabled={!options?.cameraAnalysis || media.camera !== "granted"}>
          {cameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />} {cameraOff ? "Camera on" : "Camera"}
        </Button>
        <Button variant="outline" size="sm" onClick={onPause} aria-pressed={phase === "paused"} disabled={phase !== "answering" && phase !== "paused"}>
          {phase === "paused" ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />} {phase === "paused" ? "Resume" : "Pause"}
        </Button>
        <Button variant="outline" size="sm" onClick={onSkip} disabled={phase !== "answering" && phase !== "paused"}>
          <SkipForward className="h-4 w-4" /> Skip
        </Button>
        <span aria-hidden className="mx-1 hidden h-6 w-px bg-app-line-strong sm:block" />
        <Button className="ml-auto" onClick={onFinishAnswer} disabled={phase !== "answering" && phase !== "paused"}>
          Finish answer
        </Button>
      </div>

      <Dialog open={confirmEnd} onOpenChange={setConfirmEnd}>
        <DialogContent className="border-app-line bg-app-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-app-section text-app-ink-1">End the interview?</DialogTitle>
            <DialogDescription className="text-app-ink-2">
              {savedRef.current.length + (phase === "answering" || phase === "paused" ? 1 : 0)} of {total} questions will be saved and scored. You can&apos;t resume this round.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setConfirmEnd(false)}>
              Keep going
            </Button>
            <Button variant="danger" size="sm" onClick={onEnd}>
              End interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {phase === "finishing" && (
        <p role="status" className="text-center text-app-small text-app-ink-3">
          Saving your round. <Link href={`/dashboard/interview/${sessionId}/report`} className="text-app-sky-text underline">Open the report</Link>
        </p>
      )}
    </div>
  );
};

export default RoomScreen;
