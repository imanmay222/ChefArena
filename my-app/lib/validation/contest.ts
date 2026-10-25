import { z } from "zod";

export const contestSchema = z
  .object({
    title: z.string().trim().min(4, "Use at least 4 characters").max(80, "Keep it under 80 characters"),
    shortTitle: z.string().trim().min(2, "Required").max(24, "Keep it under 24 characters"),
    description: z.string().trim().min(10, "Add a short description").max(600),
    startsAt: z.string().min(1, "Pick a start time"),
    durationMinutes: z.number({ error: "Enter a duration" }).int().min(30, "At least 30 minutes").max(600, "At most 10 hours"),
    problemIds: z.array(z.string()).max(12, "At most 12 problems"),
    penaltyMinutes: z.number({ error: "Required" }).int().min(0).max(60),
    penalizeCompilationError: z.boolean(),
    freezeMinutes: z.number({ error: "Required" }).int().min(0).max(120),
    visibility: z.enum(["department", "invite-only"]),
    rules: z.string().trim().min(1, "Add at least one rule"),
    announcement: z.string().trim().max(400).optional(),
  })
  .refine((v) => !Number.isNaN(new Date(v.startsAt).getTime()), { path: ["startsAt"], message: "Invalid date" })
  .refine((v) => v.freezeMinutes < v.durationMinutes, { path: ["freezeMinutes"], message: "Freeze must be shorter than the contest" });

export type ContestFormValues = z.infer<typeof contestSchema>;

/** Publishing requires problems and a future start; drafts may be incomplete. */
export function publishIssues(values: ContestFormValues, now: number): string[] {
  const issues: string[] = [];
  if (values.problemIds.length === 0) issues.push("Assign at least one problem before publishing.");
  if (new Date(values.startsAt).getTime() < now) issues.push("The start time is in the past.");
  return issues;
}
