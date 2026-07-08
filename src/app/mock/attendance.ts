import { createRng } from "@/mock/seed"
import { atTime, isoDate, lastNWeeks, timeLabel } from "@/mock/dates"
import { LOCATIONS } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"
import { coachesInDepartment } from "@/mock/staff"
import { CLASS_NAMES } from "@/mock/class-names"

// Mirrors the shape of the real "attendance report" line items.
export type AttendanceRecord = {
  id: string
  weekIndex: number
  date: string
  time: string
  locationId: string
  departmentId: string
  className: string
  numAttendees: number
  capacity: number
  costPerAttendee: number
  instructorIds: string[]
  amount: number
}

const rng = createRng(2468)
const WEEKS = lastNWeeks(8)
const SESSIONS_PER_WEEK = [1, 2, 3, 4, 5] // Mon–Fri class days

export const ATTENDANCE: AttendanceRecord[] = LOCATIONS.flatMap((location) =>
  departmentsForLocation(location.id).flatMap((department) => {
    const classNames = CLASS_NAMES[department.id]
    if (!classNames) return []
    const coaches = coachesInDepartment(department.id)
    if (coaches.length === 0) return []

    return WEEKS.flatMap((week) =>
      SESSIONS_PER_WEEK.map((dayOffset) => {
        const date = new Date(week.weekStart)
        date.setDate(date.getDate() + dayOffset)
        const time = atTime(date, rng.pick([7, 9, 12, 17, 18]))
        const capacity = rng.int(10, 26)
        const numAttendees = Math.min(
          capacity,
          Math.round(capacity * rng.float(0.4, 1))
        )
        const costPerAttendee = rng.float(6, 18)

        return {
          id: `att-${location.id}-${department.id}-${week.index}-${dayOffset}`,
          weekIndex: week.index,
          date: isoDate(date),
          time: timeLabel(time),
          locationId: location.id,
          departmentId: department.id,
          className: rng.pick(classNames),
          numAttendees,
          capacity,
          costPerAttendee: Math.round(costPerAttendee * 100) / 100,
          instructorIds: [rng.pick(coaches).id],
          amount: Math.round(numAttendees * costPerAttendee * 100) / 100,
        }
      })
    )
  })
)
