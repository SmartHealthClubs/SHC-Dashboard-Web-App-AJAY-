// Shared "is this trainer/resource busy right now" logic for the Front Desk
// board. Mock bookings only carry a start time, not a duration, so this
// assumes a flat session length — good enough for a glance board, not meant
// to be billing-grade precision.
const ASSUMED_SESSION_MINUTES = 50
const SESSION_DURATION_MS = ASSUMED_SESSION_MINUTES * 60 * 1000

export type Availability =
  | { kind: "busy"; until: Date }
  | { kind: "free-until"; until: Date }
  | { kind: "free-all-day" }

export function computeAvailability(bookingTimes: Date[], now: Date): Availability {
  const sorted = [...bookingTimes].sort((a, b) => a.getTime() - b.getTime())

  for (const start of sorted) {
    const end = new Date(start.getTime() + SESSION_DURATION_MS)
    if (now >= start && now < end) return { kind: "busy", until: end }
  }

  const next = sorted.find((t) => t.getTime() > now.getTime())
  if (next) return { kind: "free-until", until: next }

  return { kind: "free-all-day" }
}
