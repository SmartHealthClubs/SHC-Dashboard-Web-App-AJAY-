import { createRng } from "@/mock/seed"
import { atTime, isoDate, isoDateTime, startOfToday, weeksAgo } from "@/mock/dates"
import { coachesInDepartment } from "@/mock/staff"

export type Cohort = {
  id: string
  program: string
  cohortName: string
  departmentId: string
  locationId: string
  instructorId: string
  signups: number
  capacity: number
  startDate: string
  /** Time of today's session, if this cohort has one running today. */
  sessionTimeToday?: string
}

const rng = createRng(4242)

const PROGRAM_DEFS: {
  program: string
  departmentId: string
  locationId: string
  cohortNames: string[]
}[] = [
  {
    program: "Beginner Triathlon Club",
    departmentId: "group-fitness",
    locationId: "downtown",
    cohortNames: ["Spring Cohort", "Summer Cohort"],
  },
  {
    program: "Youth Swim Development",
    departmentId: "aquatics",
    locationId: "riverside",
    cohortNames: ["Level 1 — Mornings", "Level 2 — Evenings"],
  },
  {
    program: "Kids Ninja Warrior",
    departmentId: "kids-programs",
    locationId: "northside",
    cohortNames: ["Ages 6–8", "Ages 9–12"],
  },
  {
    program: "12-Week Strength Reset",
    departmentId: "personal-training",
    locationId: "downtown",
    cohortNames: ["Cohort A", "Cohort B"],
  },
]

export const COHORTS: Cohort[] = PROGRAM_DEFS.flatMap((def, programIndex) => {
  const coaches = coachesInDepartment(def.departmentId)
  return def.cohortNames.map((cohortName, i) => {
    const capacity = rng.int(10, 20)
    const hasSessionToday = programIndex % 2 === i % 2
    return {
      id: `cohort-${def.departmentId}-${programIndex}-${i}`,
      program: def.program,
      cohortName,
      departmentId: def.departmentId,
      locationId: def.locationId,
      instructorId: coaches.length > 0 ? rng.pick(coaches).id : "",
      signups: Math.min(capacity, rng.int(6, capacity)),
      capacity,
      startDate: isoDate(weeksAgo(rng.int(2, 6))),
      sessionTimeToday: hasSessionToday
        ? isoDateTime(atTime(startOfToday(), 16 + i, 0))
        : undefined,
    }
  })
})
