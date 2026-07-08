export type Resource = {
  id: string
  name: string
  type: "equipment" | "court"
  locationId: string
}

// Canonical resource inventory — the Front Desk board checks these against
// today's bookings to show what's still free, not just what's booked.
export const RESOURCES: Resource[] = [
  { id: "reformer-1", name: "Reformer 1", type: "equipment", locationId: "riverside" },
  { id: "reformer-2", name: "Reformer 2", type: "equipment", locationId: "riverside" },
  { id: "row-erg-a", name: "Row Erg A", type: "equipment", locationId: "riverside" },
  { id: "row-erg-b", name: "Row Erg B", type: "equipment", locationId: "riverside" },
  { id: "court-1", name: "Court 1", type: "court", locationId: "downtown" },
  { id: "court-2", name: "Court 2", type: "court", locationId: "downtown" },
  { id: "court-3", name: "Court 3", type: "court", locationId: "downtown" },
]

export function resourcesForLocation(locationId: string): Resource[] {
  return RESOURCES.filter((r) => r.locationId === locationId)
}
