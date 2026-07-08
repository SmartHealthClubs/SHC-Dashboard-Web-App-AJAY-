# HANDOFF

## Current state: Angular + PrimeNG, 3 of ~17 widgets wired to live staging

This repo is now the **production-track Angular port** of the SHC Staff Dashboard, built from an
approved React/Vite prototype (a sibling repo, `../shc-dashboard`, kept around only as the
visual/behavioral reference — not touched by this port and not part of this codebase going
forward). The port reproduces the approved UI (layout, spacing, colors, typography, interactions)
using Angular (latest — v22, standalone components, signals, built-in `@if`/`@for`/`@switch`
control flow) + PrimeNG, themed to the SHC brand via a custom preset. `ng build` is clean — no
errors or warnings.

Read `SHC_Dashboard_Build_Brief.md` for the original product spec and `README.md` for run steps
and where things live in this repo. This file (the handoff log) is the state snapshot: what's
wired, what's still mock, what's known-broken or open, in enough detail that another team's
Claude Code (or a human) can resume work without re-deriving any of it.

### Port history (chronological, brief — see `git log` for full detail per commit)
1. **Initial port** — full Angular + PrimeNG rebuild from the React reference: role-aware
   architecture (widget registry, union-of-roles + broadest-scope-wins, conditional zone
   rendering), the mock data layer, all 17 widget slots, and the 3 live-wired widgets carried over
   with every hard-won API fix intact (see below). The dev proxy was ported from the React app's
   Vite config to `proxy.conf.js` (Angular's dev-server also runs on Vite internally, so this is a
   direct port, not a reimplementation).
2. **Cosmetic cleanup pass** — closed gaps between PrimeNG's stock component chrome and the
   original shadcn look: dropdown pill styling (role switcher, location switcher, period control),
   an outline `p-tag` variant (PrimeNG has no built-in one), and exact-hex Approve/Disapprove
   buttons on Coverage gaps instead of PrimeNG's stock severity colors.
3. **Layout regression fix** — found and fixed a systemic bug where widget cards weren't filling
   their zone row/column (stat cards stayed narrow and left-aligned; Services/Program & cohort
   fill's column spans didn't apply). **Root cause**: every widget's sizing classes (`flex-1`,
   `col-span-2`, `lg:col-span-3`, `mt-auto`) live on the template's root `<div>`, ported verbatim
   from the React JSX — but in Angular that div sits one level inside the component's own host tag
   (`<app-revenue-glance>`), which is the actual flex/grid item the zone layout sees. The unstyled
   host defaulted to shrink-to-fit sizing, leaving those classes inert. Fixed with `display:
   contents` on every widget host (`src/styles.css`) so the inner div becomes the real flex/grid
   item — restores exact parity with React's flat DOM shape, no template changes needed. Also
   restored the persistent bar-end value labels (`chartjs-plugin-datalabels`) that Recharts'
   `<LabelList>` provided and Chart.js has no built-in equivalent for, on both Instructor
   performance and Sales by department.

## The 3 live connections (carried over from React, hard-won — do not regress)

All three: **Admin/all-club scope only** (`locations`/`department` blank) — Manager
department-scoping is a `// TODO` at the exact line in each widget's `.ts` file, waiting on a real
logged-in-user department identity, which doesn't exist yet (no auth/login built). All three read
`fitnessCenterId` from the dev proxy, never hardcoded in widget code.

### Dev proxy (`proxy.conf.js`)
Forwards `/api/*` to `https://staging-cir-wa.smarthealthclubs.com/v2` (note the `-wa` — a
similarly-named but wrong `staging-cir.smarthealthclubs.com` host exists). Injects, server-side
only, in Node:
- `Authorization: Basic <API_BASIC_AUTH>` (from `.env`, gitignored, never committed or printed)
- `X-Device: external-api-access`, `X-Device-Api-Version: 79` — **fixes a real blocker**: the
  proxy previously identified itself as the mobile app (`X-Device: android`,
  `X-Device-Api-Version: 1`, plus app-version/build/network/auth-key headers), which triggered the
  API's app-version gate and rejected every request with `__APP_UPDATE_REQUIRED` (401). Do not
  regress these two header values.
- `fitnessCenterId` query param (from `.env`) — injected into every proxied request's query string
  via the proxy's `rewrite` function; widgets never read or hardcode it themselves.

**This is a dev-only mechanism.** `ng build` produces a static SPA with no server component —
`proxy.conf.js` only runs under `ng serve`. **Before any production deployment, the Basic Auth
credential needs a real backend-for-frontend (BFF)** to hold it server-side and proxy these calls;
shipping it inside a static browser bundle would expose it to anyone who opens dev tools. This is
listed again in the gap list below — it's the single most important item before this goes to prod.

