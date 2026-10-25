import { env } from "@/lib/config/env";
import { ServiceError } from "@/lib/services/errors";

/**
 * Typed fetch wrapper for the future Go API. Nothing calls it yet — the mock
 * adapter is used until NEXT_PUBLIC_DATA_SOURCE=api and HTTP adapters exist.
 * Sessions are expected to be HttpOnly cookies set by the API, hence
 * `credentials: "include"`; no tokens are kept in JS-accessible storage.
 */
export async function apiFetch<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  if (!env.apiBaseUrl) throw new ServiceError("NEXT_PUBLIC_API_BASE_URL is not configured");
  const { json, headers, ...rest } = init;
  const response = await fetch(`${env.apiBaseUrl.replace(/\/$/, "")}${path}`, {
    credentials: "include",
    ...rest,
    headers: { Accept: "application/json", ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!response.ok) {
    const code =
      response.status === 401 ? "unauthorized" : response.status === 403 ? "forbidden" : response.status === 404 ? "not_found" : response.status === 422 ? "validation" : "unknown";
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    throw new ServiceError(message, code);
  }
  return (response.status === 204 ? undefined : await response.json()) as T;
}
