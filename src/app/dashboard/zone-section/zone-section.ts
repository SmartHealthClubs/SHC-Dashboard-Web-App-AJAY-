import { Component, computed, input, signal } from '@angular/core';
import type { ZoneDef } from '@/lib/zones';
import type { ResolvedWidget } from '@/lib/dashboard';
import { PeriodControl } from '../period-control/period-control';
import { WidgetPlaceholderCard } from '../widget-placeholder-card/widget-placeholder-card';

import { RevenueGlance } from '../widgets/revenue-glance/revenue-glance';
import { SalesByDepartment } from '../widgets/sales-by-department/sales-by-department';
import { ClassesToday } from '../widgets/classes-today/classes-today';
import { ServicesToday } from '../widgets/services-today/services-today';
import { CoverageGaps } from '../widgets/coverage-gaps/coverage-gaps';
import { RecentSignups } from '../widgets/recent-signups/recent-signups';
import { AttendanceFillTrends } from '../widgets/attendance-fill-trends/attendance-fill-trends';
import { AtRiskMembers } from '../widgets/at-risk-members/at-risk-members';
import { LoyaltyPoints } from '../widgets/loyalty-points/loyalty-points';
import { LoyaltyMilestones } from '../widgets/loyalty-milestones/loyalty-milestones';
import { ProgramCohortFill } from '../widgets/program-cohort-fill/program-cohort-fill';
import { PayrollPtd } from '../widgets/payroll-ptd/payroll-ptd';
import { InstructorPerformance } from '../widgets/instructor-performance/instructor-performance';
import { FrontDeskBoard } from '../widgets/front-desk-board/front-desk-board';
import { BriefingPlaceholder } from '../widgets/briefing-placeholder/briefing-placeholder';
import { HighlightsPlaceholder } from '../widgets/highlights-placeholder/highlights-placeholder';

// Widget ids that have a real component below — anything else in the
// registry falls back to WidgetPlaceholderCard. Mirrors the React app's
// WIDGET_COMPONENTS lookup map (src/components/dashboard/widget-components.tsx).
const BUILT_WIDGET_IDS = new Set([
  'revenue-glance',
  'sales-by-department',
  'classes-today',
  'services-today',
  'coverage-gaps',
  'recent-signups',
  'attendance-fill-trends',
  'at-risk-members',
  'loyalty-points',
  'loyalty-milestones',
  'program-cohort-fill',
  'payroll-ptd',
  'instructor-performance',
  'front-desk-board',
  'briefing-placeholder',
  'highlights-placeholder',
]);

@Component({
  selector: 'app-zone-section',
  imports: [
    PeriodControl,
    WidgetPlaceholderCard,
    RevenueGlance,
    SalesByDepartment,
    ClassesToday,
    ServicesToday,
    CoverageGaps,
    RecentSignups,
    AttendanceFillTrends,
    AtRiskMembers,
    LoyaltyPoints,
    LoyaltyMilestones,
    ProgramCohortFill,
    PayrollPtd,
    InstructorPerformance,
    FrontDeskBoard,
    BriefingPlaceholder,
    HighlightsPlaceholder,
  ],
  templateUrl: './zone-section.html',
})
export class ZoneSection {
  readonly zone = input.required<ZoneDef>();
  readonly widgets = input.required<ResolvedWidget[]>();

  // Mirrors the React app's `useState(zone.periodOptions?.[0] ?? "")`.
  // Required inputs aren't safely readable in a constructor/field initializer
  // (Angular sets them just after construction, not before), so this starts
  // empty and `effectivePeriod` supplies the zone's default until the user
  // picks something via the period control — functionally identical to
  // seeding useState once, since PeriodControl always writes a real value.
  private readonly period = signal('');
  protected readonly effectivePeriod = computed(() => this.period() || this.zone().periodOptions?.[0] || '');

  protected setPeriod(value: string): void {
    this.period.set(value);
  }

  protected readonly statWidgets = computed(() =>
    this.widgets().filter((w) => w.widget.renderMode === 'stat')
  );
  protected readonly otherWidgets = computed(() =>
    this.widgets().filter((w) => w.widget.renderMode !== 'stat')
  );

  protected isBuilt(id: string): boolean {
    return BUILT_WIDGET_IDS.has(id);
  }
}
