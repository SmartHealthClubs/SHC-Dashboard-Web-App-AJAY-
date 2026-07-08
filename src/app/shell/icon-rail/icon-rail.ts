import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Tooltip } from 'primeng/tooltip';
import { Avatar } from 'primeng/avatar';
import { Bell, Mail, HelpCircle } from '@/icons';

type IconRailItem = {
  icon: typeof Bell;
  label: string;
  dot: boolean;
};

@Component({
  selector: 'app-icon-rail',
  imports: [LucideAngularModule, Tooltip, Avatar],
  templateUrl: './icon-rail.html',
})
export class IconRail {
  protected readonly items: IconRailItem[] = [
    { icon: Bell, label: 'Notifications', dot: true },
    { icon: Mail, label: 'Messages', dot: false },
    { icon: HelpCircle, label: 'Help', dot: false },
  ];
}