### Revenue at a glance (Money zone) — `src/app/dashboard/widgets/revenue-glance/`
`GET /v2/reports/orderStatistics`, 3 parallel calls (`statusType=success/failed/refunded`).
`success.totalAmount`/`clubAmount`/`totalTransactions` feed the primary line;
`failed.totalAmount`/`refunded.totalAmount` feed the secondary line. **Gross of refunds** (refunds
shown as their own line, not netted out — see gap list). Trend %/sparkline are flat (`// TODO`) —
a single-range aggregate call has no historical series to plot.

### Sales by department (Money zone) — `src/app/dashboard/widgets/sales-by-department/`
`GET /v2/reports/orderReport` (line-item, `statusType=success`), **paginated** (`skip`/`nextSkip`
while `nextPage` is `true`, 50-page safety cap), aggregated client-side by `Department`.
Member/non-member split via **`UserBarcode`** (non-empty and not literally `"Non-member"` =
member) — **not** the PDF's documented `Barcode` field name, which doesn't exist live (a real bug
was found and fixed here during the original build: reading `Barcode` silently read `undefined` on
every row, misclassifying 100% of revenue as non-member). Payment-method breakdown available on
hover per department. Membership tier (VIP/Gold/etc.) is unavailable from this endpoint — `// TODO`
in the widget, see gap list.

### Attendance & fill trends (People zone) — `src/app/dashboard/widgets/attendance-fill-trends/`
`GET /v2/reports/memberBookingReport`, **paginated** (`skip`/`nextSkip`/`nextPage`, same pattern),
**client-side rollup** — the PDF documents five top-level summary fields
(`totalAttendees`/`totalNonAttendee`/`totalCancellations`/`totalWaitlisted`/`totalLateCancellation`)
but **they do not exist in the live response at all**, confirmed across every `status`/date variant
tried — the live top level only ever has `skip`/`nextSkip`/`nextPage`. So this widget pages through
`bookingMembers[]` and counts client-side instead:
- `AttendanceStatus === "attended"` → attended
- `AttendanceStatus === "not-attended"` → no-show
- `IsLateCancelled === true` → late-cancelled
- `BookingStatus === "cancelled"` (excluding rows already counted as late-cancelled) → cancelled

