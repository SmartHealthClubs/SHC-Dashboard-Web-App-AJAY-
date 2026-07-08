import { createRng } from "@/mock/seed"
import { daysAgo, isoDate } from "@/mock/dates"
import { memberName } from "@/mock/members"
import { LOCATIONS } from "@/mock/locations"

const BADGES = [
  "50 Classes Milestone",
  "100 Classes Milestone",
  "1 Year Member",
  "3 Year Member",
  "50 Check-Ins",
  "Referral Champion",
]

const rng = createRng(6161)

// Only generated for locations that actually run the Milestones mechanic —
// clubs without it simply have no milestone records, not empty ones.
export type Milestone = {
  id: string
  memberName: string
  badge: string
  date: string
  locationId: string
}

export const MILESTONES: Milestone[] = LOCATIONS.filter((l) =>
  l.loyaltyFeatures.includes("milestones")
).flatMap((location, locationIndex) =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `milestone-${location.id}-${i}`,
    memberName: memberName(locationIndex * 10 + i + 15),
    badge: rng.pick(BADGES),
    date: isoDate(daysAgo(rng.int(0, 30))),
    locationId: location.id,
  }))
).sort((a, b) => b.date.localeCompare(a.date))
