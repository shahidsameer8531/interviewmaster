"use client";

/**
 * Per-answer recordings kept in this browser's IndexedDB when the person
 * turns on "Keep the recording". Nothing is uploaded. Every call swallows
 * storage failures: a missing clip is not an error for the session.
 */

const DB = "im-recordings";
const STORE = "clips";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

const key = (sessionId: string, index: number) => `${sessionId}:${index}`;

/** Whether "Keep the recording" was on for this session, from the room options kept in sessionStorage. */
export function loadRoomOptionsForReport(sessionId: string): boolean {
  try {
    const raw = sessionStorage.getItem(`im.room.${sessionId}`);
    return raw ? Boolean((JSON.parse(raw) as { keepRecording?: boolean }).keepRecording) : false;
  } catch {
    return false;
  }
}

export async function saveClip(sessionId: string, index: number, blob: Blob): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, key(sessionId, index));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

export async function loadClip(sessionId: string, index: number): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(key(sessionId, index));
      req.onsuccess = () => resolve((req.result as Blob | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Records one answer from an existing stream. Call stop() to get the blob. */
export function startClip(stream: MediaStream): { stop: () => Promise<Blob | null> } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
  let rec: MediaRecorder;
  try {
    rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
  } catch {
    return null;
  }
  const chunks: BlobPart[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start(1000);
  return {
    stop: () =>
      new Promise((resolve) => {
        rec.onstop = () => resolve(chunks.length ? new Blob(chunks, { type: rec.mimeType }) : null);
        try {
          rec.stop();
        } catch {
          resolve(null);
        }
      }),
  };
}
