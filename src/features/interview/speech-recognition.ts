"use client";

/**
 * Continuous speech recognition for one answer. Wraps the vendor-prefixed
 * Web Speech API and restarts itself when the browser ends a segment early.
 */

type RecognitionResultLike = ArrayLike<{ transcript: string }> & { isFinal: boolean };
type RecognitionEventLike = { resultIndex: number; results: ArrayLike<RecognitionResultLike> };
type RecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: RecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export type RecognitionHandle = { stop: () => void };

export function startRecognition(handlers: {
  onFinal: (text: string) => void;
  onInterim: (text: string) => void;
  onError: (message: string) => void;
}): RecognitionHandle | null {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";
  let active = true;

  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      const text = r[0]?.transcript ?? "";
      if (r.isFinal) handlers.onFinal(text.trim());
      else interim += text;
    }
    if (interim) handlers.onInterim(interim.trim());
  };
  rec.onerror = (e) => {
    const code = e.error ?? "unknown";
    if (code === "no-speech" || code === "aborted") return;
    if (code === "not-allowed" || code === "service-not-allowed") {
      active = false;
      handlers.onError("Microphone access was refused.");
      return;
    }
    handlers.onError(`Speech recognition stopped (${code}).`);
  };
  rec.onend = () => {
    if (!active) return;
    try {
      rec.start();
    } catch {
      /* already restarted */
    }
  };

  try {
    rec.start();
  } catch (err) {
    handlers.onError("Could not start speech recognition.");
    return null;
  }

  return {
    stop: () => {
      active = false;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    },
  };
}
