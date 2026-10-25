# ChefArena — Phase 1

Sign-in UI, mock authentication and role-based placeholder workspaces for ChefArena,
a private departmental competitive programming platform.

## Run

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /login
npm run lint
npm run build && npm run start
```

## Demo accounts

| Role        | Email                   | Password     | Lands on     |
| ----------- | ----------------------- | ------------ | ------------ |
| Member      | `member@chefarena.demo` | `Member@123` | `/dashboard` |
| CP Lead     | `lead@chefarena.demo`   | `Lead@123`   | `/cp-lead`   |
| Super Admin | `admin@chefarena.demo`  | `Admin@123`  | `/admin`     |

The username part (e.g. `member`) also works in the "Email or username" field.

## Where things live

- `types/auth.ts` — roles, user, session and credential types
- `lib/auth/` — demo accounts, role → route mapping and access rule, mock sign-in, session store
- `components/auth/` — login form, demo-account panel, forgot-password dialog, route guards
- `components/layout/` — theme toggle and the shared placeholder workspace
- `lib/theme.ts` — theme persistence and the pre-paint script that prevents a theme flash

## Limitations

- **Authentication is frontend-only.** Credentials are checked in the browser against
  public demo data, and the "session" is a JSON object in `sessionStorage`
  (`chefarena:mock-session`) that anyone can edit in DevTools.
- Route guards run on the client and only steer navigation. They are not authorization:
  the placeholder pages are static and publicly fetchable.
- "Remember me" is UI-only; the mock session always ends when the tab closes.
- The CodeChef logo (`public/brand/codechef-logo.svg`) is the official asset from
  CodeChef's CDN, bundled locally. CodeChef is a trademark of its owner; ChefArena is
  an independent departmental platform.

To add real authentication later, replace `lib/auth/mock-auth.ts` and
`lib/auth/session.ts`, and enforce access on the server.
