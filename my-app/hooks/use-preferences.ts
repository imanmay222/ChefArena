"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Language } from "@/types";

/**
 * UI preferences persisted in localStorage. Only harmless display settings are
 * stored here — never credentials, tokens or personal data.
 */
export interface Preferences {
  defaultLanguage: Language;
  editorFontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  notifyContestReminders: boolean;
  notifySubmissionResults: boolean;
  notifyAnnouncements: boolean;
  showRatingPublicly: boolean;
  showRealName: boolean;
  compactTables: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultLanguage: "cpp",
  editorFontSize: 14,
  wordWrap: false,
  minimap: false,
  notifyContestReminders: true,
  notifySubmissionResults: true,
  notifyAnnouncements: true,
  showRatingPublicly: true,
  showRealName: true,
  compactTables: false,
};

const KEY = "chefarena.preferences";
const listeners = new Set<() => void>();
let cache: Preferences | null = null;

function read(): Preferences {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) } : DEFAULT_PREFERENCES;
  } catch {
    cache = DEFAULT_PREFERENCES;
  }
  return cache;
}

export function setPreferences(patch: Partial<Preferences>) {
  cache = { ...read(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable: keep in memory */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(onChange: () => void) {
      listeners.add(onChange);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          onChange();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
}

const serverPreferences = () => DEFAULT_PREFERENCES;

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, read, serverPreferences);
  const update = useCallback((patch: Partial<Preferences>) => setPreferences(patch), []);
  return [prefs, update] as const;
}
