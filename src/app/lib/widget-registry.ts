import type { RoleId } from "@/lib/roles"
import type { ScopeLevel } from "@/lib/scope"
import type { ZoneId } from "@/lib/zones"

export type RenderMode = "stat" | "feed" | "custom" | "placeholder"

/** Which scope each role sees this widget at. A role missing from the map doesn't unlock it. */
export type WidgetRoleScopes = Partial<Record<RoleId, ScopeLevel>>

export type WidgetDef = {
  id: string
  title: string
  zone: ZoneId
  renderMode: RenderMode
  roleScopes: WidgetRoleScopes
}

// The v1 widgets from the build brief, plus parked placeholder slots (the
// Briefing/Highlights AI zones, and Loyalty's Challenges/Status features)
// modeled as ordinary widgets so the same zone/scope resolution logic
// covers them — no special-casing needed. Loyalty is split into separate
// Reward Points and Milestones widgets rather than one blended widget,
// since a club may run only one of those mechanics. The Briefing/Highlights
// AI placeholders are Admin/Manager only — Coach and Front Desk don't see them.
export const WIDGETS: WidgetDef[] = [
  {
    id: "briefing-placeholder",
    title: "Morning Briefing",
    zone: "briefing",
    renderMode: "placeholder",
    roleScopes: { admin: "all", manager: "all" },
  },
  {
    id: "classes-today",
    title: "Classes (today)",
    zone: "today",
    renderMode: "feed",
    roleScopes: { admin: "all", manager: "my-departments", coach: "my-classes" },
  },
  {
    id: "services-today",
    title: "Services (today)",
    zone: "today",
    renderMode: "custom",
    roleScopes: { admin: "all", manager: "my-departments", coach: "my-classes" },
  },
  {
    id: "program-cohort-fill",
    title: "Program & cohort fill",
    zone: "today",
    renderMode: "feed",
    roleScopes: { admin: "all", manager: "my-departments", coach: "my-classes" },
  },
  {
    id: "revenue-glance",
    title: "Revenue at a glance",
    zone: "money",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "sales-by-department",
    title: "Sales by department",
    zone: "money",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "recent-signups",
    title: "Recent signups",
    zone: "people",
    renderMode: "feed",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "attendance-fill-trends",
    title: "Attendance & fill trends",
    zone: "people",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments", coach: "my-classes" },
  },
  {
    id: "at-risk-members",
    title: "At-risk / lapsing members",
    zone: "people",
    renderMode: "feed",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "loyalty-points",
    title: "Reward Points",
    zone: "loyalty",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "loyalty-milestones",
    title: "Milestones",
    zone: "loyalty",
    renderMode: "feed",
    roleScopes: { admin: "all", manager: "my-departments" },
  },
  {
    id: "loyalty-challenges-placeholder",
    title: "Challenges",
    zone: "loyalty",
    renderMode: "placeholder",
    roleScopes: { admin: "all", manager: "all" },
  },
  {
    id: "loyalty-status-placeholder",
    title: "Status",
    zone: "loyalty",
    renderMode: "placeholder",
    roleScopes: { admin: "all", manager: "all" },
  },
  {
    id: "coverage-gaps",
    title: "Coverage gaps",
    zone: "staff-ops",
    renderMode: "feed",
    roleScopes: { manager: "my-departments" },
  },
  {
    id: "payroll-ptd",
    title: "Payroll period-to-date",
    zone: "staff-ops",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments", coach: "mine" },
  },
  {
    id: "instructor-performance",
    title: "Instructor performance",
    zone: "staff-ops",
    renderMode: "stat",
    roleScopes: { admin: "all", manager: "my-departments", coach: "mine" },
  },
  {
    id: "highlights-placeholder",
    title: "Highlights & Anomalies",
    zone: "highlights",
    renderMode: "placeholder",
    roleScopes: { admin: "all", manager: "all" },
  },
  {
    id: "front-desk-board",
    title: "Front Desk board",
    zone: "front-desk",
    renderMode: "custom",
    roleScopes: { "front-desk": "mine" },
  },
]
