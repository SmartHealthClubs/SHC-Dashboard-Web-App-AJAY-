export type ZoneId =
  | "briefing"
  | "today"
  | "money"
  | "people"
  | "loyalty"
  | "staff-ops"
  | "highlights"
  | "front-desk"

export type ZoneDef = {
  id: ZoneId
  title: string
  /** Whether this zone gets a "Last 7 days"-style control, top-right of the header. */
  periodOptions?: string[]
}

// Shared across every zone with a period control, so adding/removing an
// option updates all of them at once instead of drifting out of sync.
export const PERIOD_OPTIONS = ["Today", "Yesterday", "Last 7 days", "Last 30 days", "This quarter"]

// Canonical top-to-bottom order. A zone only renders if the current role
// selection unlocks at least one widget in it — see `dashboard.ts`.
//
// "today" carries the title "Classes & Programs" because Program & cohort
// fill now lives here (enrollment/attendance-adjacent, a sibling of Classes)
// alongside Services — see HANDOFF.md for the reasoning. Coverage gaps
// moved to "staff-ops" (it's a staffing/ops concern, not a classes one).
export const ZONES: ZoneDef[] = [
  { id: "briefing", title: "Briefing" },
  { id: "today", title: "Classes & Programs" },
  { id: "money", title: "Money", periodOptions: PERIOD_OPTIONS },
  { id: "people", title: "People", periodOptions: PERIOD_OPTIONS },
  { id: "loyalty", title: "Loyalty", periodOptions: PERIOD_OPTIONS },
  { id: "staff-ops", title: "Staff & Operations", periodOptions: PERIOD_OPTIONS },
  { id: "highlights", title: "Highlights" },
  { id: "front-desk", title: "Front Desk" },
]
