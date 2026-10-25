import type { Language, RunResult, SampleCase, TestCase, Verdict } from "@/types";
import { STARTER_CODE } from "@/lib/editor/languages";

/**
 * SIMULATED JUDGE — nothing here executes user code.
 *
 * It applies a few transparent heuristics so the demo feels responsive:
 *  - unbalanced brackets / an explicit `#error` → compilation error
 *  - unchanged starter code or no output statement → wrong answer (empty output)
 *  - an obvious unbounded loop without `break` → time limit exceeded
 *  - otherwise the code is treated as correct
 * A real deployment replaces this with Judge0 behind the Go API.
 */
export type SourceAnalysis =
  | { kind: "compile_error"; message: string }
  | { kind: "no_output" }
  | { kind: "infinite_loop" }
  | { kind: "plausible" };

const OUTPUT_PATTERNS: Record<Language, RegExp> = {
  cpp: /\b(cout|printf|puts|putchar)\b/,
  java: /System\.out|PrintWriter|\bout\.print/,
  python: /\bprint\s*\(|sys\.stdout\.write/,
  go: /fmt\.(Print|Fprint)|\.Write(String)?\(/,
};

const normalize = (s: string) => s.replace(/\s+/g, "");

function stripCommentsAndStrings(source: string, language: Language) {
  const withoutComments =
    language === "python"
      ? source.replace(/#.*$/gm, "")
      : source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  return withoutComments
    .replace(/`[^`]*`/g, "``")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
}

function bracketError(source: string, language: Language): string | null {
  const stripped = stripCommentsAndStrings(source, language);
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: { ch: string; line: number }[] = [];
  const lines = stripped.split("\n");
  for (let li = 0; li < lines.length; li++) {
    for (const ch of lines[li]) {
      if (ch === "(" || ch === "[" || ch === "{") stack.push({ ch, line: li + 1 });
      else if (ch in pairs) {
        const top = stack.pop();
        if (!top || top.ch !== pairs[ch]) return `line ${li + 1}: unexpected '${ch}'`;
      }
    }
  }
  if (stack.length) return `line ${stack[stack.length - 1].line}: '${stack[stack.length - 1].ch}' is never closed`;
  return null;
}

export function analyzeSource(source: string, language: Language): SourceAnalysis {
  if (/#error|COMPILE_ERROR/.test(source)) return { kind: "compile_error", message: "error: explicit #error directive" };
  const bracket = bracketError(source, language);
  if (bracket) return { kind: "compile_error", message: `${language === "java" ? "Main.java" : "main"}: ${bracket}` };
  if (normalize(source) === normalize(STARTER_CODE[language]) || !OUTPUT_PATTERNS[language].test(source)) return { kind: "no_output" };
  const unbounded = /while\s*\(\s*(true|1)\s*\)|for\s*\(\s*;\s*;\s*\)|while\s+True\s*:|for\s*\{/;
  if (unbounded.test(source) && !/\bbreak\b|\breturn\b/.test(source)) return { kind: "infinite_loop" };
  return { kind: "plausible" };
}

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

const LANGUAGE_FACTOR: Record<Language, number> = { cpp: 1, go: 1.3, java: 2.4, python: 6 };

export function estimateMetrics(source: string, language: Language, timeLimitMs: number) {
  const h = hash(source + language);
  const timeMs = Math.min(timeLimitMs - 1, Math.round((12 + (h % 70)) * LANGUAGE_FACTOR[language]));
  const memoryKb = Math.round((language === "java" ? 36_000 : language === "python" ? 9_800 : 3_400) + (h % 4_000));
  return { timeMs, memoryKb };
}

/** Wrong output that still looks like plausible program output. */
function perturb(expected: string) {
  const tokens = expected.trim().split(/(\s+)/);
  for (let i = tokens.length - 1; i >= 0; i--) {
    const n = Number(tokens[i]);
    if (tokens[i].trim() && Number.isFinite(n)) {
      tokens[i] = String(n + 1);
      return tokens.join("");
    }
  }
  return "";
}

export function simulateRun(source: string, language: Language, samples: SampleCase[], timeLimitMs: number): RunResult {
  const analysis = analyzeSource(source, language);
  if (analysis.kind === "compile_error") {
    return { status: "compilation_error", compileOutput: analysis.message, cases: [], simulated: true };
  }
  const { timeMs } = estimateMetrics(source, language, timeLimitMs);
  return {
    status: "ok",
    simulated: true,
    cases: samples.map((s, i) => {
      const passed = analysis.kind === "plausible";
      const actual =
        analysis.kind === "plausible" ? s.output : analysis.kind === "infinite_loop" ? "" : i === 0 ? "" : perturb(s.output);
      return {
        sampleId: s.id,
        input: s.input,
        expected: s.output,
        actual: analysis.kind === "infinite_loop" ? "Time limit exceeded" : actual,
        passed,
        timeMs: analysis.kind === "infinite_loop" ? timeLimitMs : timeMs + i * 3,
      };
    }),
  };
}

export interface JudgePlan {
  verdict: Verdict;
  totalTests: number;
  passedTests: number;
  failedTest: number | null;
  timeMs: number | null;
  memoryKb: number | null;
  compileOutput?: string;
}

/** Decide the final verdict for a submission (or rejudge). */
export function planVerdict(
  source: string,
  language: Language,
  tests: TestCase[],
  limits: { timeLimitMs: number; memoryLimitMb: number },
  forced: Verdict | "auto" = "auto",
): JudgePlan {
  const total = Math.max(tests.length, 1);
  const analysis = analyzeSource(source, language);
  const metrics = estimateMetrics(source, language, limits.timeLimitMs);
  const failAt = Math.min(total, Math.max(2, Math.ceil(total * 0.6)));

  let verdict: Verdict;
  if (forced !== "auto") verdict = forced;
  else if (analysis.kind === "compile_error") verdict = "compilation_error";
  else if (analysis.kind === "infinite_loop") verdict = "time_limit_exceeded";
  else if (analysis.kind === "no_output") verdict = "wrong_answer";
  else verdict = "accepted";

  switch (verdict) {
    case "accepted":
      return { verdict, totalTests: total, passedTests: total, failedTest: null, ...metrics };
    case "compilation_error":
      return {
        verdict,
        totalTests: total,
        passedTests: 0,
        failedTest: null,
        timeMs: null,
        memoryKb: null,
        compileOutput: analysis.kind === "compile_error" ? analysis.message : "error: expected ';' before '}' token",
      };
    case "time_limit_exceeded":
      return { verdict, totalTests: total, passedTests: failAt - 1, failedTest: failAt, timeMs: limits.timeLimitMs, memoryKb: metrics.memoryKb };
    case "memory_limit_exceeded":
      return { verdict, totalTests: total, passedTests: failAt - 1, failedTest: failAt, timeMs: metrics.timeMs, memoryKb: limits.memoryLimitMb * 1024 };
    case "runtime_error":
      return { verdict, totalTests: total, passedTests: failAt - 1, failedTest: failAt, ...metrics };
    case "wrong_answer":
    default:
      return {
        verdict: "wrong_answer",
        totalTests: total,
        passedTests: analysis.kind === "no_output" ? 0 : failAt - 1,
        failedTest: analysis.kind === "no_output" ? 1 : failAt,
        ...metrics,
      };
  }
}
