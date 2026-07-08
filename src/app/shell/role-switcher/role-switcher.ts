import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { Checkbox } from 'primeng/checkbox';
import { LucideAngularModule } from 'lucide-angular';
import { ChevronDown, FlaskConical } from '@/icons';
import { ROLES, ROLE_LABELS, type RoleId } from '@/lib/roles';
import { RoleService } from '@/services/role.service';

@Component({
  selector: 'app-role-switcher',
  imports: [FormsModule, Popover, Checkbox, LucideAngularModule],
  templateUrl: './role-switcher.html',
})
export class RoleSwitcher {
  protected readonly roleService = inject(RoleService);
  protected readonly ChevronDown = ChevronDown;
  protected readonly FlaskConical = FlaskConical;
  protected readonly roles = ROLES;

  protected readonly summary = computed(() => {
    const active = this.roleService.activeRoles();
    return active.length === 0 ? 'No roles selected' : active.map((r) => ROLE_LABELS[r]).join(', ');
  });

  protected isChecked(role: RoleId): boolean {
    return this.roleService.hasRole(role);
  }
}
