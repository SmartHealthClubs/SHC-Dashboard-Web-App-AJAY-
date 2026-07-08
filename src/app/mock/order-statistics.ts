import { createRng } from "@/mock/seed"
import { lastNWeeks } from "@/mock/dates"
import { LOCATIONS } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

// Mirrors the shape of the real "order statistics" aggregate report.
export type OrderStatistics = {
  weekIndex: number
  weekLabel: string
  locationId: string
  departmentId: string
  totalTransactions: number
  amount: number
  discount: number
  taxAmount: number
  totalAmount: number
  stripeFeeAmount: number
  convenienceFeeAmount: number
  clubAmount: number
}

const rng = createRng(5150)
const WEEKS = lastNWeeks(8)

export const ORDER_STATISTICS: OrderStatistics[] = LOCATIONS.flatMap((location) =>
  departmentsForLocation(location.id).flatMap((department) =>
    WEEKS.map((week) => {
      const totalTransactions = rng.int(60, 260)
      const amount = rng.float(totalTransactions * 18, totalTransactions * 42)
      const discount = rng.float(amount * 0.01, amount * 0.06)
      const taxAmount = rng.float(amount * 0.04, amount * 0.08)
      const totalAmount = amount - discount + taxAmount
      const stripeFeeAmount = rng.float(totalAmount * 0.015, totalAmount * 0.03)
      const convenienceFeeAmount = rng.float(0, totalAmount * 0.01)
      const clubAmount = totalAmount - stripeFeeAmount - convenienceFeeAmount

      return {
        weekIndex: week.index,
        weekLabel: week.label,
        locationId: location.id,
        departmentId: department.id,
        totalTransactions,
        amount: round2(amount),
        discount: round2(discount),
        taxAmount: round2(taxAmount),
        totalAmount: round2(totalAmount),
        stripeFeeAmount: round2(stripeFeeAmount),
        convenienceFeeAmount: round2(convenienceFeeAmount),
        clubAmount: round2(clubAmount),
      }
    })
  )
)

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
