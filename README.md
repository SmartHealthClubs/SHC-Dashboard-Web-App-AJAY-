# SHC Staff Dashboard — Angular

Angular (v22, standalone components + signals + built-in control flow) + PrimeNG port of the
SHC Staff Dashboard, ported from the React/Vite reference implementation at
`../shc-dashboard`. This is the production-track repo the SHC dev team builds on going forward;
the React app remains the visual/behavioral reference and is untouched.

## What's here

- **Role-aware architecture** — widget registry (`src/app/lib/widget-registry.ts`), union-of-roles
  resolution and broadest-scope-wins (`src/app/lib/dashboard.ts`, `src/app/lib/scope.ts`),
  conditional zone rendering, one period control per zone, and a demo role-switcher (dev affordance,
  not part of the product) — same rules as the React app, ported logic-for-logic.
- **Mock data layer** — `src/app/mock/*.ts`, a straight port of the React app's mock data
  generators (same seeded RNG, same response shapes).
- **3 widgets wired to live staging data**: Revenue at a glance, Sales by department, Attendance &
  fill trends. Everything else runs on the mock data layer. See `docs/api/*.md` for the endpoints
  and `SHC_Dashboard_HANDOFF.md` for the full history of API-wiring decisions and gotchas.
- **PrimeNG**, themed via `src/theme/shc-preset.ts` (a `definePreset` on the Aura base) bridging
  PrimeNG's design tokens to the SHC brand tokens in `src/styles/tokens.css`. Charts use Chart.js
  via `p-chart` (ranked bars = horizontal bar, sparklines = a minimal axis-free line — see
  `src/app/lib/chart-utils.ts`). Icons use `lucide-angular`, matching the React app's `lucide-react`
  icon set exactly.

## Run steps

```bash
npm install
cp .env.example .env   # fill in API_BASIC_AUTH and FITNESS_CENTER_ID — see below
npm start               # ng serve, with the API dev proxy active
```

Open `http://localhost:4200/`.

### `.env`

Two values, neither committed (`.env` is gitignored):

- `API_BASIC_AUTH` — base64-encoded `username:password` for the staging reports API. **Do not**
  include the `Basic ` prefix; the proxy prepends it.
- `FITNESS_CENTER_ID` — the fitness centre id every report request is scoped to (e.g. `38`).

Both are read server-side only, in `proxy.conf.js` (via `dotenv`), and injected into proxied
`/api/*` requests as headers/query params. They are never referenced in client code or an
`HttpInterceptor`, so the token can never end up in the browser bundle — same guarantee the React
app's Vite proxy provided.

### The dev proxy

`proxy.conf.js` forwards `/api/*` to `https://staging-cir-wa.smarthealthclubs.com/v2` (note the
`-wa` — a similarly-named but wrong `staging-cir.smarthealthclubs.com` host exists, don't confuse
them). It's wired into `ng serve` via `angular.json`'s `serve.options.proxyConfig`. Angular's
dev-server (`@angular/build:dev-server`) runs on Vite internally and passes this file straight
through to Vite's `server.proxy` option, so this is a **direct port** of the React app's
`vite.config.ts` proxy block — same shape, same headers, same rewrite logic — not a
reimplementation from scratch. It injects, per request:

- `Authorization: Basic <API_BASIC_AUTH>`
- `X-Device: external-api-access`, `X-Device-Api-Version: 79` (fixes the `__APP_UPDATE_REQUIRED`
  401 documented in `SHC_Dashboard_HANDOFF.md` — do not regress these values)
- `fitnessCenterId` query param, from `.env`

## Building

```bash
npm run build
```

Outputs to `dist/shc-dashboard-angular`.

## Known simplifications vs. the React app

Disclosed here rather than silently — see the port's final summary for the full list:

- Shadcn's custom dropdown-menu chrome (role-switcher, location-switcher, period control) is
  approximated with PrimeNG `p-select`/`p-popover` + a CSS pill wrapper, not a pixel-identical
  recreation of the original Radix/Base UI dropdown styling.
- `p-tag` has no direct "outline" variant, so a couple of secondary badges render as PrimeNG's
  standard filled `secondary` tag instead of the React app's bordered-outline look.
- Coverage gaps' Approve/Disapprove buttons use PrimeNG's `success`/`danger` severities rather than
  the exact custom green/red hex the React app used.

None of these affect data, scoping, or behavior — only minor chrome on a handful of interactive
controls.

## Docs carried over from the React repo

- `docs/api/*.md` — API reference for the 3 live-wired endpoints (orderStatistics/orderReport,
  memberBookingReport), including live-vs-documented field drift notes (e.g. `UserBarcode` vs the
  PDF's `Barcode`).
- `SHC_Dashboard_HANDOFF.md` — full project handoff notes (copied from the React repo's
  `HANDOFF.md`). **Note**: the React repo has no separate "build brief" file — the original build
  spec was delivered via chat at project kickoff and was never saved as its own document, so there
  was no `SHC_Dashboard_Build_Brief.md` to copy. `SHC_Dashboard_HANDOFF.md` is the closest and most
  complete source of the product/architecture decisions.
