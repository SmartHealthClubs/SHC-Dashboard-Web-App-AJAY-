import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { CalendarDays, CreditCard, LayoutDashboard, Settings, Users } from '@/icons';

type NavItem = {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
};

@Component({
  selector: 'app-side-nav',
  imports: [LucideAngularModule],
  templateUrl: './side-nav.html',
})
export class SideNav {
  protected readonly items: NavItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: CalendarDays, label: 'Calendar', active: false },
    { icon: Users, label: 'Members', active: false },
    { icon: CreditCard, label: 'Point of Sale', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];
}
