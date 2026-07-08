export type PaymentProcessor = "club" | "stripe" | "apple" | "google"
export type LoyaltyFeature = "points" | "milestones"

export type Location = {
  id: string
  name: string
  /** Some clubs only integrate some billing partners — omitted processors render as "not connected". */
  connectedProcessors: PaymentProcessor[]
  /** A club may run only one loyalty mechanic — widgets for a feature not listed here don't render. */
  loyaltyFeatures: LoyaltyFeature[]
}

export const LOCATIONS: Location[] = [
  {
    id: "downtown",
    name: "Downtown SHC",
    connectedProcessors: ["club", "stripe", "apple", "google"],
    loyaltyFeatures: ["points"],
  },
  {
    id: "northside",
    name: "Northside SHC",
    connectedProcessors: ["club", "stripe", "google"],
    loyaltyFeatures: ["milestones"],
  },
  {
    id: "riverside",
    name: "Riverside SHC",
    connectedProcessors: ["club", "stripe"],
    loyaltyFeatures: ["points", "milestones"],
  },
]

export function isProcessorConnected(
  locationId: string,
  processor: PaymentProcessor
): boolean {
  return (
    LOCATIONS.find((l) => l.id === locationId)?.connectedProcessors.includes(
      processor
    ) ?? false
  )
}

export function hasLoyaltyFeature(locationId: string, feature: LoyaltyFeature): boolean {
  return LOCATIONS.find((l) => l.id === locationId)?.loyaltyFeatures.includes(feature) ?? false
}
