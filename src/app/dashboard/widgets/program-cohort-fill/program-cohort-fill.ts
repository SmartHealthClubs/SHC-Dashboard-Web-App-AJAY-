import { Component, computed, inject, input } from '@angular/core';
import { COHORTS } from '@/mock/cohorts';
import { DEPARTMENTS } from '@/mock/departments';
import { LOCATIONS } from '@/mock/locations';
import { LocationService } from '@/services/location.service';
import { currentCoachId, departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import type { ScopeLevel } from '@/lib/scope';

function departmentName(id: string): string {
  return DEPARTMENTS.find((d) => d.id === id)?.name ?? id;
}

function locationName(id: string): string {
  return LOCATIONS.find((l) => l.id === id)?.name ?? id;
}

function fillTone(percentFull: number): string {
  if (percentFull < 40) return 'text-status-negative';
  if (percentFull < 70) return 'text-status-warning';
  return 'text-status-positive';
}

@Component({
  selector: 'app-program-cohort-fill',
  templateUrl: './program-cohort-fill.html',
})
export class ProgramCohortFill {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly departmentName = departmentName;
  protected readonly locationName = locationName;
  protected readonly fillTone = fillTone;

  protected readonly rows = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const filtered =
      scope === 'my-classes'
        ? COHORTS.filter((c) => c.instructorId === currentCoachId(locationId))
        : COHORTS.filter((c) =>
            matchesLocationScope(c, scope, locationId, departmentIdsForScope(scope, locationId))
          );

    return [...filtered]
      .sort((a, b) => a.signups / a.capacity - b.signups / b.capacity)
      .map((row) => ({ ...row, percentFull: Math.round((row.signups / row.capacity) * 100) }));
  });

  protected readonly visible = computed(() => this.rows().slice(0, 6));
}
