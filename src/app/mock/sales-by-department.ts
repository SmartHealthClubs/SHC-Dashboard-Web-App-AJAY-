import { createRng } from "@/mock/seed"
import { lastNWeeks } from "@/mock/dates"
import { LOCATIONS, isProcessorConnected } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

// Mirrors the shape of the real "sales by department" report.
// A processor amount is `null` when that location hasn't integrated that
// billing partner — renders as a "not connected" state rather than $0.
export type SalesByDepartment = {
  weekIndex: number
  weekLabel: string
  locationId: string
  departmentId: string
  clubAmount: number
  clubTaxAmount: number
  stripeAmount: number | null
  stripeTaxAmount: number | null
  appleAppStoreAmount: number | null
  appleAppStoreTaxAmount: number | null
  googlePlayStoreAmount: number | null
  googlePlayStoreTaxAmount: number | null
  totalAmount: number
}

const rng = createRng(8181)
const WEEKS = lastNWeeks(8)

function amountOrNull(locationId: string, processor: "stripe" | "apple" | "google", value: number) {
  return isProcessorConnected(locationId, processor) ? value : null
}

export const SALES_BY_DEPARTMENT: SalesByDepartment[] = LOCATIONS.flatMap((location) =>
  departmentsForLocation(location.id).flatMap((department) =>
    WEEKS.map((week) => {
      const clubAmount = rng.float(600, 5200)
      const stripeAmount = rng.float(300, 3000)
      const appleAmount = rng.float(100, 1200)
      const googleAmount = rng.float(100, 1100)

      const connectedTotal =
        clubAmount +
        (isProcessorConnected(location.id, "stripe") ? stripeAmount : 0) +
        (isProcessorConnected(location.id, "apple") ? appleAmount : 0) +
        (isProcessorConnected(location.id, "google") ? googleAmount : 0)

      return {
        weekIndex: week.index,
        weekLabel: week.label,
        locationId: location.id,
        departmentId: department.id,
        clubAmount: round2(clubAmount),
        clubTaxAmount: round2(clubAmount * 0.06),
        stripeAmount: mapOrNull(amountOrNull(location.id, "stripe", stripeAmount)),
        stripeTaxAmount: mapOrNull(
          amountOrNull(location.id, "stripe", stripeAmount * 0.06)
        ),
        appleAppStoreAmount: mapOrNull(amountOrNull(location.id, "apple", appleAmount)),
        appleAppStoreTaxAmount: mapOrNull(
          amountOrNull(location.id, "apple", appleAmount * 0.06)
        ),
        googlePlayStoreAmount: mapOrNull(
          amountOrNull(location.id, "google", googleAmount)
        ),
        googlePlayStoreTaxAmount: mapOrNull(
          amountOrNull(location.id, "google", googleAmount * 0.06)
        ),
        totalAmount: round2(connectedTotal),
      }
    })
  )
)

function mapOrNull(value: number | null): number | null {
  return value === null ? null : round2(value)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
