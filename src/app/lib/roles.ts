export type RoleId = "admin" | "manager" | "coach" | "front-desk"

export type RoleDef = {
  id: RoleId
  label: string
  description: string
}

export const ROLES: RoleDef[] = [
  {
    id: "admin",
    label: "Fitness Company Admin",
    description: "All data, all locations and departments",
  },
  {
    id: "manager",
    label: "Department Manager",
    description: "Their department(s) only, plus approvals",
  },
  {
    id: "coach",
    label: "Coach",
    description: "Their own classes and clients only",
  },
  {
    id: "front-desk",
    label: "Front Desk",
    description: "Action and availability surface, not analytics",
  },
]

export const ROLE_LABELS: Record<RoleId, string> = ROLES.reduce(
  (acc, role) => {
    acc[role.id] = role.label
    return acc
  },
  {} as Record<RoleId, string>
)
