import { createRng } from "@/mock/seed"
import { atTime, isoDate, isoDateTime, startOfToday } from "@/mock/dates"
import { departmentsForLocation } from "@/mock/departments"
import { coachesInDepartment } from "@/mock/staff"
import { LOCATIONS } from "@/mock/locations"
import { COHORTS } from "@/mock/cohorts"
import { CLASS_NAMES } from "@/mock/class-names"

export type CalendarEventType =
  | "class"
  | "appointment"
  | "court"
  | "program"
  | "childcare"

export type CalendarEvent = {
  id: string
  type: CalendarEventType
  date: string
  time: string
  name: string
  locationId: string
  departmentId?: string
  instructorId?: string
  capacity: number
  booked: number
}

const rng = createRng(9001)

function buildEventsForDay(dayOffset: number): CalendarEvent[] {
  const day = atTime(startOfToday(), 0)
  day.setDate(day.getDate() + dayOffset)
  const date = isoDate(day)
  const events: CalendarEvent[] = []
  let counter = 0

  for (const location of LOCATIONS) {
    for (const department of departmentsForLocation(location.id)) {
      const classNames = CLASS_NAMES[department.id]
      if (!classNames) continue
      const coaches = coachesInDepartment(department.id)
      if (coaches.length === 0) continue

      const slots = [7, 9, 12, 17, 18.5]
      for (const hour of slots) {
        if (!rng.bool(0.75)) continue
        counter += 1
        const capacity = rng.int(10, 28)
        const booked = Math.round(capacity * rng.float(0.35, 1))
        events.push({
          id: `evt-${date}-${location.id}-${counter}`,
          type: "class",
          date,
          time: isoDateTime(atTime(day, Math.floor(hour), hour % 1 === 0 ? 0 : 30)),
          name: rng.pick(classNames),
          locationId: location.id,
          departmentId: department.id,
          instructorId: rng.pick(coaches).id,
          capacity,
          booked: Math.min(booked, capacity),
        })
      }
    }

    // A couple of drop-in childcare slots at family-friendly clubs.
    if (departmentsForLocation(location.id).some((d) => d.id === "kids-programs")) {
      for (const hour of [8, 16]) {
        counter += 1
        const capacity = 12
        events.push({
          id: `evt-${date}-${location.id}-${counter}`,
          type: "childcare",
          date,
          time: isoDateTime(atTime(day, hour, 0)),
          name: "Drop-In Childcare",
          locationId: location.id,
          capacity,
          booked: rng.int(2, capacity),
        })
      }
    }
  }

  return events
}

const programEventsToday: CalendarEvent[] = COHORTS.filter(
  (c) => c.sessionTimeToday
).map((c) => ({
  id: `evt-program-${c.id}`,
  type: "program",
  date: isoDate(startOfToday()),
  time: c.sessionTimeToday!,
  name: `${c.program} — ${c.cohortName}`,
  locationId: c.locationId,
  departmentId: c.departmentId,
  instructorId: c.instructorId || undefined,
  capacity: c.capacity,
  booked: c.signups,
}))

export const CALENDAR_EVENTS: CalendarEvent[] = [
  ...buildEventsForDay(0),
  ...buildEventsForDay(1),
  ...buildEventsForDay(2),
  ...programEventsToday,
]

export function eventsForToday(): CalendarEvent[] {
  const today = isoDate(startOfToday())
  return CALENDAR_EVENTS.filter((e) => e.date === today)
}
