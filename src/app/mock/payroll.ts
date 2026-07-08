import { createRng } from "@/mock/seed"
import { isoDate, startOfToday } from "@/mock/dates"
import { STAFF } from "@/mock/staff"

// Mirrors the combined "Staff Payroll" report summary, period-to-date.
export type PayrollRow = {
  staffId: string
  staffName: string
  locationId: string
  departmentIds: string[]
  classPay: number
  programPay: number
  privatePay: number
  semiPrivatePay: number
  totalPay: number
}

const rng = createRng(9111)

function periodToDateLabel(): string {
  const today = startOfToday()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  return `${isoDate(start)} to ${isoDate(today)}`
}

export const PAYROLL_PERIOD_LABEL = periodToDateLabel()

export const PAYROLL: PayrollRow[] = STAFF.filter((s) => s.role === "coach").map(
  (coach) => {
    const classPay = rng.float(200, 1400)
    const programPay = rng.bool(0.6) ? rng.float(100, 800) : 0
    const privatePay = rng.bool(0.7) ? rng.float(150, 1200) : 0
    const semiPrivatePay = rng.bool(0.5) ? rng.float(100, 700) : 0

    return {
      staffId: coach.id,
      staffName: coach.name,
      locationId: coach.locationId,
      departmentIds: coach.departmentIds,
      classPay: round2(classPay),
      programPay: round2(programPay),
      privatePay: round2(privatePay),
      semiPrivatePay: round2(semiPrivatePay),
      totalPay: round2(classPay + programPay + privatePay + semiPrivatePay),
    }
  }
)

export const TOTAL_PAY_FOR_ALL = round2(
  PAYROLL.reduce((sum, row) => sum + row.totalPay, 0)
)

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
