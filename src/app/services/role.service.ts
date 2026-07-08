import { Injectable, signal } from '@angular/core';
import type { RoleId } from '@/lib/roles';

/**
 * Angular-service equivalent of the React app's RoleProvider/useRoles
 * context. A signal instead of useState — the demo role-switcher (dev
 * affordance, not part of the product) reads/writes this directly.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  readonly activeRoles = signal<RoleId[]>(['admin']);

  hasRole(role: RoleId): boolean {
    return this.activeRoles().includes(role);
  }

  toggleRole(role: RoleId): void {
    this.activeRoles.update((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }
}
