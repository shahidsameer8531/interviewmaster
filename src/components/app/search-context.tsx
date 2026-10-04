"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type SearchCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  /** "⌘K" on Apple platforms, "Ctrl K" elsewhere; null before mount. */
  shortcutLabel: string | null;
};

const Ctx = createContext<SearchCtx | null>(null);

const isEditable = (el: EventTarget | null) => {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
};

/**
 * One search dialog per shell. The ⌘K / Ctrl+K shortcut is registered only
 * when `shortcut` is true (sidebar screens), never in the interview room.
 * A bare key press inside an editable element is ignored; the modifier
 * combination always works.
 */
export const SearchProvider = ({ shortcut, children }: { shortcut: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState<string | null>(null);

  useEffect(() => {
    const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS/.test(navigator.userAgent);
    setShortcutLabel(apple ? "⌘K" : "Ctrl K");
  }, []);

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "k") return;
      const modifier = e.metaKey || e.ctrlKey;
      if (!modifier) return;
      if (isEditable(e.target) && !modifier) return;
      e.preventDefault();
      setOpen((v) => !v);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut]);

  const set = useCallback((v: boolean) => setOpen(v), []);
  const value = useMemo(() => ({ open, setOpen: set, shortcutLabel: shortcut ? shortcutLabel : null }), [open, set, shortcutLabel, shortcut]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useSearch = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearch must be used inside AppShell");
  return ctx;
};
