# HANDOFF

## API wiring phase: ACTIVE — 2 of ~13 widgets wired

### BLOCKER RESOLVED: `__APP_UPDATE_REQUIRED` 401
**Root cause**: the dev proxy identified itself as the mobile app (`X-Device: android`,
`X-Device-Api-Version: 1`, plus app-version/build/network/auth-key headers), which triggered the
API's app-version gate and rejected every request.
**Fix**: proxy now sends `X-Device: external-api-access`, `X-Device-Api-Version: 79`, and omits
`X-Device-App-Version` / `X-Device-Build` / `X-Device-Network` / `X-Device-Auth-Key` entirely.
**Confirmed working end-to-end**: auth (`Authorization: Basic` from `.env`), host
(`staging-cir-wa.smarthealthclubs.com` — note the "-wa," a similarly-named but wrong
`staging-cir.smarthealthclubs.com` host exists, don't confuse them), and scoping
(`fitnessCenterId=38`, injected by the proxy's `rewrite` function from `.env` — widgets never need
to read or hardcode it themselves) have all returned real `200`s with real data. Diagnosis sequence
(device headers omitted entirely → 400 "Invalid device request"; api-version 2 and 3 tried → still
401; finally the `external-api-access` identity → 200) is in git history if ever needed again.

### Established repeatable pattern, per widget
1. Extract the relevant section from `shc-reports-api-full.pdf` into `docs/api/<name>.md` (just
   that section — not the whole 92-page doc at once).
2. Wire the widget: swap its data source only, visual layout/styling untouched.
3. Confirm with live `curl`/`fetch` calls against staging (no dev server, no browser tooling).
4. Log any gaps/simplifications found along the way in the running list below.
5. Commit once per widget.

### Infrastructure (done)
- **Dev proxy** (`vite.config.ts`) — see "Blocker resolved" above for headers/host/scoping.
  `defineConfig` is a function so it can call `loadEnv(mode, process.cwd(), '')` (empty prefix
  loads every `.env` key, not just `VITE_`-prefixed ones) — these values are only ever read here in
  Node, never passed through `define`/`import.meta.env`, so they can't end up in the client bundle.
- **`.env.example`** (committed, placeholders only): `API_BASIC_AUTH`, `FITNESS_CENTER_ID`.
  **`.gitignore`** covers `.env`/`.env.*` (keeping `.env.example`) and now also
  `shc-reports-api-full.pdf` (the internal API doc the user dropped in the project folder — meant
  as reference material, not for the repo).

### Widget 1 DONE — Revenue at a glance (Zone 3, Money) — commit `108be06`
Wired to `GET /v2/reports/orderStatistics` via 3 parallel calls (`statusType=success/failed/
refunded`) run with `Promise.all`. **All from this one endpoint** — the separately-planned
payments-received endpoint is **not needed** (spec correction for the backend work-list: drop it).
`success.totalAmount`/`clubAmount`/`totalTransactions` feed the primary line; `failed.totalAmount`/
`refunded.totalAmount` feed the secondary line. Visual layout/styling untouched — only the data
layer changed. Confirmed against live staging (Last 30 days as of that day): success 48 txns /
$5,846.99, failed 11 txns / $452, refunded 1 txn / −$160 — all `200`s.

`src/lib/period.ts` gained `apiDateRangeForPeriod(period, now)`, mapping the period selector to the
real API's `fromDate`/`toDate` format (`D-MMM-YY`, no zero-padded day — e.g. `1-Jun-26`, matching
the doc's own examples). Purely additive — doesn't touch the existing weekIndex/dayWindow functions
the still-mock widgets use.

`docs/api/orders-report.md` documents this endpoint (query params, response shape) — extracted
from the API doc, not the whole doc.

### Widget 2 DONE — Sales by department (Zone 3, Money)
**Spec correction from the feasibility investigation, now acted on**: the aggregate
`GET /v2/reports/orderSummarySalesByDepartment` endpoint documented in
`docs/api/sales-by-department.md` was **rejected as inaccurate** — this widget instead wires to the
**line-item Order Report** (`GET /v2/reports/orderReport`, `statusType=success`, full detail now
added to `docs/api/orders-report.md`), aggregating rows client-side. This delivers the redesign the
feasibility doc called "buildable": member/non-member sub-line (replacing the old fixed Club/
Stripe/Apple/Google processor split) and a real payment-method breakdown on hover (using whatever
`PaymentMethod` values actually come back, not a fixed 4-processor list). Membership tier
(VIP/Gold) is still not attempted — `// TODO` in the widget, same backend gap the feasibility doc
already identified.

**Pagination implemented and required**: loops `skip`/`nextSkip` while `nextPage` is `true`, with a
50-page safety cap (logs and stops rather than looping forever if the API ever misbehaves).
Visual layout/styling untouched — same bar chart, same header, same card shell; only the sub-line
content and the new hover changed, both per explicit instruction.

**BUG FOUND AND FIXED shortly after the initial wiring**: the first version read `row.Barcode` for
member classification, matching the PDF doc's field name — but the live API actually returns this
field as **`UserBarcode`**, not `Barcode`. Since `row.Barcode` was always `undefined`, every single
row silently classified as non-member (100% non-member, $0 member revenue) — a real, live-shape
doc-drift bug, not a logic error in the classification rule itself. Confirmed by fetching a real
page and inspecting actual key names (`UserBarcode`, type `string | null` — the API's `User*`
prefix pattern also renames other doc fields we don't currently use, e.g. `AgreementNumber` →
`UserAgreementNumber`, `MemberName` → `UserFullName`). Fixed by reading the correct key. Verified
against a user-supplied ground truth (Jul 1–7, 2026: expected $113 member revenue across 4 orders)
— **matched exactly** after the fix.

**Confirmed against live staging, corrected** (Last 30 days as of that day):

| Department | Total | Member | Non-member |
|---|---|---|---|
| FitnessTraining | $5,090.00 | $4,025.00 | $1,065.00 |
| Swim | $160.00 | $0.00 | $160.00 |
| SalonAndSpa | $144.00 | $144.00 | $0.00 |
| Membership | $120.00 | $120.00 | $0.00 |
| Cafe | $118.99 | $98.24 | $20.75 |
| Tennis | $105.00 | $105.00 | $0.00 |
| GroupExercise | $93.00 | $66.00 | $27.00 |
| SwimLanes | $16.00 | $16.00 | $0.00 |

Grand total **$5,846.99** (member $4,574.24 / non-member $1,272.75) — grand total still matches
Widget 1's `success.totalAmount` for the identical period exactly, a good cross-endpoint
consistency signal that survived the fix.

### Gap / follow-up list (running section — this is the audit's main output)
- **Revenue figure is GROSS of refunds** (refunds shown as their own line, not netted out of the
  headline total). Product decision pending: keep gross, or switch to net-of-refunds as the primary
  number.
- **Trend % and the sparkline are flat** on Revenue at a glance. `orderStatistics` returns a single
  aggregate for the requested range, no historical series. Needs a second (prior-period) call when
  we want a real trend; a real sparkline needs multiple historical ranges.
- **Manager department-scoping is not built on either wired widget.** `// TODO` at the exact line
  in both `revenue-glance.tsx` and `sales-by-department.tsx` — waiting on a real logged-in-user
  department identity, which doesn't exist yet (no auth/login built). Both are Admin/all-club only
  for now, regardless of which role is active in the demo role-switcher.
- **API doc drift confirmed, twice now.** `orderStatistics` responses include undocumented
  `discount`/`tipAmount`/`surchargeAmount` and omit documented `memoryUsage`. Separately, Order
  Report's money fields are **inconsistently typed live** — plain numbers in some rows, `"$"`-
  prefixed or empty strings in others — documented in `orders-report.md`, and every widget reading
  them parses defensively (strip `$`/`,`, coerce, default to 0) rather than trusting the stated
  type. **Treat live response shapes as source of truth over the PDF**, every time, per widget.
- **`fitnessCenterId=38` is assumed to scope to one test centre** — not yet independently confirmed
  (e.g. by cross-checking against a known record count or a second fitness centre's different
  numbers). Watch this as more widgets come online; if numbers ever look implausible, this
  assumption is the first thing to re-check.
- ~~Every row in Sales by department's confirming call classified as non-member.~~ **RESOLVED** —
  this was a real bug (wrong field name, `Barcode` vs. live `UserBarcode`), not a data property.
  Fixed and verified against a user-supplied ground truth. See Widget 2's section above for detail.
  Left here, struck through, so anyone scanning this list's history can see it was investigated and
  closed rather than silently dropped.
- **`AgreementNumber`/`MemberName`/`Email` on Order Report are also live-renamed with a `User*`
  prefix** (`UserAgreementNumber`/`UserFullName`/`UserEmail`), discovered while diagnosing the
  barcode bug above. Not used by any widget today, but **anyone reading `docs/api/orders-report.md`
  should not trust its non-`User*`-prefixed field names for this endpoint without checking a live
  response first** — the doc still lists the old names since re-verifying every field there wasn't
  in scope for this fix.
- **Cross-endpoint consistency check passed once**: Widget 2's grand total ($5,846.99) exactly
  matched Widget 1's `success.totalAmount` for the identical period. Good sign both endpoints agree
  on the same underlying data — worth repeating this kind of check as more widgets come online.

## Visual mockup phase: COMPLETE (prior phase — for reference)

Every zone and widget in the v1 build brief has real content, verified across every role
combination (Admin, Manager, Coach, Front Desk, and combinations of them) and, for Manager/Coach
scope, across all 3 mock locations.

Two UI-only items were later pulled off the deferred-polish list and finished (period selector
"Today"/"Yesterday" options, Services-today heading prominence). Everything else on that list is
untouched, staying deferred until real data is wired in.

**Workflow rule, standing for the rest of this project**: verification is manual. The user checks
changes visually in the browser themselves; no automated browser-testing agents are used (see
`CLAUDE.md`, which persists this rule across sessions).

## What's built, by zone

- **Shell**: Tailwind v4 + brand tokens/fonts + shadcn/ui. Top bar (location switcher, role
  switcher, icon rail) + left nav stub. Role switcher and location switcher both drive live
  re-scoping across the whole dashboard — see `src/context/{role,location}-context.tsx`.
- **Zone framework**: `src/lib/{scope,zones,widget-registry,dashboard}.ts` resolve which
  zones/widgets show, and at what scope, from the active role selection — the "union of roles,
  broadest scope wins" rule from the spec, as pure code, covered by `src/hooks/use-dashboard-zones.ts`.
- **Mock data layer** (`src/mock/`): one file per report shape in the spec, generated relative to
  "today" so the demo never looks stale, deterministic (seeded RNG) so numbers don't reshuffle on
  reload.
- **Money zone**: Revenue at a glance (hero card, sparkline, trend, Failed/Refunded line), Sales by
  department (ranked bars, per-processor breakdown, "not connected" states).
- **Classes & Programs zone** *(originally "Today")*: Classes (today) — fill-colored feed, per-row
  roster-link stub. Services (today) — grouped by type, type-adaptive per club. Program & cohort
  fill — fill-colored feed, strict per-coach scoping for "cohorts they run."
- **People zone**: Recent signups (origin-segmented), Attendance & fill trends (hero card, labeled
  "Classes & Programs" scope so it's never confused with services), At-risk / lapsing members (raw
  last-activity signals, no invented risk threshold).
- **Loyalty zone** *(split out from a combined "Programs & Loyalty" zone — see git history)*:
  Reward Points and Milestones as two independent widgets (never blended — a club may run only
  one), each rendering only if that club's location actually uses the mechanic. Challenges/Status
  render as non-interactive "Coming soon" placeholders (not built, per spec).
- **Staff & Operations zone**: Coverage gaps (Manager-only, inline Approve/Disapprove, pending
  items always sorted first with an "N pending" badge — the single substitution surface in the
  app), Payroll period-to-date (Admin all-club / Manager by department / Coach own PTD only),
  Instructor performance (ranked bars for Admin/Manager; a *structurally separate*, simpler
  self-only card for Coach — not just a filtered list — since the spec requires no peer ranking).
- **Front Desk board** (Front Desk role only, sole widget in its zone, built to feel complete on
  its own): class capacity, trainer availability, and resource availability blocks, each computed
  live against today's bookings (`src/lib/availability.ts`); a prominent orange "Jump to Calendar"
  CTA; a Point of Sale link-out (not embedded). No inline "add member" action — open decision, not
  built.
- **Briefing & Highlights** (the two parked AI zones): on-brand "coming soon" cards
  (`ai-placeholder-card.tsx`), not real AI, per spec. Admin/Manager only — Coach and Front Desk
  don't see them.

Full chronological build history, every bug found/fixed, and every layout fix along the way is in
`git log` — each commit message describes one step in detail. Not repeated here to keep this file
usable as a snapshot rather than a diff.

## Done since the visual phase closed (UI-only, no data changes)
- **Period selector now offers "Today" and "Yesterday"**, globally, on every zone with a period
  control — added via a single shared `PERIOD_OPTIONS` list in `src/lib/zones.ts` so it can't drift
  out of sync across zones. Behavior differs by how granular the underlying mock data actually is:
  - **Day-stamped data** (Recent signups — real per-day timestamps exist): "Today"/"Yesterday" are
    exact bounded-day windows, computed by the new `dayWindowForPeriod()` in `src/lib/period.ts`.
  - **Weekly-bucketed data** (Revenue, Sales by department, Attendance trends, Reward Points,
    Instructor performance): the mock data's finest grain is a week, so "Today" and "Yesterday"
    both resolve to the current week's bucket — the same numbers as "Last 7 days" for now. This is
    a deliberate, documented approximation (see the comment at the top of `period.ts`), not a bug —
    it'll naturally get real day-level precision once the API is wired in.
- **Services (today)'s service-type headings are now visually prominent**: each type (Private
  Appointments / Semi-Private / Equipment Booking / Court Booking) has its own icon in a pale badge
  (person / people / dumbbell / dot, respectively), bolder navy heading text in the heading font,
  and a colored underline — instead of small muted uppercase text that was easy to miss.

