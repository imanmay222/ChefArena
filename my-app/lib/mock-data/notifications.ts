import type { AppNotification } from "@/types";
import type { Timeline } from "./timeline";

export function seedNotifications(t: Timeline): AppNotification[] {
  return [
    { id: "n-1", userId: "u_member", type: "contest_reminder", title: "Weekly #42 is live", body: "Three problems, three hours. The contest started a few minutes ago.", href: "/contests/weekly-42", createdAt: t.iso(t.c42Start), read: false },
    { id: "n-2", userId: "u_member", type: "submission_result", title: "Accepted · Sous-Chef Search", body: "Submission S-10418 passed all 3 tests in 52 ms.", href: "/submissions", createdAt: t.contestMinute(t.c42Start, 12), read: false },
    { id: "n-3", userId: "u_member", type: "announcement", title: "Weekly #43: number theory special", body: "Next week's round focuses on modular arithmetic. Problems are revealed at start.", href: "/contests/weekly-43", createdAt: t.daysAgo(1), read: false },
    { id: "n-4", userId: "u_member", type: "editorial", title: "Editorials for Weekly #41 published", body: "Solutions and complexity notes for all three problems are now available.", href: "/contests/weekly-41", createdAt: t.daysAgo(6), read: true },
    { id: "n-5", userId: "u_member", type: "contest_result", title: "Weekly #41 standings are final", body: "You placed 5th with 2 problems solved. Rating +22.", href: "/leaderboard", createdAt: t.daysAgo(6, 20), read: true },
    { id: "n-6", userId: "u_lead", type: "announcement", title: "One invitation is still pending", body: "arjun_m has not accepted their invitation yet.", href: "/admin/participants", createdAt: t.daysAgo(1, 4), read: false },
  ];
}
