import { Component, computed, inject, input } from '@angular/core';
import { UIChart } from 'primeng/chart';
import { ATTENDANCE, type AttendanceRecord } from '@/mock/attendance';
import { STAFF } from '@/mock/staff';
import { LocationService } from '@/services/location.service';
import { currentCoachId, departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import { weekIndexesForPeriod } from '@/lib/period';
import { HORIZONTAL_BAR_PLUGINS, horizontalBarData, horizontalBarOptions } from '@/lib/chart-utils';
import { BAR_COLORS } from '@/lib/brand-colors';
import { ReportLink } from '@/dashboard/report-link/report-link';
import type { ScopeLevel } from '@/lib/scope';

function staffName(id: string): string {
  return STAFF.find((s) => s.id === id)?.name ?? id;
}

function aggregate(rows: AttendanceRecord[]) {
  const byInstructor = new Map<string, { attendees: number; capacity: number; sessions: number }>();
  for (const row of rows) {
    for (const instructorId of row.instructorIds) {
      const existing = byInstructor.get(instructorId) ?? { attendees: 0, capacity: 0, sessions: 0 };
      existing.attendees += row.numAttendees;
      existing.capacity += row.capacity;
      existing.sessions += 1;
      byInstructor.set(instructorId, existing);
    }
  }
  return byInstructor;
}

function fillPercent(totals: { attendees: number; capacity: number }): number {
  return totals.capacity > 0 ? Math.round((totals.attendees / totals.capacity) * 100) : 0;
}

@Component({
  selector: 'app-instructor-performance',
  imports: [UIChart, ReportLink],
  templateUrl: './instructor-performance.html',
})
export class InstructorPerformance {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();
  readonly period = input.required<string>();

  protected readonly data = computed(() => {
    const scope = this.scope();
    const period = this.period();
    const locationId = this.locationService.locationId();
    const weeks = weekIndexesForPeriod(period);

    if (scope === 'mine') {
      const coachId = currentCoachId(locationId) ?? '';
      const rows = ATTENDANCE.filter((r) => weeks.includes(r.weekIndex) && r.instructorIds.includes(coachId));
      const totals = aggregate(rows).get(coachId) ?? { attendees: 0, capacity: 0, sessions: 0 };
      return { self: { ...totals, fillPct: fillPercent(totals) }, ranked: null };
    }

    const departmentIds = departmentIdsForScope(scope, locationId);
    const filtered = ATTENDANCE.filter(
      (r) => weeks.includes(r.weekIndex) && matchesLocationScope(r, scope, locationId, departmentIds)
    );
    const ranked = Array.from(aggregate(filtered).entries())
      .map(([instructorId, totals]) => ({
        instructorId,
        instructorName: staffName(instructorId),
        attendees: totals.attendees,
        sessions: totals.sessions,
        fillPct: fillPercent(totals),
      }))
      .sort((a, b) => b.fillPct - a.fillPct);
    return { self: null, ranked };
  });

  protected readonly chartData = computed(() => {
    const rows = this.data().ranked ?? [];
    return horizontalBarData(
      rows.map((r) => r.instructorName),
      rows.map((r) => r.fillPct),
      BAR_COLORS
    );
  });

  protected readonly chartOptions = horizontalBarOptions((v) => `${v}%`, 100);
  protected readonly HORIZONTAL_BAR_PLUGINS = HORIZONTAL_BAR_PLUGINS;

  protected chartHeight(rowCount: number): string {
    return `${Math.max(120, rowCount * 42)}px`;
  }
}
