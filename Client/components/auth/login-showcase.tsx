import { Activity, Braces, CircleCheck, Trophy } from "lucide-react";
import { ChefArenaLogo } from "@/components/brand/chefarena-logo";
import { CodeChefLogo } from "@/components/brand/codechef-logo";
import { cn } from "@/lib/utils";

type Token = "k" | "f" | "n" | "c" | "p";

const tokenColor: Record<Token, string> = {
  k: "text-(--code-keyword)",
  f: "text-(--code-fn)",
  n: "text-(--code-number)",
  c: "text-(--code-comment) italic",
  p: "text-(--code-plain)",
};

// A short sliding-window solution, tokenised by hand for a static illustration.
const CODE: Array<Array<[Token, string]>> = [
  [["c", "// Longest window with sum ≤ k"]],
  [["k", "int "], ["f", "longestWindow"], ["p", "(vector<"], ["k", "int"], ["p", ">& a, "], ["k", "long long "], ["p", "k) {"]],
  [["k", "  int "], ["p", "best = "], ["n", "0"], ["p", ";  "], ["k", "long long "], ["p", "sum = "], ["n", "0"], ["p", ";"]],
  [["k", "  for "], ["p", "("], ["k", "int "], ["p", "l = "], ["n", "0"], ["p", ", r = "], ["n", "0"], ["p", "; r < a."], ["f", "size"], ["p", "(); ++r) {"]],
  [["p", "    sum += a[r];"]],
  [["k", "    while "], ["p", "(sum > k) sum -= a[l++];"]],
  [["p", "    best = "], ["f", "max"], ["p", "(best, r - l + "], ["n", "1"], ["p", ");"]],
  [["p", "  }"]],
  [["k", "  return "], ["p", "best;"]],
  [["p", "}"]],
];

const FEATURES = [
  { icon: Braces, label: "Competitive Programming" },
  { icon: Activity, label: "Real-time Progress" },
  { icon: Trophy, label: "Department Leaderboard" },
];

export function CodeChefCredit({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="font-mono text-[11px] tracking-wide text-muted">Train for contests on</span>
      <CodeChefLogo className="h-11 xl:h-12" />
    </div>
  );
}

export function BrandFootnote({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-1 text-xs text-muted", className)}>
      <p className="font-medium text-foreground/80">Built for problem solvers.</p>
      <p>
        CodeChef and its logo are trademarks of their respective owner. ChefArena is an
        independent departmental platform.
      </p>
    </div>
  );
}

function CodeSnippet() {
  return (
    <figure
      aria-hidden
      className="overflow-hidden rounded-xl border border-border bg-surface/80 shadow-card backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-[11px] text-muted">
        <span>solution.cpp</span>
        <span>C++17</span>
      </div>
      <pre className="overflow-hidden px-4 py-3 font-mono text-[12px] leading-[1.65] xl:py-3.5 xl:text-[12.5px] xl:leading-[1.7]">
        {CODE.map((line, index) => (
          <div key={index} className="flex">
            <span className="w-7 shrink-0 text-(--code-comment) select-none">{index + 1}</span>
            <code className="whitespace-pre">
              {line.map(([token, text], i) => (
                <span key={i} className={tokenColor[token]}>
                  {text}
                </span>
              ))}
            </code>
          </div>
        ))}
      </pre>
      <div className="flex items-center gap-3 border-t border-border px-4 py-2.5 font-mono text-[11px]">
        <span className="inline-flex items-center gap-1.5 font-medium text-success">
          <CircleCheck className="size-3.5" />
          Accepted
        </span>
        <span className="text-muted">0.08 s · 3.2 MB · 24/24 tests</span>
      </div>
    </figure>
  );
}

/** Desktop-only storytelling panel beside the sign-in card. */
export function LoginShowcase({ className }: { className?: string }) {
  return (
    <aside
      aria-label="About ChefArena"
      className={cn(
        "relative flex-col justify-between overflow-hidden border-r border-border bg-sidebar px-10 py-8 xl:px-16 xl:py-12",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_80%_70%_at_20%_10%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 size-[480px] rounded-full bg-primary/10 blur-3xl"
      />

      <ChefArenaLogo className="relative" />

      <div className="relative max-w-[540px] space-y-7 py-8 xl:space-y-8 xl:py-10">
        <div className="space-y-4 xl:space-y-5">
          <CodeChefCredit />
          <h2 className="text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
            Think. Code. <span className="text-primary">Compete.</span>
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-muted">
            ChefArena is the department&apos;s private competitive programming space —
            practise problems, take on contests and grow alongside your peers.
          </p>
        </div>

        <CodeSnippet />

        <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 text-[13px] text-muted">
              <Icon className="size-4 text-primary" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <BrandFootnote className="relative max-w-md" />
    </aside>
  );
}
