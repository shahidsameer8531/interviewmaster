"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Mic } from "lucide-react";

import { cn } from "@/lib/utils";
import { Field, Select } from "@/components/app/Field";
import { StatusChip } from "@/components/app/StatusChip";
import { Eyebrow } from "@/components/app/Eyebrow";
import { readFace, type FaceReading } from "./face";
import { useDevices, useMicLevel, useUserMedia, type PermissionState } from "./media";

export type Permissions = { camera: PermissionState; mic: PermissionState };

/**
 * "Check your setup": live camera preview with a face/light chip, a mic
 * level meter, and device pickers. Loaded client-only because of face-api.
 */
export const CheckSetup = ({
  cameraOn,
  micOn,
  cameraDeviceId,
  micDeviceId,
  onDeviceChange,
  onPermissions,
}: {
  cameraOn: boolean;
  micOn: boolean;
  cameraDeviceId?: string;
  micDeviceId?: string;
  onDeviceChange: (next: { cameraDeviceId?: string; micDeviceId?: string }) => void;
  onPermissions: (p: Permissions) => void;
}) => {
  const media = useUserMedia({ video: cameraOn, audio: micOn, cameraDeviceId, micDeviceId });
  const level = useMicLevel(media.stream);
  const devices = useDevices(media.stream);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [face, setFace] = useState<FaceReading | "loading" | "error" | null>(null);

  useEffect(() => onPermissions({ camera: media.camera, mic: media.mic }), [media.camera, media.mic, onPermissions]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = media.stream && media.stream.getVideoTracks().length ? media.stream : null;
  }, [media.stream]);

  // Face and light check, roughly once a second while the preview runs.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !media.stream || media.stream.getVideoTracks().length === 0) {
      setFace(null);
      return;
    }
    let cancelled = false;
    let timer = 0;
    setFace("loading");
    const tick = async () => {
      try {
        const r = await readFace(el);
        if (!cancelled) setFace(r);
      } catch {
        if (!cancelled) setFace("error");
      }
      if (!cancelled) timer = window.setTimeout(tick, 1200);
    };
    tick();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [media.stream]);

  const faceChip = (() => {
    if (!cameraOn || media.camera !== "granted") return null;
    if (face === "loading" || face === null) return <StatusChip>Looking for your face</StatusChip>;
    if (face === "error") return <StatusChip tone="orange">Face check unavailable</StatusChip>;
    if (!face.found) return <StatusChip tone="orange">No face found</StatusChip>;
    const light = face.brightness < 60 ? "low light" : "good light";
    return <StatusChip tone={face.brightness < 60 ? "orange" : "sky"}>Face found · {light}</StatusChip>;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded-app-panel bg-app-sidebar ring-1 ring-app-line">
        <video ref={videoRef} autoPlay muted playsInline className={cn("h-full w-full object-cover", (!cameraOn || media.camera !== "granted") && "hidden")} />
        {(!cameraOn || media.camera !== "granted") && (
          <div className="absolute inset-0 grid place-items-center text-center">
            <div>
              <Camera className="mx-auto h-6 w-6 text-app-ink-3" aria-hidden />
              <p className="mt-2 text-app-small text-app-ink-2">
                {!cameraOn ? "Camera analysis is off" : media.camera === "requesting" ? "Asking for the camera" : media.camera === "denied" ? "Camera access was refused" : "Camera unavailable"}
              </p>
            </div>
          </div>
        )}
        {faceChip && <div className="absolute left-3 top-3">{faceChip}</div>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Eyebrow>Microphone</Eyebrow>
          <span className="text-app-small text-app-ink-3">
            {!micOn ? "Voice analysis is off" : media.mic === "granted" ? (level > 0.05 ? "Hearing you" : "Say something") : media.mic === "requesting" ? "Asking for the mic" : media.mic === "denied" ? "Refused" : "Unavailable"}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Mic className="h-4 w-4 shrink-0 text-app-ink-3" aria-hidden />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-app-hover" role="meter" aria-label="Microphone level" aria-valuenow={Math.round(level * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-app-sky transition-[width] duration-100" style={{ width: `${Math.round(level * 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <Field label="Camera" htmlFor="setup-camera">
          <Select value={cameraDeviceId ?? ""} onChange={(e) => onDeviceChange({ cameraDeviceId: e.target.value || undefined })} disabled={!cameraOn || devices.cameras.length === 0}>
            <option value="">{devices.cameras.length ? "Default camera" : "No camera found"}</option>
            {devices.cameras.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Microphone" htmlFor="setup-mic">
          <Select value={micDeviceId ?? ""} onChange={(e) => onDeviceChange({ micDeviceId: e.target.value || undefined })} disabled={!micOn || devices.mics.length === 0}>
            <option value="">{devices.mics.length ? "Default microphone" : "No microphone found"}</option>
            {devices.mics.map((d, i) => (
              <option key={d.deviceId || i} value={d.deviceId}>
                {d.label || `Microphone ${i + 1}`}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  );
};

export default CheckSetup;
