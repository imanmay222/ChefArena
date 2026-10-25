/**
 * Public runtime configuration. Never put secrets in NEXT_PUBLIC_* variables —
 * they are inlined into the browser bundle.
 */
export const env = {
  /** Base URL of the future Go API, e.g. https://api.chefarena.example/v1 */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  /** Base URL for the WebSocket gateway that will stream verdicts and standings. */
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL ?? "",
  /** "mock" (default) or "api". The API adapters are not implemented yet. */
  dataSource: (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") as "mock" | "api",
} as const;
