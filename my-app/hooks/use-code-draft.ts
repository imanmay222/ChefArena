"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Language } from "@/types";
import { STARTER_CODE } from "@/lib/editor/languages";

/*
 * Code drafts are kept per problem and language in localStorage. Only source
 * code lives here — harmless to persist and never sensitive.
 */
const key = (problemId: string, language: Language) => `chefarena.draft.${problemId}.${language}`;
const langKey = (problemId: string) => `chefarena.draft.${problemId}.language`;

function readDraft(problemId: string, language: Language) {
  try {
    return window.localStorage.getItem(key(problemId, language));
  } catch {
    return null;
  }
}

export function useCodeDraft(problemId: string, defaultLanguage: Language) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [code, setCodeState] = useState<string>(STARTER_CODE[defaultLanguage]);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore after mount (localStorage is unavailable during SSR).
  useEffect(() => {
    let lang = defaultLanguage;
    try {
      const stored = window.localStorage.getItem(langKey(problemId)) as Language | null;
      if (stored && stored in STARTER_CODE) lang = stored;
    } catch {
      /* ignore */
    }
    const draft = readDraft(problemId, lang);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
    setLanguageState(lang);
    setCodeState(draft ?? STARTER_CODE[lang]);
    setReady(true);
  }, [problemId, defaultLanguage]);

  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const setCode = useCallback(
    (value: string) => {
      setCodeState(value);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        try {
          window.localStorage.setItem(key(problemId, language), value);
        } catch {
          /* ignore */
        }
      }, 400);
    },
    [problemId, language],
  );

  const setLanguage = useCallback(
    (next: Language) => {
      // Flush the current draft before switching.
      try {
        window.localStorage.setItem(key(problemId, language), code);
        window.localStorage.setItem(langKey(problemId), next);
      } catch {
        /* ignore */
      }
      setLanguageState(next);
      setCodeState(readDraft(problemId, next) ?? STARTER_CODE[next]);
    },
    [problemId, language, code],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(key(problemId, language));
    } catch {
      /* ignore */
    }
    setCodeState(STARTER_CODE[language]);
  }, [problemId, language]);

  return { language, setLanguage, code, setCode, reset, ready };
}
