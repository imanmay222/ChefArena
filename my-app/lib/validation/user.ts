import { z } from "zod";
import type { CsvImportRow } from "@/types";

export const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(60),
  email: z.email("Enter a valid email"),
  role: z.enum(["member", "cp_lead", "super_admin"]),
});
export type InviteValues = z.infer<typeof inviteSchema>;

export const createUserSchema = inviteSchema.extend({
  handle: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(20, "At most 20 characters")
    .regex(/^[a-z0-9_.]+$/, "Lowercase letters, digits, _ and . only"),
  batch: z.string().trim().regex(/^\d{4}$/, "Use a year like 2025"),
});
export type CreateUserValues = z.infer<typeof createUserSchema>;

/** Parses `name,email,handle,batch` rows. Header row is optional. */
export function parseCsv(text: string, existingEmails: Set<string>): CsvImportRow[] {
  const rows = text.split(/\r?\n/).map((l) => l.trim());
  const out: CsvImportRow[] = [];
  const seen = new Set<string>();
  rows.forEach((line, i) => {
    if (!line || (i === 0 && /^name\s*,/i.test(line))) return;
    const [name = "", email = "", handle = "", batch = ""] = line.split(",").map((c) => c.trim());
    const errors: string[] = [];
    if (name.length < 2) errors.push("name missing");
    if (!z.email().safeParse(email).success) errors.push("invalid email");
    else if (existingEmails.has(email.toLowerCase())) errors.push("already has an account");
    else if (seen.has(email.toLowerCase())) errors.push("duplicate in file");
    if (!/^[a-z0-9_.]{3,20}$/.test(handle)) errors.push("invalid handle");
    if (!/^\d{4}$/.test(batch)) errors.push("invalid batch");
    seen.add(email.toLowerCase());
    out.push({ line: i + 1, name, email, handle, batch, errors });
  });
  return out;
}
