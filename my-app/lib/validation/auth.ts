import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your email or handle")
    .max(120, "That looks too long")
    .refine((v) => !v.includes("@") || z.email().safeParse(v).success, "Enter a valid email address"),
  password: z.string().min(1, "Enter your password").max(128),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;
