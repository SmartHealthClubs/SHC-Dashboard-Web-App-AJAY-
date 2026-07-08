# Project context for Claude Code

## What this is

The SHC Staff Dashboard — a role-aware internal dashboard (Admin / Manager / Coach / Front Desk)
built in Angular (latest — standalone components, signals, built-in `@if`/`@for`/`@switch` control
flow) + PrimeNG, themed to the SHC brand via a custom PrimeNG preset. The UI is **approved** — it's
a pixel-faithful port of an already-signed-off React/Vite prototype (kept in a sibling repo,
`../shc-dashboard`, as a read-only visual/behavioral reference, not part of this codebase). Do not
redesign the UI; match the reference exactly unless explicitly asked to change it.

The dashboard is organized into **zones** (Money, People, Loyalty, Staff & Operations, Classes &
Programs, Front Desk, plus two parked "AI" zones), each containing **widgets**. Which zones/widgets
a user sees, and at what data scope, is resolved from their active role(s) — a widget registry maps
`(role → scope)` per widget; a zone only renders if the active role selection unlocks at least one
widget in it; where multiple active roles unlock the same widget at different scopes, the broadest
scope wins. This logic lives in `src/app/lib/{scope,zones,widget-registry,dashboard}.ts` and is
pure, framework-agnostic TypeScript — read it before changing any role/scope-related behavior.

**Current wiring status**: 3 widgets are wired to live staging data; the rest run on a mock data
layer (`src/app/mock/*.ts`) that mirrors the real API's response shapes. See
`SHC_Dashboard_HANDOFF.md` for exactly which widgets are wired, confirmed live aggregates, and the
full gap/follow-up list before doing any further API work.

## The 3 live connections

