import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().trim().min(4, "Title is too short").max(90),
  body: z.string().trim().min(10, "Write a little more").max(1200),
  contestId: z.string().nullable(),
  pinned: z.boolean(),
  published: z.boolean(),
});
export type AnnouncementValues = z.infer<typeof announcementSchema>;
