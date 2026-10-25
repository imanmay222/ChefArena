import { z } from "zod";

const testCase = z.object({
  id: z.string(),
  label: z.string().trim().min(1, "Label required").max(40),
  kind: z.enum(["sample", "hidden"]),
  input: z.string().min(1, "Input required"),
  output: z.string().min(1, "Output required"),
  explanation: z.string().optional(),
  weight: z.number().int().min(1).max(10),
  inputFileName: z.string().optional(),
  outputFileName: z.string().optional(),
});

export const problemSchema = z
  .object({
    id: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{2,4}\d{2,4}$/, "Use a code like CA107"),
    code: z.string().trim().max(2),
    title: z.string().trim().min(3, "Title is too short").max(80),
    statement: z.string().trim().min(20, "Write the problem statement"),
    inputFormat: z.string().trim().min(5, "Describe the input"),
    outputFormat: z.string().trim().min(5, "Describe the output"),
    constraints: z.string().trim().min(3, "List the constraints"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    points: z.number({ error: "Required" }).int().min(10).max(1000),
    timeLimitMs: z.number({ error: "Required" }).int().min(250).max(10_000),
    memoryLimitMb: z.number({ error: "Required" }).int().min(16).max(1024),
    languages: z.array(z.enum(["cpp", "java", "python", "go"])).min(1, "Allow at least one language"),
    topics: z.array(z.enum(["arrays", "strings", "binary-search", "graphs", "dynamic-programming", "trees", "greedy", "number-theory"])).min(1, "Pick a topic"),
    contestId: z.string().nullable(),
    published: z.boolean(),
    testCases: z.array(testCase),
    referenceLanguage: z.enum(["cpp", "java", "python", "go"]),
    referenceSource: z.string(),
    editorial: z.string(),
  })
  .refine((v) => v.testCases.some((t) => t.kind === "sample"), { path: ["testCases"], message: "Add at least one public sample" });

export type ProblemFormValues = z.input<typeof problemSchema>;
export type ProblemFormOutput = z.output<typeof problemSchema>;

export const lines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
