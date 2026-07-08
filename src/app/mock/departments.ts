export type Department = {
  id: string
  name: string
  /** Which locations run this department — not every club offers every department. */
  locationIds: string[]
}

export const DEPARTMENTS: Department[] = [
  {
    id: "group-fitness",
    name: "Group Fitness",
    locationIds: ["downtown", "northside", "riverside"],
  },
  {
    id: "personal-training",
    name: "Personal Training",
    locationIds: ["downtown", "northside"],
  },
  {
    id: "court-sports",
    name: "Court Sports",
    locationIds: ["downtown"],
  },
  {
    id: "kids-programs",
    name: "Kids Programs",
    locationIds: ["northside", "riverside"],
  },
  {
    id: "aquatics",
    name: "Aquatics",
    locationIds: ["riverside"],
  },
]

export function departmentsForLocation(locationId: string): Department[] {
  return DEPARTMENTS.filter((d) => d.locationIds.includes(locationId))
}
