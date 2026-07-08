import { Component, computed, inject } from '@angular/core';
import { RoleService } from '../../services/role.service';
import { resolveDashboard } from '@/lib/dashboard';
import { ZoneSection } from '../zone-section/zone-section';

@Component({
  selector: 'app-dashboard',
  imports: [ZoneSection],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly roleService = inject(RoleService);
  protected readonly resolvedZones = computed(() => resolveDashboard(this.roleService.activeRoles()));
}
