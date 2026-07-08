// All mock data is generated relative to "today" so the demo always looks
// current, regardless of when it's run.
const DAY_MS = 24 * 60 * 60 * 1000

export function startOfToday(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export function daysAgo(n: number): Date {
  return new Date(startOfToday().getTime() - n * DAY_MS)
}

export function daysFromNow(n: number): Date {
  return daysAgo(-n)
}

export function weeksAgo(n: number): Date {
  return daysAgo(n * 7)
}

export function atTime(date: Date, hours: number, minutes = 0): Date {
  const withTime = new Date(date)
  withTime.setHours(hours, minutes, 0, 0)
  return withTime
}

export function isoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function isoDateTime(date: Date): string {
  return date.toISOString()
}

export function weekLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function timeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export type WeekBucket = {
  /** 0 = oldest week, increasing toward the current week. */
  index: number
  weekStart: Date
  label: string
}

/** Returns `count` weekly buckets, oldest first, ending with the current week. */
export function lastNWeeks(count: number): WeekBucket[] {
  return Array.from({ length: count }, (_, i) => {
    const weeksBack = count - 1 - i
    const weekStart = weeksAgo(weeksBack)
    return { index: i, weekStart, label: weekLabel(weekStart) }
  })
}
