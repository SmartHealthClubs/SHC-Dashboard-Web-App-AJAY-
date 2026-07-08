import { createRng } from "@/mock/seed"
import { daysAgo, isoDate } from "@/mock/dates"
import { memberName } from "@/mock/members"
import { LOCATIONS } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

// Mirrors last-activity fields sourced from account records + nightly
// check-in sync. Threshold for what counts as "at risk" is an open product
// decision (see build brief §8) — this data represents members who have
// already gone quiet across all three signals.
export type AtRiskMember = {
  id: string
  memberName: string
  locationId: string
  departmentId: string
  lastAppOpen: string
  lastBooking: string
  lastCheckIn: string
}

const rng = createRng(2020)

export const AT_RISK_MEMBERS: AtRiskMember[] = Array.from({ length: 18 }, (_, i) => {
  const location = rng.pick(LOCATIONS)
  const departments = departmentsForLocation(location.id)
  const department = rng.pick(departments)

  return {
    id: `at-risk-${i}`,
    memberName: memberName(i + 30),
    locationId: location.id,
    departmentId: department.id,
    lastAppOpen: isoDate(daysAgo(rng.int(21, 95))),
    lastBooking: isoDate(daysAgo(rng.int(25, 110))),
    lastCheckIn: isoDate(daysAgo(rng.int(18, 80))),
  }
}).sort((a, b) => a.lastCheckIn.localeCompare(b.lastCheckIn))
