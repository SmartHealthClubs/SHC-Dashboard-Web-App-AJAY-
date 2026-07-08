import { createRng } from "@/mock/seed"
import { daysAgo, isoDate, lastNWeeks } from "@/mock/dates"
import { memberName } from "@/mock/members"
import { LOCATIONS } from "@/mock/locations"

const REWARD_TYPES = [
  "Class Streak Bonus",
  "Referral Bonus",
  "Birthday Reward",
  "Milestone: 50 Classes",
  "Check-In Streak",
  "Free Guest Pass Redemption",
]

// Mirrors the "loyalty point report" line-item shape.
export type LoyaltyPointRecord = {
  id: string
  date: string
  memberName: string
  rewardType: string
  awardedPoints: number
  redeemedPoints: number
  expiryPoints: number
  locationId: string
}

// Mirrors the "reward summary" aggregate shape.
export type LoyaltySummary = {
  weekIndex: number
  weekLabel: string
  locationId: string
  totalAwarded: number
  totalRedeemed: number
  totalExpiring: number
}

const rng = createRng(4040)
const WEEKS = lastNWeeks(8)

export const LOYALTY_POINTS: LoyaltyPointRecord[] = Array.from(
  { length: 56 },
  (_, i) => {
    const location = rng.pick(LOCATIONS)
    const rewardType = rng.pick(REWARD_TYPES)
    const isRedemption = rewardType === "Free Guest Pass Redemption"

    return {
      id: `loyalty-${i}`,
      date: isoDate(daysAgo(rng.int(0, 55))),
      memberName: memberName(i + 5),
      rewardType,
      awardedPoints: isRedemption ? 0 : rng.int(25, 250),
      redeemedPoints: isRedemption ? rng.int(100, 500) : 0,
      expiryPoints: rng.bool(0.15) ? rng.int(20, 150) : 0,
      locationId: location.id,
    }
  }
).sort((a, b) => b.date.localeCompare(a.date))

export const LOYALTY_SUMMARY: LoyaltySummary[] = LOCATIONS.flatMap((location) =>
  WEEKS.map((week) => ({
    weekIndex: week.index,
    weekLabel: week.label,
    locationId: location.id,
    totalAwarded: rng.int(800, 3200),
    totalRedeemed: rng.int(300, 1800),
    totalExpiring: rng.int(0, 600),
  }))
)
