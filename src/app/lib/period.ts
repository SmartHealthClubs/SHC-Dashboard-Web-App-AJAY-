// Money/People/etc. zones share one period control per zone. Mock data
// spans 8 weekly buckets (weekIndex 0 = oldest, 7 = current week) — there's
// no day-level granularity in that data, so "Today"/"Yesterday" resolve to
// the same current-week bucket as "Last 7 days" until real daily data
// exists (this is a known, deliberate approximation, not a bug).
const TOTAL_WEEKS = 8
const DAY_MS = 24 * 60 * 60 * 1000

export function weekIndexesForPeriod(period: string): number[] {
  if (period === "Today" || period === "Yesterday" || period === "Last 7 days") {
    return range(TOTAL_WEEKS - 1, TOTAL_WEEKS)
  }
  if (period === "Last 30 days") return range(TOTAL_WEEKS - 4, TOTAL_WEEKS)
  return range(0, TOTAL_WEEKS) // "This quarter" — as much history as we have
}

/** Splits the selected weeks in half to compare against the trailing period. */
export function trendWindows(period: string): { current: number[]; previous: number[] } {
  const weeks = weekIndexesForPeriod(period)
  if (weeks.length <= 1) {
    const week = weeks[0]
    return { current: weeks, previous: [Math.max(0, week - 1)] }
  }
  const half = Math.floor(weeks.length / 2)
  return { current: weeks.slice(half), previous: weeks.slice(0, half) }
}

export function trendLabel(period: string): string {
  if (period === "Today") return "vs yesterday"
  if (period === "Yesterday") return "vs the day before"
  if (period === "Last 7 days") return "vs last week"
  return "vs prior period"
}

/**
 * For day-stamped (not weekly-bucketed) mock data, e.g. signups — these
 * actually have real per-day timestamps, so "Today"/"Yesterday" are exact
 * here, not an approximation like the week-bucketed data above.
 */
export function dayWindowForPeriod(period: string, now: number): { start: number; end: number } {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const todayStart = startOfToday.getTime()

  if (period === "Today") return { start: todayStart, end: now }
  if (period === "Yesterday") return { start: todayStart - DAY_MS, end: todayStart }
  if (period === "Last 7 days") return { start: now - 7 * DAY_MS, end: now }
  if (period === "Last 30 days") return { start: now - 30 * DAY_MS, end: now }
  return { start: -Infinity, end: now } // "This quarter" — as much history as we have
}

export function percentChange(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100
  return ((current - previous) / previous) * 100
}

/**
 * The real reports API (see docs/api/orders-report.md) takes fromDate/toDate
 * as "D-MMM-YY" strings (no zero-padding on the day — e.g. "1-Jun-26", per
 * the API doc's own sample requests), not the weekIndex/dayWindow shapes
 * above, which are for the mock data only.
 */
export function apiDateRangeForPeriod(period: string, now: Date): { fromDate: string; toDate: string } {
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)

  function daysBefore(n: number): Date {
    return new Date(startOfToday.getTime() - n * DAY_MS)
  }

  let from = startOfToday
  let to = startOfToday

  if (period === "Yesterday") {
    from = daysBefore(1)
    to = daysBefore(1)
  } else if (period === "Last 7 days") {
    from = daysBefore(6)
  } else if (period === "Last 30 days") {
    from = daysBefore(29)
  } else if (period === "This quarter") {
    const quarterStartMonth = Math.floor(startOfToday.getMonth() / 3) * 3
    from = new Date(startOfToday.getFullYear(), quarterStartMonth, 1)
  }
  // "Today" (and any unrecognized value) falls through to from = to = today.

  return { fromDate: formatApiDate(from), toDate: formatApiDate(to) }
}

const API_DATE_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function formatApiDate(date: Date): string {
  const day = date.getDate() // deliberately not zero-padded, matching the API doc's examples
  const month = API_DATE_MONTHS[date.getMonth()]
  const year = String(date.getFullYear()).slice(-2)
  return `${day}-${month}-${year}`
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i)
}
