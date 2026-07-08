import { Component, computed, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarDays, CircleDot } from '@/icons';
import { CLASSES_TODAY } from '@/mock/classes-today';
import { SERVICES_TODAY } from '@/mock/services-today';
import { STAFF } from '@/mock/staff';
import { resourcesForLocation } from '@/mock/resources';
import { timeLabel } from '@/mock/dates';
import { LocationService } from '@/services/location.service';
import { computeAvailability, type Availability } from '@/lib/availability';
import { ReportLink } from '@/dashboard/report-link/report-link';

function availabilityLabel(availability: Availability, busyWord: string): string {
  if (availability.kind === 'busy') return `${busyWord} until ${timeLabel(availability.until)}`;
  if (availability.kind === 'free-until') return `Free until ${timeLabel(availability.until)}`;
  return 'Free for the rest of the day';
}

function availabilityTone(availability: Availability): string {
  return availability.kind === 'busy' ? 'text-status-negative' : 'text-status-positive';
}

@Component({
  selector: 'app-front-desk-board',
  imports: [Button, Tag, Tooltip, LucideAngularModule, ReportLink],
  templateUrl: './front-desk-board.html',
})
export class FrontDeskBoard {
  private readonly locationService = inject(LocationService);

  protected readonly CalendarDays = CalendarDays;
  protected readonly CircleDot = CircleDot;
  protected readonly availabilityLabel = availabilityLabel;
  protected readonly availabilityTone = availabilityTone;
  protected readonly timeLabel = (iso: string) => timeLabel(new Date(iso));

  // Captured once per mount, matching the React app's useState(() => new Date()).
  private readonly now = new Date();

  protected readonly classes = computed(() => {
    const locationId = this.locationService.locationId();
    return CLASSES_TODAY.filter((c) => c.locationId === locationId).sort((a, b) => a.time.localeCompare(b.time));
  });

  protected readonly visibleClasses = computed(() => this.classes().slice(0, 8));

  protected readonly trainers = computed(() => {
    const locationId = this.locationService.locationId();
    const coaches = STAFF.filter((s) => s.role === 'coach' && s.locationId === locationId);
    return coaches.map((coach) => {
      const bookingTimes = [
        ...CLASSES_TODAY.filter((c) => c.locationId === locationId && c.instructorId === coach.id).map(
          (c) => new Date(c.time)
        ),
        ...SERVICES_TODAY.filter((s) => s.staffId === coach.id).map((s) => new Date(s.time)),
      ];
      return { coach, availability: computeAvailability(bookingTimes, this.now) };
    });
  });

  protected readonly resources = computed(() => {
    const locationId = this.locationService.locationId();
    return resourcesForLocation(locationId).map((resource) => {
      const bookingTimes = SERVICES_TODAY.filter((s) => s.resourceId === resource.id).map((s) => new Date(s.time));
      return { resource, availability: computeAvailability(bookingTimes, this.now) };
    });
  });

  protected spotsLeft(capacity: number, attendees: number): number {
    return capacity - attendees;
  }
}
