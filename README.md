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

## Cosmetic chrome notes

A follow-up cleanup pass closed the gaps between PrimeNG's stock component chrome and the React
app's shadcn look:

- **Dropdown pills** (role switcher, location switcher, period control) — the trigger stays a
  hand-styled pill (`.pill-select-host` in `src/styles.css`) with an icon inside the same bordered
  box; the `p-select` dropdown *overlay* panel (a floating portal `.pill-select-host` can't reach
  with scoped CSS) and its option hover/selected colors, plus the role switcher's `p-popover`
  panel, are themed via component tokens in `src/theme/shc-preset.ts` instead — the
  PrimeNG-idiomatic way to theme a floating panel, and it keeps hover/focus/open states correct for
  free.
- **Outline tags** — `p-tag` has no built-in outlined variant, so `.tag-outline` in
  `src/styles.css` (transparent background, bordered, navy text) is applied via `styleClass` to the
  two spots the React app used `<Badge variant="outline">`: widget-placeholder-card's scope tag and
  Attendance's "Classes & Programs" tag.
- **Coverage gaps' Approve/Disapprove buttons** use the exact SHC hex (`--color-status-positive`
  `#1FB68A` / `--color-status-negative` `#E5544B`) via Tailwind's `!`-important utility classes,
  not PrimeNG's built-in `success`/`danger` severity colors.

## Docs carried over from the React repo

- `docs/api/*.md` — API reference for the 3 live-wired endpoints (orderStatistics/orderReport,
  memberBookingReport), including live-vs-documented field drift notes (e.g. `UserBarcode` vs the
  PDF's `Barcode`).
- `SHC_Dashboard_Build_Brief.md` — the original product/build spec.
- `SHC_Dashboard_HANDOFF.md` — full project handoff notes (copied from the React repo's
  `HANDOFF.md`), including the full history of API-wiring decisions and gotchas.
