import { Component, computed, inject, input, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { LucideAngularModule } from 'lucide-angular';
import { AlertTriangle, Repeat } from '@/icons';
import { COVERAGE_GAPS, type CoverageGap } from '@/mock/coverage-gaps';
import { DEPARTMENTS } from '@/mock/departments';
import { timeLabel } from '@/mock/dates';
import { LocationService } from '@/services/location.service';
import { departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import type { ScopeLevel } from '@/lib/scope';

type Status = CoverageGap['status'];

function departmentName(id?: string): string | undefined {
  return DEPARTMENTS.find((d) => d.id === id)?.name;
}

@Component({
  selector: 'app-coverage-gaps',
  imports: [Button, Tag, LucideAngularModule],
  templateUrl: './coverage-gaps.html',
})
export class CoverageGaps {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly AlertTriangle = AlertTriangle;
  protected readonly Repeat = Repeat;
  protected readonly departmentName = departmentName;
  protected readonly timeLabel = (iso: string) => timeLabel(new Date(iso));

  private readonly overrides = signal<Record<string, Status>>({});

  private readonly scoped = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const departmentIds = departmentIdsForScope(scope, locationId);
    return COVERAGE_GAPS.filter((row) => matchesLocationScope(row, scope, locationId, departmentIds));
  });

  protected readonly rows = computed(() => {
    const overrides = this.overrides();
    return [...this.scoped()].sort((a, b) => {
      const aPending = (overrides[a.id] ?? a.status) === 'pending';
      const bPending = (overrides[b.id] ?? b.status) === 'pending';
      if (aPending !== bPending) return aPending ? -1 : 1;
      return a.time.localeCompare(b.time);
    });
  });

  protected readonly pendingCount = computed(
    () => this.rows().filter((r) => this.statusOf(r) === 'pending').length
  );

  protected statusOf(row: CoverageGap): Status {
    return this.overrides()[row.id] ?? row.status;
  }

  protected resolve(id: string, status: Status): void {
    this.overrides.update((prev) => ({ ...prev, [id]: status }));
  }
}
