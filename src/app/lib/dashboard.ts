import type { RoleId } from "@/lib/roles"
import { broadestScope, type ScopeLevel } from "@/lib/scope"
import { ZONES, type ZoneDef } from "@/lib/zones"
import { WIDGETS, type WidgetDef } from "@/lib/widget-registry"

export type ResolvedWidget = {
  widget: WidgetDef
  /** The broadest scope among the active roles that unlock this widget. */
  scope: ScopeLevel
  unlockedBy: RoleId[]
}

export type ResolvedZone = {
  zone: ZoneDef
  widgets: ResolvedWidget[]
}

function resolveWidgetsForRoles(activeRoles: RoleId[]): ResolvedWidget[] {
  const resolved: ResolvedWidget[] = []

  for (const widget of WIDGETS) {
    const unlockedBy = activeRoles.filter((role) => widget.roleScopes[role] !== undefined)
    if (unlockedBy.length === 0) continue

    const scopes = unlockedBy.map((role) => widget.roleScopes[role]!)
    resolved.push({ widget, scope: broadestScope(scopes), unlockedBy })
  }

  return resolved
}

/**
 * Resolves the full dashboard for a given role selection: which zones show
 * up (only ones with ≥1 unlocked widget), in canonical order, each with its
 * unlocked widgets and their resolved scope.
 */
export function resolveDashboard(activeRoles: RoleId[]): ResolvedZone[] {
  const resolvedWidgets = resolveWidgetsForRoles(activeRoles)

  return ZONES.map((zone) => ({
    zone,
    widgets: resolvedWidgets.filter((rw) => rw.widget.zone === zone.id),
  })).filter((resolvedZone) => resolvedZone.widgets.length > 0)
}
