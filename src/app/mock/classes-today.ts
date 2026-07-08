import { eventsForToday } from "@/mock/calendar-events"

export type ClassToday = {
  id: string
  time: string
  locationId: string
  departmentId?: string
  className: string
  instructorId?: string
  attendees: number
  capacity: number
  percentFull: number
}

export const CLASSES_TODAY: ClassToday[] = eventsForToday()
  .filter((e) => e.type === "class" || e.type === "program")
  .map((e) => ({
    id: e.id,
    time: e.time,
    locationId: e.locationId,
    departmentId: e.departmentId,
    className: e.name,
    instructorId: e.instructorId,
    attendees: e.booked,
    capacity: e.capacity,
    percentFull: Math.round((e.booked / e.capacity) * 100),
  }))
  .sort((a, b) => a.time.localeCompare(b.time))
