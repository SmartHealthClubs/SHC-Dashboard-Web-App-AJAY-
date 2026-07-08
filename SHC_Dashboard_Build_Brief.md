# SHC Staff Dashboard — Build Brief (Mockup)

**Purpose of this doc:** the single source of truth for building an interactive, deployable
*mockup* of the new SHC staff-facing dashboard. Paste this whole file into Claude Code as the
spec. Build to this — do not improvise structure or add features not listed here.

**This is a visual prototype, not production.** It runs entirely on fake/mock data so it is fully
clickable with no backend. The real product will be built later by the SHC team in Angular +
PrimeNG; they will rebuild from this mockup, so what must transfer is the *look, structure, and
interaction* — not the code.

---

## 1. Tech stack (mockup only)

- **Vite + React + TypeScript** (already scaffolded by the user).
- **Tailwind CSS** for styling, driven by a design-token layer (below).
- **shadcn/ui** for base components, **Recharts** for all charts/sparklines.
- **No backend, no localStorage/sessionStorage.** All state in React. All data from a mock layer.
- Deployable locally and pushable to git so the SHC dev team can view it.

---

## 2. Brand tokens (from official SHC Brand Guidelines, May 2024)

Set these up as CSS variables / Tailwind theme tokens. Use tokens everywhere — never hardcode hex
in components.

### Core palette
| Token | Hex | Use |
|---|---|---|
| `brand-cyan` | `#43C1E8` | Bright accent, secondary data, highlights |
| `brand-blue` (PRIMARY) | `#3D8FED` | Primary interactive, links, key data, selected states |
| `brand-navy` | `#1E2F51` | Primary text, dark surfaces, headings |
| `brand-pale` | `#DAFBFF` | Soft background, section tints |
| `surface-grey` | `#F0F4F6` | Page background, muted panels |
| `brand-gold` | `#FFC869` | Minor accent (pairs with orange) |
| `brand-orange` (CTA) | `#FF914D` | Primary call-to-action buttons only |
| `text-secondary` | `#555A5B` | Secondary body text |
| `white` | `#FFFFFF` | Card surfaces |

### Gradients
- `gradient-brand`: `#43C1E8 → #3D8FED` (hero / brand moments — use sparingly)
- `gradient-soft`: `#DAFBFF → #43C1E8`
- `gradient-cta`: `#FFC869 → #FF914D` (emphasis CTAs)

### Semantic status colors — ADDED (not in brand guide; flagged for approval)
The brand palette has no success/error/warning. A money dashboard needs them. These are tuned to
sit beside the brand blues and are used **only** for status meaning (trend up/down, failed
payments, alerts), never as decoration.
| Token | Hex | Use |
|---|---|---|
| `status-positive` | `#1FB68A` | Up-trend, success, healthy |
| `status-negative` | `#E5544B` | Down-trend, failed, at-risk |
| `status-warning` | `#FFC869` (reuse gold) | Attention, pending |

### Typography
- **Headings:** Poppins (600/700).
- **Subheadings:** Montserrat SemiBold / Medium.
- **Body:** Montserrat Regular.
- Load both from Google Fonts.

### Shape & feel
- Rounded, airy, light. Card radius ~14–16px. Pill-shaped tabs and buttons.
- White cards on `surface-grey` page background, generous spacing, soft shadows.
- Primary actions in orange; primary data/links in blue; navy text.

---

## 3. Core architecture — the widget library

**Not four fixed dashboards. One widget library.** Each widget declares:
1. **Zone** — which section it lives in.
2. **Roles** — which role(s) unlock it.
3. **Scope** — data scope per role: `all` / `my-departments` / `my-classes` (or `mine`).
4. **Render mode** — `stat` (aggregate glance tile: big number + trend + sparkline),
   `feed` (list of recent items / rows), or `custom`.

A user may hold **any combination** of roles. The dashboard shows the **union** of their unlocked
widgets, each scoped appropriately. Where two roles unlock the same widget at different scopes, the
**broadest scope wins** (e.g. Admin+Manager → `all`).

### The four roles
1. **Fitness Company Admin** — all data, all locations/departments. Heaviest page.
2. **Department Manager** — their department(s) only. May manage multiple departments. Also *acts*
   (approvals).
3. **Coach** — their own classes/clients only. Small, personal, task-anchored page.
4. **Front Desk** — an **action/availability surface**, NOT analytics. Kept as a distinct block.

### Render-mode rule of thumb
- Endpoints that return a **pre-summed** object → `stat` tile (cheap, glanceable).
- Endpoints that return **paged line-item arrays** → `feed` tile (show top N + "view full report").

---

## 4. Layout / zones