## Deferred polish (logged, not acted on — data-dependent, waiting on API wiring)
1. **Sales by department's sub-line is the wrong dimension.** Should break down by member/
   non-member/membership tier instead of payment method, with payment method moved to hover.
   **Now investigated against the real API** (see `docs/api/sales-by-department.md` →
   "Redesign feasibility"): payment-method-on-hover is buildable today from the aggregate report
   already planned for this widget; member/tier segmentation is **not supported by any endpoint
   found so far** — blocked until a suitable report (e.g. members/agreements) is located. Not
   acted on yet either way — this item stays deferred, now with a concrete answer instead of an
   open question.
2. **Services (today) should show commercial context, not booking mechanics** (content only — the
   heading styling itself is now done, see above).
   - Private / Semi-Private / Equipment rows: Service name, Client name, Trainer name, and the
     client's remaining **session balance** for that service (prompts a repurchase conversation).
   - Court rows: player/partner names and amount charged each — no session balance.
   - **Data note**: session balance per client per service exists in the real API
     (`SessionBalances.BalanceQuantity`), but the mock data doesn't carry a client + balance pair
     per booking yet — needs adding, not just re-styling.
3. **New People widget needed: non-attendance activity** — services usage, POS purchases, other
   non-booking purchases, the commercial-activity counterpart to attendance. Shape TBD.

## Open product decisions (not polish — need an actual answer before building)
- **At-risk threshold**: still undefined by design (per spec §8). Whenever it's decided, the
  definition should be able to draw on any activity signal — class attendance, service usage, POS,
  app-open, check-in — not just booking-related ones.
- **Front Desk inline "add member to class"**: not built. "Jump to Calendar" is the only booking
  path today. Leaning toward jump-to-calendar per the original spec, but not finalized.

## What's broken
Nothing. All bugs found during the visual build (listed in git history) were fixed before moving
on. `npm run lint` has 4 non-blocking, cosmetic-only Fast Refresh warnings (2 in shadcn vendor
files, 1 each in `role-context.tsx`/`location-context.tsx`) that don't affect build or runtime.
Production bundle is on the larger side since Recharts was added — a build-size warning, not an
error, and not worth code-splitting effort for a mockup.

## Next exact step
**Waiting on the user.** Both Money-zone widgets (Revenue at a glance, Sales by department) are now
wired to real data and confirmed against staging. The Money zone is done. Do not wire another
widget without explicit instruction on which one — likely next per the build order is the Classes
& Programs zone, but wait to be told.
