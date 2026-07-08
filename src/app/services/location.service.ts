import { Injectable, signal } from '@angular/core';
import { LOCATIONS } from '@/mock/locations';

/** Angular-service equivalent of the React app's LocationProvider/useCurrentLocation context. */
@Injectable({ providedIn: 'root' })
export class LocationService {
  readonly locationId = signal<string>(LOCATIONS[0].id);

  setLocationId(id: string): void {
    this.locationId.set(id);
  }
}
