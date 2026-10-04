"use client";

/**
 * Face signals from face-api.js, loaded on demand so the library never runs
 * on the server. Models are the ones already shipped in public/models.
 *
 * Only booleans and small numbers leave this module; no frames are stored.
 */

export type FaceReading = {
  found: boolean;
  /** Face box centre within the middle 60% of the frame. */
  centered: boolean;
  /** Nose sits between the eyes, so the head faces the camera. */
  looking: boolean;
  /** Mean luminance of the frame, 0..255. */
  brightness: number;
};

type FaceApi = typeof import("face-api.js");
let api: FaceApi | null = null;
let loading: Promise<FaceApi> | null = null;

export function loadFaceApi(): Promise<FaceApi> {
  if (api) return Promise.resolve(api);
  if (!loading) {
    loading = (async () => {
      const mod = await import("face-api.js");
      await Promise.all([mod.nets.tinyFaceDetector.loadFromUri("/models"), mod.nets.faceLandmark68Net.loadFromUri("/models")]);
      api = mod;
      return mod;
    })();
  }
  return loading;
}

const scratch = typeof document !== "undefined" ? document.createElement("canvas") : null;

function brightnessOf(video: HTMLVideoElement): number {
  if (!scratch) return 0;
  const w = 32;
  const h = 18;
  scratch.width = w;
  scratch.height = h;
  const ctx = scratch.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 0;
  try {
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    return sum / (data.length / 4);
  } catch {
    return 0;
  }
}

export async function readFace(video: HTMLVideoElement): Promise<FaceReading> {
  const mod = await loadFaceApi();
  if (video.readyState < 2 || video.videoWidth === 0) return { found: false, centered: false, looking: false, brightness: 0 };
  const brightness = brightnessOf(video);
  const result = await mod.detectSingleFace(video, new mod.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })).withFaceLandmarks();
  if (!result) return { found: false, centered: false, looking: false, brightness };

  const box = result.detection.box;
  const cx = (box.x + box.width / 2) / video.videoWidth;
  const cy = (box.y + box.height / 2) / video.videoHeight;
  const centered = cx > 0.2 && cx < 0.8 && cy > 0.15 && cy < 0.85;

  const lm = result.landmarks;
  const avg = (pts: { x: number; y: number }[]) => pts.reduce((a, p) => ({ x: a.x + p.x / pts.length, y: a.y + p.y / pts.length }), { x: 0, y: 0 });
  const left = avg(lm.getLeftEye());
  const right = avg(lm.getRightEye());
  const nose = lm.getNose()[3];
  const span = right.x - left.x;
  const ratio = span > 0 ? (nose.x - left.x) / span : 0.5;
  const looking = ratio > 0.35 && ratio < 0.65;

  return { found: true, centered, looking, brightness };
}
