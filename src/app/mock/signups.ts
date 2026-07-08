import { createRng } from "@/mock/seed"
import { daysAgo, isoDateTime } from "@/mock/dates"
import { memberName } from "@/mock/members"
import { LOCATIONS } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

export type SignupOrigin = "auto" | "staff" | "self"

export type Signup = {
  id: string
  memberName: string
  createdAt: string
  origin: SignupOrigin
  locationId: string
  departmentId: string
}

const rng = createRng(1357)
const ORIGIN_WEIGHTS: [SignupOrigin, number][] = [
  ["auto", 0.5],
  ["self", 0.35],
  ["staff", 0.15],
]

function pickOrigin(): SignupOrigin {
  const roll = rng.next()
  let cumulative = 0
  for (const [origin, weight] of ORIGIN_WEIGHTS) {
    cumulative += weight
    if (roll < cumulative) return origin
  }
  return "auto"
}

export const SIGNUPS: Signup[] = Array.from({ length: 90 }, (_, i) => {
  const location = rng.pick(LOCATIONS)
  const departments = departmentsForLocation(location.id)
  const department = rng.pick(departments)
  const daysBack = rng.int(0, 29)
  const createdAt = isoDateTime(daysAgo(daysBack))

  return {
    id: `signup-${i}`,
    memberName: memberName(i),
    createdAt,
    origin: pickOrigin(),
    locationId: location.id,
    departmentId: department.id,
  }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
