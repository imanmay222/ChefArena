export type Theme = "dark" | "light";

export const DEFAULT_THEME: Theme = "dark";

const THEME_STORAGE_KEY = "chefarena:theme";

/**
 * Runs in <head> before first paint so a saved light theme never flashes dark.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still applies for this page view.
  }
}