- Dashboard is a long, scrollable page of **labelled zone sections**.
- **Conditionally render:** a zone appears only if the user has ≥1 widget for it. Never show an
  empty labelled section. (A Front Desk-only user sees essentially one block, not six empty
  headers.)
- **One period control per zone** (top-right of the section header), e.g. "Last 7 days" / date
  range — not per-card steppers.
- Aggregate (`stat`) widgets render as a **hero stat-card row**: big number + trend delta
  ("▲ 12% vs last week") + small sparkline. `feed` widgets render as clean lists below.
- Zone/section names should be **non-alarming / client-safe** wording.

### Zones (top → bottom)
- **Zone 1 — Briefing (AI).** PARKED. Render a graceful "coming soon / you're all caught up"
  placeholder slot so the space looks intentional.
- **Zone 2 — Today / Now.**
- **Zone 3 — Money.**
- **Zone 4 — People.**
- **Zone 5 — Programs & Loyalty.**
- **Zone 6 — Staff / Ops.**
- **Zone 7 — Highlights / Anomalies (AI).** PARKED. Graceful placeholder slot.
- **Front Desk board** — separate action surface (see below), shown only to Front Desk.

---

## 5. v1 Widgets (BUILD THESE)

> Scope key: ● all · ◐ my-departments · ○ my-classes/mine · ▶ action-only

### Zone 2 — Today / Now
1. **Classes (today).** `feed`. Forward-looking. Today's group classes + program *events*: class
   name, attendees / capacity, **% full**, → open roster. Signal = fullness (highlight under-filled).
   Roles: Admin ●, Manager ◐, Coach ○.
