import { Component, computed, inject, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronRight } from '@/icons';
import { CLASSES_TODAY } from '@/mock/classes-today';
import { DEPARTMENTS } from '@/mock/departments';
import { STAFF } from '@/mock/staff';
import { timeLabel } from '@/mock/dates';
import { LocationService } from '@/services/location.service';
import { currentCoachId, departmentIdsForScope, matchesLocationScope } from '@/lib/widget-scope';
import type { ScopeLevel } from '@/lib/scope';

function departmentName(id?: string): string | undefined {
  return DEPARTMENTS.find((d) => d.id === id)?.name;
}

function staffName(id?: string): string | undefined {
  return STAFF.find((s) => s.id === id)?.name;
}

function fillTone(percentFull: number): string {
  if (percentFull < 40) return 'text-status-negative';
  if (percentFull < 70) return 'text-status-warning';
  return 'text-status-positive';
}

@Component({
  selector: 'app-classes-today',
  imports: [Tooltip, LucideAngularModule],
  templateUrl: './classes-today.html',
})
export class ClassesToday {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly ChevronRight = ChevronRight;
  protected readonly departmentName = departmentName;
  protected readonly staffName = staffName;
  protected readonly fillTone = fillTone;
  protected readonly timeLabel = (iso: string) => timeLabel(new Date(iso));

  protected readonly rows = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const filtered =
      scope === 'my-classes'
        ? CLASSES_TODAY.filter(
            (c) => c.locationId === locationId && c.instructorId === currentCoachId(locationId)
          )
        : CLASSES_TODAY.filter((c) =>
            matchesLocationScope(c, scope, locationId, departmentIdsForScope(scope, locationId))
          );

    return [...filtered].sort((a, b) => a.time.localeCompare(b.time));
  });

  protected readonly visible = computed(() => this.rows().slice(0, 8));
}
