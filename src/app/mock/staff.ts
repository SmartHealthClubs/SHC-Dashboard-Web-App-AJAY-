export type StaffRole = "manager" | "coach"

export type Staff = {
  id: string
  name: string
  role: StaffRole
  locationId: string
  /** Departments this person manages (role "manager") or teaches in (role "coach"). */
  departmentIds: string[]
}

export const STAFF: Staff[] = [
  {
    id: "jordan-smith",
    name: "Jordan Smith",
    role: "manager",
    locationId: "downtown",
    departmentIds: ["group-fitness", "personal-training"],
  },
  {
    id: "casey-nguyen",
    name: "Casey Nguyen",
    role: "coach",
    locationId: "downtown",
    departmentIds: ["group-fitness"],
  },
  {
    id: "riley-chen",
    name: "Riley Chen",
    role: "coach",
    locationId: "downtown",
    departmentIds: ["personal-training"],
  },
  {
    id: "quinn-alvarez",
    name: "Quinn Alvarez",
    role: "coach",
    locationId: "downtown",
    departmentIds: ["court-sports"],
  },
  {
    id: "morgan-patel",
    name: "Morgan Patel",
    role: "manager",
    locationId: "northside",
    departmentIds: ["group-fitness", "kids-programs"],
  },
  {
    id: "alex-rivera",
    name: "Alex Rivera",
    role: "coach",
    locationId: "northside",
    departmentIds: ["group-fitness"],
  },
  {
    id: "sam-okafor",
    name: "Sam Okafor",
    role: "coach",
    locationId: "northside",
    departmentIds: ["kids-programs"],
  },
  {
    id: "taylor-brooks",
    name: "Taylor Brooks",
    role: "manager",
    locationId: "riverside",
    departmentIds: ["aquatics", "kids-programs"],
  },
  {
    id: "drew-kim",
    name: "Drew Kim",
    role: "coach",
    locationId: "riverside",
    departmentIds: ["aquatics"],
  },
  {
    id: "jamie-reyes",
    name: "Jamie Reyes",
    role: "coach",
    locationId: "riverside",
    departmentIds: ["kids-programs"],
  },
]

export function coachesInDepartment(departmentId: string): Staff[] {
  return STAFF.filter(
    (s) => s.role === "coach" && s.departmentIds.includes(departmentId)
  )
}

export function managersForLocation(locationId: string): Staff[] {
  return STAFF.filter((s) => s.role === "manager" && s.locationId === locationId)
}

/**
 * The mockup has no real login, so "my-departments"/"mine" scope needs a
 * stand-in identity: the first manager/coach at the currently selected
 * location. Switching locations in the top bar effectively switches whose
 * departments/classes "mine" refers to.
 */
export function primaryManagerForLocation(locationId: string): Staff | undefined {
  return managersForLocation(locationId)[0]
}

export function primaryCoachForLocation(locationId: string): Staff | undefined {
  return STAFF.find((s) => s.role === "coach" && s.locationId === locationId)
}
