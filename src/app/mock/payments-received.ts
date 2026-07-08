import { createRng } from "@/mock/seed"
import { lastNWeeks } from "@/mock/dates"
import { LOCATIONS, isProcessorConnected, type PaymentProcessor } from "@/mock/locations"
import { departmentsForLocation } from "@/mock/departments"

// Mirrors the shape of the real "payments received" report, broken out per method.
export type PaymentsReceived = {
  weekIndex: number
  weekLabel: string
  locationId: string
  departmentId: string
  method: PaymentProcessor
  successAmount: number
  failedAmount: number
  refundedAmount: number
  totalAmount: number
}

const rng = createRng(6060)
const WEEKS = lastNWeeks(8)
const METHODS: PaymentProcessor[] = ["club", "stripe", "apple", "google"]

export const PAYMENTS_RECEIVED: PaymentsReceived[] = LOCATIONS.flatMap((location) =>
  departmentsForLocation(location.id).flatMap((department) =>
    METHODS.filter((method) => isProcessorConnected(location.id, method)).flatMap(
      (method) =>
        WEEKS.map((week) => {
          const successAmount = rng.float(400, 4200)
          const failedAmount = rng.float(0, successAmount * 0.05)
          const refundedAmount = rng.float(0, successAmount * 0.03)
          const totalAmount = successAmount - refundedAmount

          return {
            weekIndex: week.index,
            weekLabel: week.label,
            locationId: location.id,
            departmentId: department.id,
            method,
            successAmount: round2(successAmount),
            failedAmount: round2(failedAmount),
            refundedAmount: round2(refundedAmount),
            totalAmount: round2(totalAmount),
          }
        })
    )
  )
)

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
