# ChefArena — web frontend

**Think. Code. Compete.** A departmental competitive-programming platform for about 200 members: weekly ICPC-style contests, a coding arena, live standings, a practice archive and an admin workspace.

This package is the **frontend only**. Authentication, persistence, judging (Judge0), WebSockets and the Go API are separate. Until they exist, every screen runs on a small mock dataset through a typed service layer. Nothing in this repo executes user code or provides real security.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck  # next typegen && tsc --noEmit
npm run build && npm start
```

Requires Node 20.9+. Built with Next.js 16 (App Router, Cache Components, Partial Prefetching), React 19, Tailwind CSS 4, shadcn-style components on Radix, Monaco, Recharts, TanStack Query, React Hook Form + Zod, Framer Motion and next-themes.

> The Monaco editor is loaded from the jsDelivr CDN by `@monaco-editor/react`, so the arena editor needs network access.

## Demo accounts (local development only)

| Role        | Email                   | Lands on     |
| ----------- | ----------------------- | ------------ |
| Member      | `member@chefarena.demo` | `/dashboard` |
| CP Lead     | `lead@chefarena.demo`   | `/admin`     |
| Super Admin | `admin@chefarena.demo`  | `/admin`     |

Password for all three: **`chefarena-demo`**. The login page also has a "Demo accounts" panel that fills these in.

There is no sign-up page. Accounts are invitation-only.

## What's mocked, and how

| Concern | Demo behaviour | Production |
| --- | --- | --- |
| Login / session | `lib/services/mock/auth.ts` checks the demo password and writes an **unsigned, readable** cookie `ca_demo_session` (`{ uid, role, exp }`, no credentials). `proxy.ts` uses it only for redirects. | HttpOnly, Secure session issued and verified by the Go API. All authorisation enforced server-side. |
| Data | In-browser mock DB (`lib/services/mock/db.ts`), seeded from `lib/mock-data`, persisted to `localStorage` (`chefarena.mockdb`) and re-seeded after 6 hours so contest timing stays meaningful. **Settings → Reset demo data** restores it. | Go API + PostgreSQL. |
| Run / Submit | `lib/judge/mock-judge.ts` uses simple heuristics: unbalanced brackets → CE, unchanged starter or no output → WA, unbounded loop → TLE, otherwise AC. The arena's **Simulate** menu forces any verdict. Every result is labelled "simulated". | Judge0 behind the Go API; verdicts streamed over WebSocket. |
| Live updates | Timers in the mock adapter stream queued → compiling → running → verdict; standings poll every 15 s while a contest is live. | WebSocket push behind the same `watchSubmission` contract. |
| Emails | Invitations, CSV imports and password resets are recorded only. The UI says **no email was sent**. | Backend mailer. |

The browser's `localStorage` holds only harmless data: the mock DB (no passwords), editor drafts, UI preferences and theme. No credentials or tokens are stored there.

## Architecture

```
app/
  (app)/          authenticated shell: sidebar + top bar
    dashboard contests contests/[contestId] practice leaderboard
    submissions profile notifications settings
    admin/        role-gated: overview, contests(new, [id]/edit), problems(new, [id]/edit),
                  test-cases, participants, submissions, announcements, audit-logs, users
  (arena)/        full-screen coding workspace, no sidebar
    contests/[contestId]/problems/[problemId]   official contest arena
    problems/[problemId]                        practice (unofficial) arena
  login/ forbidden/ not-found.tsx layout.tsx providers.tsx globals.css
proxy.ts          demo-only redirect gating (formerly "middleware")
components/       ui/ (primitives) layout/ navigation/ dashboard/ contests/ editor/
                  problems/ submissions/ leaderboard/ profile/ admin/ charts/ feedback/ …
lib/
  services/       contracts.ts (interfaces) · index.ts (registry) · mock/ (adapter)
  mock-data/      the only place demo records live
  queries/        TanStack Query hooks + query keys
  scoring/        icpc.ts · department.ts
  judge/          mock-judge.ts (simulation only)
  contests/       status.ts (single source of contest status)
  validation/     Zod schemas
  api/client.ts   typed fetch wrapper for the future Go API
types/            shared DTOs
hooks/            clocks, media queries, preferences, drafts, submission tracker
```

- **Pages are Server Components.** They render the static shell and metadata. Data-driven views are client components that call services through TanStack Query, so the same code works when the HTTP adapter replaces the mock.
- **Components never import mock data.** They depend on `services.*` from `lib/services` via the hooks in `lib/queries`.
- Runtime data (`params`, `searchParams`) sits behind `<Suspense>`, as Cache Components requires. Admin pages export `instant = false` because they are intentionally withheld until the user's role is known.

### Mock dataset

All in `lib/mock-data/`, with timestamps relative to the seed time:

- 11 accounts: the 3 demo logins, 7 participants and 1 pending invitation.
- 3 contests: Weekly #41 finished, #42 live, #43 next week.
- 6 problems: 3 per contest. Samples are derived from test cases marked `sample`.
- 12 full submissions plus compact rival judge events used for standings (`leaderboard.ts`).
- 6 notifications, 4 announcements and 5 audit events.

## Scoring

**ICPC standings** (`lib/scoring/icpc.ts`) are always computed from judge events, never stored:

1. More problems solved ranks higher.
2. Ties go to the lower total penalty.
3. A solved problem adds the elapsed minute of its first accepted submission…
4. …plus 20 minutes (configurable) per rejected attempt before it. Compilation errors are free unless the contest says otherwise.
5. Attempts after a problem is solved are ignored.
6. Accepts after the deadline never count. They are shown as "late AC".
7. Remaining ties go to the earlier last-accepted minute. Fully tied rows share a rank and are ordered by handle, so the output is deterministic.

**Department points** (`lib/scoring/department.ts`) are separate from ICPC penalty. Each contest attended earns 10 points, plus the points of every problem solved in time, plus a 50/30/20 podium bonus once standings are final. Rank movement compares totals with and without the most recent contest.

Only a (simulated) **Accepted** verdict changes solve counts, profile statistics and standings.

## Connecting the Go backend

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL` (and `NEXT_PUBLIC_WS_BASE_URL`).
2. Implement the interfaces in `lib/services/contracts.ts` as HTTP adapters (e.g. `lib/services/http/*`) using `apiFetch` from `lib/api/client.ts`. It sends cookies with `credentials: "include"`.
3. Return them from `createServices()` in `lib/services/index.ts` when `NEXT_PUBLIC_DATA_SOURCE=api`. No component changes are needed.
4. Replace the demo cookie logic in `proxy.ts` with a check against the real session, or remove it. Keep every authorisation check on the server.
5. Implement `watchSubmission` over WebSocket, and switch the standings poll in `useStandings` to push updates.

The app makes no network requests to the API until step 3. No endpoints are assumed.

## Known limitations

- Demo authentication and role checks run in the browser and are not secure by design.
- The mock judge does not compile or run code. Verdicts come from heuristics or the Simulate menu.
- Mock data is per-browser. Two browsers do not see each other's submissions or edits.
- Rating changes are not recalculated after contests; ratings come from the seed data.
- Profile display and notification preferences are saved locally until profile and notification APIs exist.
