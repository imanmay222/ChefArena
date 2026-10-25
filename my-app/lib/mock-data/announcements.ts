import type { Announcement } from "@/types";
import type { Timeline } from "./timeline";

export function seedAnnouncements(t: Timeline): Announcement[] {
  return [
    {
      id: "a-1",
      title: "Clarification · Plating Patterns",
      body: "Letters may be inserted anywhere in the string, including both ends. The input never contains spaces.",
      contestId: "weekly-42",
      authorId: "u_lead",
      pinned: true,
      published: true,
      createdAt: t.contestMinute(t.c42Start, 18),
      updatedAt: t.contestMinute(t.c42Start, 18),
    },
    {
      id: "a-2",
      title: "Weekly #43 is a number theory special",
      body: "Expect sieves, modular inverses and a little combinatorics. Registration stays open until the contest starts.",
      contestId: null,
      authorId: "u_lead",
      pinned: false,
      published: true,
      createdAt: t.daysAgo(1),
      updatedAt: t.daysAgo(1),
    },
    {
      id: "a-3",
      title: "Editorials for Weekly #41",
      body: "Editorials for Spice Rack Balance, Kitchen Queue and Recipe Dependencies are now visible on each problem page.",
      contestId: "weekly-41",
      authorId: "u_lead",
      pinned: false,
      published: true,
      createdAt: t.daysAgo(6),
      updatedAt: t.daysAgo(6),
    },
    {
      id: "a-4",
      title: "Lab 4 reserved for Saturday practice",
      body: "The department lab is open from 2 PM to 6 PM every Saturday for upsolving sessions with the CP leads.",
      contestId: null,
      authorId: "u_admin",
      pinned: false,
      published: true,
      createdAt: t.daysAgo(10),
      updatedAt: t.daysAgo(10),
    },
  ];
}
