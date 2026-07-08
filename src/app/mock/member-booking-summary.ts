import { createRng } from "@/mock/seed"
import { lastNWeeks } from "@/mock/dates"
import { LOCATIONS } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

// Mirrors the shape of the real "member booking summary" aggregate report.
export type MemberBookingSummary = {
  weekIndex: number
  weekLabel: string
  locationId: string
  departmentId: string
  totalAttendees: number
  totalNonAttendee: number
  totalCancellations: number
  totalWaitlisted: number
  totalLateCancellation: number
}

const rng = createRng(9898)
const WEEKS = lastNWeeks(8)

export const MEMBER_BOOKING_SUMMARY: MemberBookingSummary[] = LOCATIONS.flatMap(
  (location) =>
    departmentsForLocation(location.id).flatMap((department) =>
      WEEKS.map((week) => {
        const totalAttendees = rng.int(120, 420)
        return {
          weekIndex: week.index,
          weekLabel: week.label,
          locationId: location.id,
          departmentId: department.id,
          totalAttendees,
          totalNonAttendee: rng.int(5, 30),
          totalCancellations: rng.int(10, 45),
          totalWaitlisted: rng.int(0, 20),
          totalLateCancellation: rng.int(2, 18),
        }
      })
    )
)
