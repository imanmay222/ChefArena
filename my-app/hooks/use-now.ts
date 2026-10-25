"use client";

import { useSyncExternalStore } from "react";

/*
 * Shared clocks keyed by interval. Returns null during SSR/prerender and the
 * first hydration pass, so time-dependent UI never causes hydration mismatches
 * (and never reads the clock while Next.js prerenders).
 */
interface Ticker {
  now: number;
  listeners: Set<() => void>;
  handle: ReturnType<typeof setInterval> | null;
}
const tickers = new Map<number, Ticker>();

function getTicker(interval: number): Ticker {
  let t = tickers.get(interval);
  if (!t) {
    t = { now: Date.now(), listeners: new Set(), handle: null };
    tickers.set(interval, t);
  }
  return t;
}

const subscribers = new Map<number, (onChange: () => void) => () => void>();

/** Stable subscribe function per interval (a new identity would resubscribe every render). */
function subscriberFor(interval: number) {
  let subscribe = subscribers.get(interval);
  if (subscribe) return subscribe;
  subscribe = (onChange) => {
      const t = getTicker(interval);
      t.listeners.add(onChange);
      if (!t.handle) {
        t.now = Date.now();
        t.handle = setInterval(() => {
          t.now = Date.now();
          t.listeners.forEach((fn) => fn());
        }, interval);
      }
      return () => {
        t.listeners.delete(onChange);
        if (!t.listeners.size && t.handle) {
          clearInterval(t.handle);
          t.handle = null;
        }
      };
    };
  subscribers.set(interval, subscribe);
  return subscribe;
}

const serverSnapshot = () => null;

export function useNow(interval = 1000): number | null {
  return useSyncExternalStore(subscriberFor(interval), () => getTicker(interval).now, serverSnapshot);
}
