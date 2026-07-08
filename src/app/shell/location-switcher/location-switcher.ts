import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { LucideAngularModule } from 'lucide-angular';
import { MapPin } from '@/icons';
import { LOCATIONS } from '@/mock/locations';
import { LocationService } from '@/services/location.service';

@Component({
  selector: 'app-location-switcher',
  imports: [FormsModule, Select, LucideAngularModule],
  templateUrl: './location-switcher.html',
})
export class LocationSwitcher {
  protected readonly locationService = inject(LocationService);
  protected readonly MapPin = MapPin;
  protected readonly locations = LOCATIONS;
  protected readonly current = computed(
    () => LOCATIONS.find((l) => l.id === this.locationService.locationId()) ?? LOCATIONS[0]
  );
}
