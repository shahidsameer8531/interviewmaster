"use client";

import { useSyncExternalStore } from "react";

/**
 * Guest persistence. Each collection is one localStorage key holding a JSON
 * array. Every read and write is wrapped in try/catch because storage can be
 * missing, full or blocked; in that case reads return [] and writes are lost.
 *
 * Reactivity: components subscribe through useSyncExternalStore. Writes from
 * this tab dispatch a custom event; writes from other tabs arrive as the
 * browser's `storage` event.
 */

const PREFIX = "im.guest.";
const EVENT = "im:guest-store";

export const GUEST_KEYS = {
  sessions: `${PREFIX}sessions`,
  resumes: `${PREFIX}resumes`,
  aptitude: `${PREFIX}aptitude`,
  coaching: `${PREFIX}coaching`,
  target: `${PREFIX}target`,
} as const;

const EMPTY: never[] = [];
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Parses once per distinct raw value so snapshots stay referentially stable. */
export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = readRaw(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeJson(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
    return true;
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  const onCustom = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) callback();
  };
  window.addEventListener(EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export function useGuestCollection<T>(key: string): T[] {
  return useSyncExternalStore(
    subscribe,
    () => readJson<T[]>(key, EMPTY),
    () => EMPTY
  );
}

export function useGuestValue<T>(key: string, fallback: T): T {
  return useSyncExternalStore(
    subscribe,
    () => readJson<T>(key, fallback),
    () => fallback
  );
}

/** True when localStorage can be written, so guest history can actually be kept and later imported. */
export function canUseGuestStore(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const k = `${PREFIX}probe`;
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function clearGuestStore() {
  for (const key of Object.values(GUEST_KEYS)) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
  cache.clear();
  window.dispatchEvent(new CustomEvent(EVENT, { detail: "clear" }));
}

export function guestId(prefix = "g") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function insertGuest<T extends { id: string }>(key: string, item: T): T {
  const items = readJson<T[]>(key, []);
  writeJson(key, [item, ...items]);
  return item;
}

export function patchGuest<T extends { id: string }>(key: string, id: string, patch: Partial<T>): T | null {
  const items = readJson<T[]>(key, []);
  let updated: T | null = null;
  const next = items.map((it) => {
    if (it.id !== id) return it;
    updated = { ...it, ...patch };
    return updated;
  });
  writeJson(key, next);
  return updated;
}

export function removeGuest<T extends { id: string }>(key: string, id: string) {
  const items = readJson<T[]>(key, []);
  writeJson(
    key,
    items.filter((it) => it.id !== id)
  );
}
