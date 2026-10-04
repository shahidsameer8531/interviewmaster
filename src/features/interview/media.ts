"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export type MediaState = {
  stream: MediaStream | null;
  camera: PermissionState;
  mic: PermissionState;
  error: string | null;
};

/**
 * Opens the camera and/or microphone. If the combined request is refused,
 * it retries audio-only so a denied camera does not also lose the mic.
 */
export function useUserMedia(opts: { video: boolean; audio: boolean; cameraDeviceId?: string; micDeviceId?: string; enabled?: boolean }) {
  const [state, setState] = useState<MediaState>({ stream: null, camera: "idle", mic: "idle", error: null });
  const streamRef = useRef<MediaStream | null>(null);
  const { video, audio, cameraDeviceId, micDeviceId } = opts;
  const enabled = opts.enabled ?? true;

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!enabled || (!video && !audio)) {
      stop();
      setState({ stream: null, camera: video ? "idle" : "unavailable", mic: audio ? "idle" : "unavailable", error: null });
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState({ stream: null, camera: "unavailable", mic: "unavailable", error: "This browser cannot access the camera or microphone." });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, camera: video ? "requesting" : "unavailable", mic: audio ? "requesting" : "unavailable", error: null }));

    const constraints = (withVideo: boolean, withAudio: boolean): MediaStreamConstraints => ({
      video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user", ...(cameraDeviceId ? { deviceId: { exact: cameraDeviceId } } : {}) } : false,
      audio: withAudio ? { echoCancellation: true, noiseSuppression: true, ...(micDeviceId ? { deviceId: { exact: micDeviceId } } : {}) } : false,
    });

    (async () => {
      stop();
      let stream: MediaStream | null = null;
      let camera: PermissionState = video ? "denied" : "unavailable";
      let mic: PermissionState = audio ? "denied" : "unavailable";
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints(video, audio));
        camera = video ? "granted" : "unavailable";
        mic = audio ? "granted" : "unavailable";
      } catch {
        if (video && audio) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints(false, true));
            mic = "granted";
          } catch {
            /* both refused */
          }
        }
      }
      if (cancelled) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      setState({ stream, camera, mic, error: null });
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, video, audio, cameraDeviceId, micDeviceId, stop]);

  return { ...state, stop };
}

/** Microphone level 0..1 from a Web Audio analyser, sampled with rAF. */
export function useMicLevel(stream: MediaStream | null) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (!stream || stream.getAudioTracks().length === 0) {
      setLevel(0);
      return;
    }
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      setLevel(Math.min(1, rms * 4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      source.disconnect();
      ctx.close().catch(() => {});
    };
  }, [stream]);
  return level;
}

export type DeviceLists = { cameras: MediaDeviceInfo[]; mics: MediaDeviceInfo[] };

/** Camera and microphone lists. Labels appear only after a permission is granted. */
export function useDevices(refreshKey: unknown) {
  const [devices, setDevices] = useState<DeviceLists>({ cameras: [], mics: [] });
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    let cancelled = false;
    navigator.mediaDevices
      .enumerateDevices()
      .then((all) => {
        if (cancelled) return;
        setDevices({ cameras: all.filter((d) => d.kind === "videoinput"), mics: all.filter((d) => d.kind === "audioinput") });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);
  return devices;
}
