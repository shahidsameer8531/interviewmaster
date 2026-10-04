"use client";

/**
 * Thin wrapper around the browser SpeechSynthesis / SpeechRecognition APIs.
 *
 * Everything that touches `window` is deferred until first use so the module
 * can be imported by pages that are rendered on the server.
 */
/* Minimal shapes for the vendor-prefixed Web Speech API. */
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
};
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((error: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: SpeechRecognitionLike | null = null;
  private initialised = false;
  private isRecognitionActive = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private ensureInit() {
    if (this.initialised || typeof window === "undefined") return;
    this.initialised = true;
    this.synth = window.speechSynthesis ?? null;

    const Recognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (Recognition) {
      this.recognition = new Recognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";
    }
  }

  get isSupported() {
    this.ensureInit();
    return Boolean(this.synth);
  }

  startRecognition(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (error: unknown) => void
  ) {
    this.ensureInit();
    if (!this.recognition) {
      onError?.(new Error("Speech recognition is not supported in this browser"));
      return;
    }

    this.isRecognitionActive = true;
    let finalTranscript = "";
    let interimTranscript = "";

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
          onResult(finalTranscript.trim(), true);
        } else {
          interimTranscript += transcript;
          onResult(interimTranscript.trim(), false);
        }
      }
    };

    this.recognition.onerror = (error: unknown) => {
      console.error("Speech recognition error:", error);
      onError?.(error);
    };

    this.recognition.onend = () => {
      if (this.isRecognitionActive) {
        try {
          this.recognition.start();
        } catch {
          /* already started */
        }
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      onError?.(error);
    }
  }

  stopRecognition() {
    this.isRecognitionActive = false;
    this.recognition?.stop();
  }

  speak(text: string, onStart?: () => void, onEnd?: () => void) {
    this.ensureInit();
    if (!this.synth) {
      onEnd?.();
      return;
    }

    if (this.currentUtterance) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = this.synth.getVoices();
    const preferredVoice =
      voices.find(
        (voice) =>
          voice.name.includes("Microsoft") ||
          voice.name.includes("Google") ||
          voice.name.includes("Natural")
      ) || voices[0];

    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.currentUtterance = utterance;
      onStart?.();
    };
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (this.currentUtterance === utterance) this.currentUtterance = null;
      onEnd?.();
    };
    utterance.onend = finish;
    // cancel() and some engines report "interrupted" through onerror, not onend.
    utterance.onerror = finish;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.currentUtterance && this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
