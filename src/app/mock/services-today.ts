import { createRng } from "@/mock/seed"
import { atTime, isoDateTime, startOfToday } from "@/mock/dates"
import { memberName } from "@/mock/members"
import { STAFF } from "@/mock/staff"
import { resourcesForLocation } from "@/mock/resources"

export type ServiceType = "private" | "semi-private" | "equipment" | "court"

export type ServiceBooking = {
  id: string
  type: ServiceType
  time: string
  locationId: string
  /** Trainer name for private/semi-private, equipment/court name otherwise. */
  resourceName: string
  /** Set for equipment/court bookings — cross-references `resources.ts`. */
  resourceId?: string
  /** Set for private/semi-private bookings — the assigned trainer, for coach-scoped views. */
  staffId?: string
  /**
   * Set for private/semi-private (Personal Training) and court (Court Sports)
   * bookings, for manager-department scoping. Equipment bookings are left
   * unset — they're a shared club resource, not owned by one department.
   */
  departmentId?: string
  clients: string[]
  capacity: number
}

const rng = createRng(7777)

function clientList(count: number, offset: number): string[] {
  return Array.from({ length: count }, (_, i) => memberName(offset + i))
}

/** Not every club runs every service type — this is deliberately different per location. */
const SERVICE_OFFERINGS: Record<string, ServiceType[]> = {
  downtown: ["private", "semi-private", "court"],
  northside: ["private", "semi-private"],
  riverside: ["equipment"],
}

const HOURS = [8, 9.5, 11, 13, 15, 16.5, 18]

let memberCursor = 0
function nextClients(count: number): string[] {
  const list = clientList(count, memberCursor)
  memberCursor += count
  return list
}

function buildServicesForLocation(locationId: string): ServiceBooking[] {
  const offerings = SERVICE_OFFERINGS[locationId] ?? []
  // Only coaches actually tagged for Personal Training take private/semi-private
  // bookings — some clubs offer the service but don't have one on staff yet.
  const trainers = STAFF.filter(
    (s) =>
      s.role === "coach" &&
      s.locationId === locationId &&
      s.departmentIds.includes("personal-training")
  )
  const bookings: ServiceBooking[] = []
  let counter = 0

  for (const type of offerings) {
    for (const hour of HOURS) {
      if (!rng.bool(0.6)) continue
      counter += 1
      const time = isoDateTime(
        atTime(startOfToday(), Math.floor(hour), hour % 1 === 0 ? 0 : 30)
      )

      if (type === "private") {
        const trainer = trainers.length > 0 ? rng.pick(trainers) : undefined
        bookings.push({
          id: `svc-${locationId}-${counter}`,
          type,
          time,
          locationId,
          resourceName: trainer?.name ?? "Unassigned",
          staffId: trainer?.id,
          departmentId: "personal-training",
          clients: nextClients(1),
          capacity: 1,
        })
      } else if (type === "semi-private") {
        const capacity = rng.int(2, 8)
        const trainer = trainers.length > 0 ? rng.pick(trainers) : undefined
        bookings.push({
          id: `svc-${locationId}-${counter}`,
          type,
          time,
          locationId,
          resourceName: trainer?.name ?? "Unassigned",
          staffId: trainer?.id,
          departmentId: "personal-training",
          clients: nextClients(rng.int(2, capacity)),
          capacity,
        })
      } else if (type === "equipment") {
        const equipment = resourcesForLocation(locationId).filter(
          (r) => r.type === "equipment"
        )
        const resource = rng.pick(equipment)
        bookings.push({
          id: `svc-${locationId}-${counter}`,
          type,
          time,
          locationId,
          resourceName: resource.name,
          resourceId: resource.id,
          clients: nextClients(1),
          capacity: 1,
        })
      } else if (type === "court") {
        const capacity = 6
        const courts = resourcesForLocation(locationId).filter(
          (r) => r.type === "court"
        )
        const resource = rng.pick(courts)
        bookings.push({
          id: `svc-${locationId}-${counter}`,
          type,
          time,
          locationId,
          resourceName: resource.name,
          resourceId: resource.id,
          departmentId: "court-sports",
          clients: nextClients(rng.int(2, capacity)),
          capacity,
        })
      }
    }
  }

  return bookings
}

export const SERVICES_TODAY: ServiceBooking[] = Object.keys(SERVICE_OFFERINGS)
  .flatMap(buildServicesForLocation)
  .sort((a, b) => a.time.localeCompare(b.time))
