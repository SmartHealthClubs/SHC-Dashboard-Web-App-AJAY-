export type ScopeLevel = "all" | "my-departments" | "my-classes" | "mine"

export const SCOPE_LABELS: Record<ScopeLevel, string> = {
  all: "All locations",
  "my-departments": "My departments",
  "my-classes": "My classes",
  mine: "Mine",
}

const SCOPE_RANK: Record<ScopeLevel, number> = {
  all: 3,
  "my-departments": 2,
  "my-classes": 1,
  mine: 1,
}

/** Where two roles unlock the same widget at different scopes, the broadest scope wins. */
export function broadestScope(scopes: ScopeLevel[]): ScopeLevel {
  return scopes.reduce((broadest, scope) =>
    SCOPE_RANK[scope] > SCOPE_RANK[broadest] ? scope : broadest
  )
}