All three call the staging reports API through a **dev proxy** (`proxy.conf.js`, wired into
`ng serve` via `angular.json`'s `serve.options.proxyConfig`) rather than calling it directly from
the browser:

- **Revenue at a glance** (`src/app/dashboard/widgets/revenue-glance/`) —
  `GET /v2/reports/orderStatistics`, 3 parallel calls (`statusType=success/failed/refunded`).
- **Sales by department** (`src/app/dashboard/widgets/sales-by-department/`) —
  `GET /v2/reports/orderReport` (line-item, paginated), aggregated client-side by department.
- **Attendance & fill trends** (`src/app/dashboard/widgets/attendance-fill-trends/`) —
  `GET /v2/reports/memberBookingReport` (paginated), rolled up client-side.

### How the proxy works — and why

`proxy.conf.js` forwards `/api/*` to the real staging host and injects, **server-side, in Node,
never in client code or an `HttpInterceptor`**:
- `Authorization: Basic <value>`, read from `.env`'s `API_BASIC_AUTH` via `dotenv`. **`.env` is
  gitignored — never commit it, never print its contents, never echo the token to logs or chat.**
- `X-Device: external-api-access` and `X-Device-Api-Version: 79` — required exactly as-is. Other
  device-identity values (e.g. a mobile-app identity) get rejected by the API's app-version gate
  with a `__APP_UPDATE_REQUIRED` 401. Do not change these two header values without re-verifying
  against staging first.
- `fitnessCenterId` (from `.env`'s `FITNESS_CENTER_ID`), injected into every proxied request's
  query string. Widgets never read or hardcode this themselves.

**This proxy is dev-only.** `ng build` produces a static SPA with no server component, so
`proxy.conf.js` never runs in production — there is currently no production-safe way to call these
endpoints without exposing the Basic Auth credential. Before deploying anywhere beyond local dev, a
real backend-for-frontend needs to hold this credential server-side instead.

## Hard-won integration rules — apply these to any new endpoint you wire

1. **Trust live API responses over the PDF docs (`docs/api/*.md`), every time.** The docs have been
   repeatedly wrong or incomplete relative to what staging actually returns — confirmed drift
   includes undocumented fields present live, documented fields absent live, and entire documented
   response sections (see rule 3) that don't exist at all. Always fetch one real response and
   inspect its actual keys/values before trusting a doc's field list.
2. **Live member-identity fields carry a `User*` prefix the PDF docs don't show.** Confirmed:
   `Barcode` → `UserBarcode`, `MemberName` → `UserFullName`, `Email` → `UserEmail`,
   `AgreementNumber` → `UserAgreementNumber`, `MembershipTypes` → `UserMembershipTypes`, and more.
   A real bug shipped once from reading the documented (wrong) field name — a barcode-based
   member/non-member split silently misclassified 100% of rows as non-member because the field it
   read didn't exist. Never assume a member-related field name from the PDF is correct; check live.
3. **A documented response shape's top-level summary fields may not exist live at all.**
   `memberBookingReport` is the confirmed example: the PDF documents five top-level aggregate
   fields, but the live response only ever has `skip`/`nextSkip`/`nextPage` at the top level, across
   every filter combination tried. When this happens, the fallback is a client-side rollup:
   paginate through the full line-item array and count/sum in-app rather than trusting a
   documented aggregate that isn't actually there.
4. **Money fields are inconsistently typed live.** The same field can come back as a plain number
   on one row and a `"$"`-prefixed or empty string on another. Always parse defensively — strip
   `$`/`,`, coerce to a number, default to 0 on anything unparseable — rather than trusting the
   PDF's stated type.
5. **No endpoint found so far returns a historical/time-series result.** Every report endpoint
   takes a single `fromDate`/`toDate` range and returns one aggregate (or one flat paginated list)
   for that whole range. A trend or sparkline needs multiple calls — one per period/bucket — not a
   single call with a magic "give me history" parameter.
6. **Enum-style string fields' live values may differ in case/wording from the PDF.**
   `memberBookingReport`'s `AttendanceStatus`/`BookingStatus` are confirmed examples: live values
   are lowercase and phrased differently (`"attended"`/`"not-attended"`, `"confirmed"`/
   `"cancelled"`/`"transferred"`) than the PDF's `"Attended"`/`"No Show"`/`"Confirmed"`. Verify
   actual enum values against a live response before branching logic on them.

## Where things live

- `docs/api/*.md` — per-endpoint reference extracted from the internal API PDF, one file per report
  family, each ending in a "Feasibility" section investigating whether/how it can support a given
  widget. Read the relevant file before wiring any widget to a new endpoint; update it if you find
  further live-vs-documented drift.
- `SHC_Dashboard_Build_Brief.md` — the original product spec: what the dashboard should contain,
  per zone/widget, and the full v1 widget list.
- `SHC_Dashboard_HANDOFF.md` — the living state snapshot: what's wired vs. mock, confirmed live
  aggregates, the running gap/follow-up list, and the exact next step. **Read this first** before
  starting any new work in this repo, and update it when you finish a unit of work (a widget wired,
  a bug found and fixed, a product decision made) so the next session doesn't have to re-derive it.
- `src/app/lib/` — pure, framework-agnostic logic: role/scope resolution, the widget registry, zone
  definitions, period-range helpers, chart-option builders, brand color constants.
- `src/app/mock/` — the mock data layer every not-yet-wired widget runs on: one file per report
  shape, deterministic (seeded RNG), generated relative to "today" so the demo doesn't look stale.
- `src/app/services/` — injectable signal-based services standing in for global app state
  (active role selection, current location) — the Angular equivalent of the React reference's
  context providers.
- `src/app/dashboard/widgets/` — one folder per widget component. `src/app/dashboard/zone-section/`
  is the framework piece that resolves which widgets render in a zone and at what scope, and maps
  each widget id to its component.
- `src/theme/shc-preset.ts` — the PrimeNG theme preset bridging PrimeNG's design tokens to the SHC
  brand tokens in `src/styles/tokens.css`.

## Picking up the next widget

Suggested next widgets, their candidate endpoints, and the open product decisions each one may be
blocked on are documented in `SHC_Dashboard_Build_Brief.md` (what the widget should show) and
`SHC_Dashboard_HANDOFF.md` (current gap list — some remaining widgets are blocked on a real
logged-in-user identity for Manager scoping, some on endpoints not yet located, e.g. membership
tier). Check both before starting, and don't wire a widget without knowing which endpoint and which
open questions apply to it first.
