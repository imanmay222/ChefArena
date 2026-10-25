"use client";

import { useSyncExternalStore } from "react";

const KEY = "chefarena.sidebar-collapsed";
const listeners = new Set<() => void>();

function read() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSidebarCollapsed(value: boolean) {
  try {
    window.localStorage.setItem(KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const serverSnapshot = () => false;

export function useSidebarCollapsed() {
  return useSyncExternalStore(subscribe, read, serverSnapshot);
}
