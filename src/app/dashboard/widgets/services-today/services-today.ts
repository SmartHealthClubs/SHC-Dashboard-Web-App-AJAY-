import { Component, computed, inject, input } from '@angular/core';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';
import { CircleDot, Dumbbell, User, Users } from '@/icons';
import { SERVICES_TODAY, type ServiceBooking, type ServiceType } from '@/mock/services-today';
import { LOCATIONS } from '@/mock/locations';
import { timeLabel } from '@/mock/dates';
import { LocationService } from '@/services/location.service';
import { currentCoachId, departmentIdsForScope } from '@/lib/widget-scope';
import type { ScopeLevel } from '@/lib/scope';

const TYPE_ORDER: ServiceType[] = ['private', 'semi-private', 'equipment', 'court'];
const TYPE_LABELS: Record<ServiceType, string> = {
  private: 'Private Appointments',
  'semi-private': 'Semi-Private',
  equipment: 'Equipment Booking',
  court: 'Court Booking',
};
const TYPE_ICONS: Record<ServiceType, LucideIconData> = {
  private: User,
  'semi-private': Users,
  equipment: Dumbbell,
  court: CircleDot,
};

function locationName(id: string): string {
  return LOCATIONS.find((l) => l.id === id)?.name ?? id;
}

function scopedServices(scope: ScopeLevel, locationId: string): ServiceBooking[] {
  if (scope === 'all') return SERVICES_TODAY;
  if (scope === 'my-departments') {
    const departmentIds = departmentIdsForScope(scope, locationId);
    return SERVICES_TODAY.filter((s) => {
      if (s.locationId !== locationId) return false;
      if (s.departmentId === undefined) return true;
      return departmentIds === 'all' || departmentIds.includes(s.departmentId);
    });
  }
  const coachId = currentCoachId(locationId);
  return SERVICES_TODAY.filter((s) => s.staffId === coachId);
}

@Component({
  selector: 'app-services-today',
  imports: [LucideAngularModule],
  templateUrl: './services-today.html',
})
export class ServicesToday {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly TYPE_LABELS = TYPE_LABELS;
  protected readonly TYPE_ICONS = TYPE_ICONS;
  protected readonly locationName = locationName;
  protected readonly timeLabel = (iso: string) => timeLabel(new Date(iso));

  protected readonly grouped = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const rows = [...scopedServices(scope, locationId)].sort((a, b) => a.time.localeCompare(b.time));
    return TYPE_ORDER.map((type) => ({
      type,
      rows: rows.filter((r) => r.type === type),
      visible: rows.filter((r) => r.type === type).slice(0, 8),
    })).filter((g) => g.rows.length > 0);
  });
}
