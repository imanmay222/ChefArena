"use client";

import { useLayoutEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, getStoredTheme } from "@/lib/theme";

export function ThemeToggle() {
  // React resets <html> attributes on the dev Strict Mode remount, dropping the
  // theme set by the inline script. Re-apply it; this is a no-op in production.
  useLayoutEffect(() => {
    const stored = getStoredTheme();
    if (stored) document.documentElement.setAttribute("data-theme", stored);
  }, []);

  function toggle() {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "light" ? "dark" : "light");
  }

  // Both icons render and CSS picks one, so markup never depends on client state.
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle color theme" title="Toggle color theme">
      <Sun className="hidden size-[18px] dark:block" aria-hidden />
      <Moon className="size-[18px] dark:hidden" aria-hidden />
    </Button>
  );
}
