import { env } from "@/lib/config/env";
import type { Services } from "./contracts";
import { mockServices } from "./mock";

/**
 * Service registry — the single switch between the mock adapter and the
 * future HTTP adapter for the Go API.
 *
 * To integrate the backend: implement each interface in lib/services/http/*
 * using `apiFetch` (lib/api/client.ts), then return those adapters here when
 * `env.dataSource === "api"`. No component needs to change.
 */
function createServices(): Services {
  if (env.dataSource === "api" && process.env.NODE_ENV !== "production") {
    console.warn("[ChefArena] NEXT_PUBLIC_DATA_SOURCE=api is set, but HTTP adapters are not implemented yet. Using mock data.");
  }
  return mockServices;
}

export const services: Services = createServices();
export const isMockData = true;
export type { Services } from "./contracts";