**Findings not previously recorded in this file** (from the live wiring/verification work):
- **`AttendanceStatus`'s live enum is lowercase and different wording than the PDF** — live values
  seen: `""` (unmarked/upcoming), `"attended"`, `"not-attended"` — not the PDF's `"Attended"`/
  `"No Show"`/etc. `BookingStatus` live values: `"confirmed"`, `"cancelled"`, `"transferred"` — not
  the PDF's `"Confirmed"`/`"Cancelled"`. A `"transferred"` booking counts toward nothing in the
  rollup (matches neither attended, no-show, nor cancelled) — a deliberate v1 simplification, not
  a bug. No live-verified value for "waitlisted" was ever observed — waitlisted is dropped from v1
  for that reason (no data to trust yet, not that it's unimportant).
- **Further `User*` prefix renames confirmed live on this endpoint's line items**, beyond the
  `UserBarcode` one already known from Order Report: the live `bookingMembers[]` row shape uses
  `UserId`, `UserEmail`, `UserFullName`, `UserName`, `UserBarcode`, `UserAgreementNumber`,
  `UserClubAccountMemberId`, `UserMembershipTypes` — none of the PDF's `MemberName`/`Email`/
  `Barcode`/`AgreementNumber`/`MembershipTypes` names exist live on this endpoint either. Not used
  by this widget (which only reads `AttendanceStatus`/`BookingStatus`/`IsLateCancelled`, no
  member-identity fields), but critical if any future widget drills into line items here.
- Full inspection notes are in `docs/api/attendance-and-fill.md`; that file predates the live
  verification and still describes the top-level totals as a (correctly flagged) open question —
  this section is the live-confirmed answer.

### Confirmed aggregates (Last 30 days, 9-Jun-26 → 8-Jul-26) — cross-checked, all consistent
| Widget | Result |
|---|---|
| Revenue at a glance | success 48 txns / **$5,846.99**, failed 11 txns / $452, refunded 1 txn / −$160 |
| Sales by department | grand total **$5,846.99** (member $4,574.24 / non-member $1,272.75) |
| Attendance & fill trends | attended=2, no-show=1, cancelled=5, late-cancelled=0 |

Sales by department's grand total matches Revenue's `success.totalAmount` for the identical period
exactly — a good cross-endpoint consistency signal, worth re-running whenever either widget's
wiring changes.

## Remaining widgets — 13 on mock data, 4 AI/placeholder slots

Everything below runs on the ported mock data layer (`src/app/mock/*.ts` — same seeded RNG, same
generated shapes as the React app, so numbers are stable across reloads but not real).

**Built, on mock data** (`src/app/dashboard/widgets/`): Classes (today), Services (today), Program
& cohort fill (Classes & Programs zone) · Recent signups, At-risk / lapsing members (People zone) ·
Reward Points, Milestones (Loyalty zone) · Coverage gaps, Payroll period-to-date, Instructor
performance (Staff & Operations zone) · Front Desk board (Front Desk zone, Front Desk role only).

**Placeholder slots** (non-interactive "Coming soon" cards, no widget logic to wire): Morning
Briefing (Briefing zone), Highlights & Anomalies (Highlights zone) — the two parked "AI" zones,
Admin/Manager only — plus Loyalty's Challenges and Status features, which render via the generic
placeholder fallback rather than a dedicated component.

Suggested next endpoints per remaining widget, and the product decisions each one is blocked or
not blocked on, are in `SHC_Dashboard_Build_Brief.md` and the API doc extracts in `docs/api/`. Do
not wire another widget without explicit instruction on which one.

## Gap / follow-up list (running section)

- **Auth must move server-side (BFF) before production.** The dev proxy's Basic Auth credential
  only stays out of the client bundle because `proxy.conf.js` runs in Node during `ng serve` — a
  production static build has nowhere to hide it. This needs a real backend service in front of
  the reports API before this app is deployed anywhere real users can inspect network traffic.
- **Revenue figure is GROSS of refunds** (refunds shown as their own line, not netted out of the
  headline total). Product decision pending: keep gross, or switch to net-of-refunds as the
  primary number.
- **No endpoint used so far returns a historical series.** Revenue's and Attendance's trend
  %/sparklines are flat (`// TODO` in both widgets) — every one of these reports takes a single
  `fromDate`/`toDate` range and returns one aggregate; a real trend needs a second (prior-period)
  call, and a real sparkline needs multiple historical range calls (one per bucket).
- **Manager department-scoping is not built on any of the 3 wired widgets.** `// TODO` at the exact
  line in each widget's `.ts` file — waiting on a real logged-in-user department identity, which
  doesn't exist yet (no auth/login built). All three are Admin/all-club only for now, regardless of
  which role is active in the demo role-switcher.
- **Treat live response shapes as source of truth over the PDF, every time, per endpoint.**
  Confirmed doc drift more than once now: `orderStatistics` includes undocumented
  `discount`/`tipAmount`/`surchargeAmount` fields and omits documented `memoryUsage`;
  `memberBookingReport`'s documented top-level totals don't exist live at all (see above); member
  identity fields are renamed with a `User*` prefix live on both Order Report and Member Booking
  Report (`UserBarcode`, `UserFullName`, `UserEmail`, `UserAgreementNumber`, `UserMembershipTypes`,
  etc. — never trust the PDF's un-prefixed names for member fields without checking a live
  response first). Order Report's money fields are also **inconsistently typed live** — plain
  numbers in some rows, `"$"`-prefixed or empty strings in others — every widget reading them
  parses defensively (strip `$`/`,`, coerce to number, default to 0) rather than trusting the
  stated type.
- **`fitnessCenterId=38` is assumed to scope to one test centre** — never independently confirmed
  (e.g. by cross-checking against a known record count or a second fitness centre's different
  numbers). Watch this as more widgets come online; if numbers ever look implausible, this
  assumption is the first thing to re-check.
- **Fill % is deferred.** `memberBookingReport` has no capacity/spots field at all. Fill % would
  need a second call to `GET /v2/reports/attendanceReport` (which exposes per-event
  `BookedSpots`/`TotalSpots`) and combining it with this widget's data — not attempted yet. See
  `docs/api/attendance-and-fill.md`, "Fill %".
- **Membership tier (VIP/Gold/etc.) is unavailable** from Order Report or any endpoint identified
  so far — only member-vs-non-member (via `UserBarcode`) can be computed today. A members/
  agreements report would be needed for tier; not yet located. `// TODO` in Sales by department.
- **Cross-endpoint consistency check passed**: Sales by department's grand total exactly matched
  Revenue's `success.totalAmount` for the identical period (see confirmed-aggregates table above).
  Worth repeating this kind of check as more widgets come online.

## What's broken

Nothing currently known. `ng build` is clean (no errors or warnings). The layout regression
described in "Port history" above was found and fixed in the same session it was introduced.

## Next exact step

**Waiting on the user.** All 3 planned live connections (Revenue at a glance, Sales by department,
Attendance & fill trends) are wired and confirmed against staging; the visual/layout port is
complete and verified via `ng build`. Do not wire another widget or touch the visual chrome without
explicit instruction — see `SHC_Dashboard_Build_Brief.md` for the full v1 widget list and this
file's gap list for open product decisions that block further wiring work.
