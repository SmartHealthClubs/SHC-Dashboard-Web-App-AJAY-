import { Component, computed, inject, input } from '@angular/core';
import { SIGNUPS, type SignupOrigin } from '@/mock/signups';
import { LocationService } from '@/services/location.service';
import { departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import { dayWindowForPeriod } from '@/lib/period';
import type { ScopeLevel } from '@/lib/scope';

const DAY_MS = 24 * 60 * 60 * 1000;

const ORIGIN_LABELS: Record<SignupOrigin, string> = {
  auto: 'Auto-created',
  staff: 'Staff-created',
  self: 'Self-created',
};

const ORIGIN_TONES: Record<SignupOrigin, string> = {
  auto: 'text-brand-blue',
  staff: 'text-brand-orange',
  self: 'text-status-positive',
};

const ORIGINS: SignupOrigin[] = ['auto', 'staff', 'self'];

function daysAgoLabel(iso: string, now: number): string {
  const days = Math.floor((now - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

@Component({
  selector: 'app-recent-signups',
  templateUrl: './recent-signups.html',
})
export class RecentSignups {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();
  readonly period = input.required<string>();

  // Captured once per component instance — the widget itself is recreated
  // per zone/dashboard mount, matching the React app's lazy useState(() => Date.now()).
  private readonly now = Date.now();

  protected readonly ORIGINS = ORIGINS;
  protected readonly ORIGIN_LABELS = ORIGIN_LABELS;
  protected readonly ORIGIN_TONES = ORIGIN_TONES;
  protected readonly daysAgoLabel = (iso: string) => daysAgoLabel(iso, this.now);

  protected readonly rows = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const departmentIds = departmentIdsForScope(scope, locationId);
    const scoped = SIGNUPS.filter((s) => matchesLocationScope(s, scope, locationId, departmentIds));

    const { start, end } = dayWindowForPeriod(this.period(), this.now);
    return scoped.filter((s) => {
      const createdAt = new Date(s.createdAt).getTime();
      return createdAt >= start && createdAt <= end;
    });
  });

  protected readonly originCounts = computed(() => {
    const counts: Record<SignupOrigin, number> = { auto: 0, staff: 0, self: 0 };
    for (const row of this.rows()) counts[row.origin] += 1;
    return counts;
  });

  protected readonly visible = computed(() => this.rows().slice(0, 6));
}
