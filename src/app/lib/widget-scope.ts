import type { ScopeLevel } from "@/lib/scope"
import { primaryCoachForLocation, primaryManagerForLocation } from "@/mock/staff"

/**
 * "all" sentinel means no department filter — include every department.
 * For "my-classes"/"mine" (coach), falls back to the coach's own department(s)
 * — used by department-keyed data that isn't broken out per instructor.
 */
export function departmentIdsForScope(scope: ScopeLevel, locationId: string): string[] | "all" {
  if (scope === "all") return "all"
  if (scope === "my-departments") return primaryManagerForLocation(locationId)?.departmentIds ?? []
  return primaryCoachForLocation(locationId)?.departmentIds ?? []
}

/** The mockup's stand-in for "who am I" when a widget needs the specific coach, not just their department. */
export function currentCoachId(locationId: string): string | undefined {
  return primaryCoachForLocation(locationId)?.id
}

export function matchesLocationScope(
  row: { locationId: string; departmentId?: string },
  scope: ScopeLevel,
  locationId: string,
  departmentIds: string[] | "all"
): boolean {
  if (scope === "all") return true
  if (row.locationId !== locationId) return false
  if (departmentIds === "all") return true
  return row.departmentId !== undefined && departmentIds.includes(row.departmentId)
}

export function sumOrNull(values: (number | null)[]): number | null {
  const nonNull = values.filter((v): v is number => v !== null)
  if (nonNull.length === 0) return null
  return nonNull.reduce((a, b) => a + b, 0)
}
