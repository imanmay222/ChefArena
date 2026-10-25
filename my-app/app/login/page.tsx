import type { Metadata } from "next";
import { CheckCircle2, Radio } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

const CODE = [
  [{ t: "int ", c: "text-[#c084fc]" }, { t: "main", c: "text-[#60a5fa]" }, { t: "() {", c: "" }],
  [{ t: "  sort", c: "text-[#60a5fa]" }, { t: "(t.", c: "" }, { t: "begin", c: "text-[#60a5fa]" }, { t: "(), t.", c: "" }, { t: "end", c: "text-[#60a5fa]" }, { t: "());", c: "" }],
  [{ t: "  for ", c: "text-[#c084fc]" }, { t: "(", c: "" }, { t: "auto ", c: "text-[#c084fc]" }, { t: "x : t) cur += x, ans += cur;", c: "" }],
  [{ t: "  cout ", c: "" }, { t: "<< ", c: "text-[#f472b6]" }, { t: "ans ", c: "" }, { t: "<< ", c: "text-[#f472b6]" }, { t: "'\\n'", c: "text-[#4ade80]" }, { t: ";", c: "" }],
  [{ t: "}", c: "" }],
];

const BOARD = [
  { rank: 1, handle: "sneha_p", solved: 3, penalty: 182 },
  { rank: 2, handle: "rohan.d", solved: 3, penalty: 244 },
  { rank: 3, handle: "ananya_rao", solved: 2, penalty: 47 },
];

function ArenaIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-md select-none" aria-hidden>
      <div className="rounded-xl border border-white/10 bg-[#0f131b]/90 shadow-2xl shadow-black/40">
        <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="size-2.5 rounded-full bg-white/10" />
          <span className="ml-3 font-mono text-[11px] text-slate-500">kitchen_queue.cpp</span>
        </div>
        <pre className="overflow-hidden px-4 py-3 font-mono text-[12px] leading-6 text-slate-300">
          {CODE.map((line, i) => (
            <div key={i} className="flex">
              <span className="mr-4 w-4 text-right text-slate-600">{i + 1}</span>
              <span>
                {line.map((tok, j) => (
                  <span key={j} className={tok.c}>
                    {tok.t}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </pre>
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/12 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="size-3" /> Accepted
          </span>
          <span className="font-mono text-[11px] text-slate-500">31 ms · 3.9 MB · 3/3 tests</span>
        </div>
      </div>
      <div className="absolute -right-10 -bottom-24 w-60 rounded-xl border border-white/10 bg-[#151b27]/95 p-3 shadow-2xl shadow-black/50 backdrop-blur xl:-right-24">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-300">Weekly #41 · Final</span>
          <Radio className="size-3 text-slate-500" />
        </div>
        {BOARD.map((r) => (
          <div key={r.rank} className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[11px]">
            <span className={`w-4 font-mono ${r.rank === 1 ? "text-amber-400" : "text-slate-500"}`}>{r.rank}</span>
            <span className="flex-1 truncate text-slate-200">{r.handle}</span>
            <span className="font-mono text-slate-400">{r.solved}</span>
            <span className="w-8 text-right font-mono text-slate-500">{r.penalty}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#0b0d12] text-slate-100 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_75%)]" />
        <div className="absolute -top-40 -left-40 size-[520px] rounded-full bg-[#6c5ce7]/20 blur-[120px]" />
        <div className="relative z-10 flex flex-1 flex-col px-12 py-10 xl:px-16">
          <Brand href="/login" className="[&_.text-muted-foreground]:text-slate-500" />
          <div className="mt-auto mb-auto pt-16">
            <p className="mb-4 font-mono text-xs tracking-[0.2em] text-[#a99ff5] uppercase">Departmental CP Arena</p>
            <h1 className="max-w-md text-4xl leading-[1.1] font-semibold tracking-tight xl:text-[44px]">
              Think. Code. <span className="bg-gradient-to-r from-[#8b7cf6] to-[#b48bff] bg-clip-text text-transparent">Compete.</span>
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-400">
              Weekly contests, live ICPC standings and a practice archive for every member of the department — in one focused workspace.
            </p>
            <div className="mt-12 pb-16">
              <ArenaIllustration />
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span>C++ · Java · Python · Go</span>
            <span className="size-1 rounded-full bg-slate-700" />
            <span>ICPC scoring</span>
            <span className="size-1 rounded-full bg-slate-700" />
            <span>Weekly rounds</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col bg-background">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end">
          <Brand href="/login" className="lg:hidden" />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
