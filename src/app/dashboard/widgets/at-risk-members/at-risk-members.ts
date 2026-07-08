import { Component, computed, inject, input } from '@angular/core';
import { AT_RISK_MEMBERS } from '@/mock/at-risk';
import { LocationService } from '@/services/location.service';
import { departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import type { ScopeLevel } from '@/lib/scope';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(iso: string, now: number): number {
  return Math.floor((now - new Date(iso).getTime()) / DAY_MS);
}

@Component({
  selector: 'app-at-risk-members',
  templateUrl: './at-risk-members.html',
})
export class AtRiskMembers {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  private readonly now = Date.now();
  protected readonly daysAgo = (iso: string) => daysAgo(iso, this.now);

  protected readonly rows = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const departmentIds = departmentIdsForScope(scope, locationId);
    return AT_RISK_MEMBERS.filter((row) => matchesLocationScope(row, scope, locationId, departmentIds)).sort(
      (a, b) => a.lastCheckIn.localeCompare(b.lastCheckIn)
    );
  });

  protected readonly visible = computed(() => this.rows().slice(0, 6));
}