2. **Services (today, grouped).** `feed`/`custom`. ONE cohesive tile grouping all of the club's
   **active** service types into a "today at a glance" view. Service types (render only the ones a
   club uses — type-adaptive, graceful absence): Private Appointment (1 trainer, 1 client),
   Semi-Private (1 trainer, up to 8), Equipment Booking (1 equipment, 1 client), Court Booking
   (1 court, up to 6). Booking-oriented (who's with whom/what), NOT fill rate. Roles: Admin ●,
   Manager ◐, Coach ○.
3. **Coverage gaps.** `feed` + action. **MANAGER ONLY.** Unstaffed upcoming events + pending
   substitution requests, with approve/disapprove inline. Roles: Manager ◐ only.

### Zone 3 — Money
4. **Revenue at a glance.** `stat`. Hero money tile: total revenue, club amount, transaction count
   for the period (source: order statistics). Include **failed / refunded** as a secondary line
   inside this same tile (source: payments-received: FailedAmount / RefundedAmount). Deep-links to
   the **existing** revenue report. Roles: Admin ●, Manager ◐.
5. **Sales by department.** `stat`/chart. Revenue split by department, with processor breakdown
   (Club / Stripe / Apple / Google) available underneath. Compact visual (ranked bars). Deep-links
   to existing sales-by-department report. Roles: Admin ●, Manager ◐.

### Zone 4 — People
6. **Recent signups.** `feed`/`stat`. From **account-creation records** (SHC DB — no endpoint;
   creation date/time). **Segmented by origin:** Auto-created (via billing partner), Staff-created,
   Self-created (app). The origin split is the value, not just the count. Roles: Admin ●, Manager ◐.
7. **Attendance & fill trends.** `stat`/chart. Backward-looking trend: attendance, no-shows,
   cancellations, late-cancels (source: member-booking summary aggregate; attendance report for
   detail). Distinct from Widget 1 (that's forward-looking per-event). Deep-links to existing
   report. Roles: Admin ●, Manager ◐, Coach ○.
8. **At-risk / lapsing members.** `feed`. Computed from last-app-open / last-booking /
   last-check-in dates (check-ins arrive **nightly** from the billing partner — usable for
   historical/aggregate, NOT real-time). Threshold rule = OPEN (see §8). Roles: Admin ●, Manager ◐.

### Zone 5 — Programs & Loyalty
9. **Loyalty engagement.** `stat`/`feed`. Points awarded / redeemed / expiring, recent reward
   moments (source: loyalty point report detail + reward summary aggregate). Deep-links to existing
   report. Roles: Admin ●, Manager ◐.
10. **Program & cohort fill.** `feed`. Enrollment happens at **cohort** level (a member signs up
    for a whole cohort = all its sessions). So show **active cohorts: sign-ups vs capacity / fill %**
    — NOT per-session fill. Deep-links to existing report. Roles: Admin ●, Manager ◐, Coach ○
    (cohorts they run).

### Zone 6 — Staff / Ops
11. **Payroll period-to-date.** `stat`. From the **combined Staff Payroll report** (summary gives
    the glance number / total pay for all; it already folds class + program + private + semi-private).
    Deep-links to existing Staff Payroll report. Roles: Admin ● (all-club total), Manager ◐,
    Coach ○ (own PTD).
12. **Instructor performance.** `stat`/chart. Attendance / fill / volume grouped by instructor
    (source: attendance report grouped by instructor). Deep-links to existing report. Roles:
    Admin ●, Manager ◐, Coach ○ (self only — NO ranking against peers).

### Front Desk board (separate surface)
13. **Front Desk board.** `custom`. ONE composite availability widget (Front Desk sees few other
    widgets, so keep it cohesive, not fragmented). Shows, as blocks: **class capacity** (space left
    today), **trainer availability**, **resource availability** (courts / equipment). Provides a
    jump to the **calendar** to actually book. **POS is its own separate page** — link out, don't
    embed. Inline "add member to class" = OPEN (see §8). Role: Front Desk ▶ only.

---

## 6. Mock data layer

- Put all mock data in `/src/mock/`.
- Shape it to *resemble* the real gym-management API responses so the swap to real endpoints later
  is clean. Key report shapes to imitate:
  - **Order statistics** (aggregate): totalTransactions, amount, discount, taxAmount, totalAmount,
    stripeFeeAmount, convenienceFeeAmount, clubAmount.
  - **Payments received** (per method): SuccessAmount, FailedAmount, RefundedAmount, TotalAmount.
  - **Sales by department**: per department → ClubAmount, StripeAmount, AppleAppStoreAmount,
    GooglePlayStoreAmount, TotalAmount (+ tax variants).
  - **Attendance report** (line items): Date, Time, Location, Department, ClassName, NumAttendees,
    capacity, CostPerAttendee, Instructors[], amounts.
  - **Member booking summary**: totalAttendees, totalNonAttendee, totalCancellations,
    totalWaitlisted, totalLateCancellation.
  - **Staff payroll summary**: rows per staff (class / program / private / semi-private) +
    totalPayForAll.
  - **Loyalty point report**: Date, MemberName, RewardType, AwardedPoints, RedeemedPoints,
    ExpiryPoints.
  - **Calendar events**: time, type (class/appointment/court/program/childcare), name, department,
    instructor, capacity/booked.
  - **Cohorts**: program → cohort name → signups vs capacity.
  - **Signups**: name, createdAt, origin (auto/staff/self).
  - **At-risk**: member, lastOpen, lastBooking, lastCheckIn.
- Provide enough rows/variety that charts and lists look real (multiple departments, locations,
  instructors, trend over ~8 weeks).
- Include realistic "not connected" / empty states for partner-sourced data (some clubs only
  integrate some billing partners).

---

## 7. The role-switcher (KEY DEMO FEATURE)

Add a visible control (corner of the shell) to switch the mock "current user's roles" —
single or any **combination** of Admin / Manager / Coach / Front Desk. Flipping it must **live-update**
the page: zones and widgets appear/disappear, scopes change, so viewers can *see* the union
architecture working. This is the thing that sells the concept to the dev team. It is a
demo/dev affordance, not a real product feature.

---

## 8. Out of scope / parked / open

**Cut (do not build):**
- Payments Health (folded into Revenue widget as the failed/refunded line).
- Credit-card expiry / past dues.
- Coach-side substitution widget (folded into Manager's Coverage gaps).

**Parked (later phase):**
- Deferred vs Realised revenue snapshot — needs a summary endpoint that doesn't exist yet.
- **AI workstream (separate initiative):** morning briefing (Zone 1), "ask your data" NL query,
  recommended actions, anomaly detection (Zone 7). Design the *slots* with graceful
  "coming soon / all caught up" placeholders; don't build the AI.
- Revisiting previously-cut widgets now that nightly check-in data is confirmed usable for
  historical/aggregate views.

**Open decisions (settle at mockup / with product):**
- Front Desk inline "add member to class" vs jump-to-calendar (leaning jump-to-calendar to keep
  the board purely glanceable).
- At-risk threshold definition (what tips a member into "at-risk").
- Leagues (matches needing score confirmation) — wanted by Manager/Coach but lives in a **separate
  Leagues API**, not the reports API. Not in v1.
- Milestone / anniversary "moments" — no endpoint exists. TBD whether v1.

---

## 9. Build order (suggested)

1. Tailwind + tokens + fonts + shell (top bar with location switcher, left nav stub, right rail,
   role-switcher).
2. Mock data layer.
3. Zone framework (conditional rendering + per-zone period control) + widget registry
   (declares zone/roles/scope/renderMode per widget).
4. Build widgets zone by zone, reviewing in browser between each. Start with Zone 3 (Money) hero
   row to lock the visual language, then Zone 2, then the rest.
5. Front Desk board.
6. AI placeholder slots (Zones 1 & 7).
