import { Component, computed, inject, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Award } from '@/icons';
import { MILESTONES } from '@/mock/milestones';
import { hasLoyaltyFeature } from '@/mock/locations';
import { LocationService } from '@/services/location.service';
import type { ScopeLevel } from '@/lib/scope';

@Component({
  selector: 'app-loyalty-milestones',
  imports: [LucideAngularModule],
  templateUrl: './loyalty-milestones.html',
})
export class LoyaltyMilestones {
  private readonly locationService = inject(LocationService);
  readonly scope = input.required<ScopeLevel>();

  protected readonly Award = Award;

  protected readonly enabled = computed(
    () => this.scope() === 'all' || hasLoyaltyFeature(this.locationService.locationId(), 'milestones')
  );

  protected readonly rows = computed(() => {
    const scope = this.scope();
    const locationId = this.locationService.locationId();
    const scoped = scope === 'all' ? MILESTONES : MILESTONES.filter((m) => m.locationId === locationId);
    return [...scoped].sort((a, b) => b.date.localeCompare(a.date));
  });

  protected readonly visible = computed(() => this.rows().slice(0, 6));
}
