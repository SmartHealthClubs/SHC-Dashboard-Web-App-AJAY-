import { createRng } from "@/mock/seed"
import { CALENDAR_EVENTS, type CalendarEvent } from "@/mock/calendar-events"
import { coachesInDepartment } from "@/mock/staff"
import { departmentsForLocation } from "@/mock/departments"
import { LOCATIONS } from "@/mock/locations"

export type CoverageGap = {
  id: string
  type: "unstaffed" | "substitution-request"
  time: string
  locationId: string
  departmentId?: string
  className: string
  /** Only set for substitution requests. */
  requestedBy?: string
  status: "pending" | "approved" | "denied"
}

const rng = createRng(3131)

const classEvents = CALENDAR_EVENTS.filter((e) => e.type === "class")

function buildUnstaffed(e: CalendarEvent): CoverageGap {
  return {
    id: `gap-unstaffed-${e.id}`,
    type: "unstaffed",
    time: e.time,
    locationId: e.locationId,
    departmentId: e.departmentId,
    className: e.name,
    status: "pending",
  }
}

function buildSubRequest(e: CalendarEvent): CoverageGap {
  const coaches = e.departmentId ? coachesInDepartment(e.departmentId) : []
  const requester = coaches.find((c) => c.id === e.instructorId)
  return {
    id: `gap-sub-${e.id}`,
    type: "substitution-request",
    time: e.time,
    locationId: e.locationId,
    departmentId: e.departmentId,
    className: e.name,
    requestedBy: requester?.name ?? "Unknown coach",
    status: "pending",
  }
}

// Probabilistic gaps for variety across the schedule.
const probabilisticUnstaffed = classEvents.filter(() => rng.bool(0.1)).map(buildUnstaffed)
const probabilisticSubRequests = classEvents
  .filter((e) => e.instructorId && rng.bool(0.12))
  .map(buildSubRequest)

// Every open request/gap generated above is "pending" — nothing in the mock
// data is pre-resolved. "Approved"/"Denied" only ever happen live, when a
// manager clicks the buttons in the widget (see coverage-gaps.tsx).
//
// On top of the random variety, guarantee every (location, department) that
// has a coach gets at least one open item — otherwise a manager scoped to a
// department with unlucky RNG rolls would see "no coverage gaps" every time,
// which understates how often this widget actually has work in it.
const covered = new Set(
  [...probabilisticUnstaffed, ...probabilisticSubRequests].map(
    (g) => `${g.locationId}:${g.departmentId}`
  )
)

const guaranteed: CoverageGap[] = []
for (const location of LOCATIONS) {
  for (const department of departmentsForLocation(location.id)) {
    if (coachesInDepartment(department.id).length === 0) continue
    if (covered.has(`${location.id}:${department.id}`)) continue

    const candidates = classEvents.filter(
      (e) => e.locationId === location.id && e.departmentId === department.id
    )
    if (candidates.length === 0) continue

    const event = rng.pick(candidates)
    guaranteed.push(rng.bool(0.5) ? buildUnstaffed(event) : buildSubRequest(event))
  }
}

export const COVERAGE_GAPS: CoverageGap[] = [
  ...probabilisticUnstaffed,
  ...probabilisticSubRequests,
  ...guaranteed,
].sort((a, b) => a.time.localeCompare(b.time))
