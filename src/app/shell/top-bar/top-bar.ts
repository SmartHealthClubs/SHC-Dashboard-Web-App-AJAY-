import { Component } from '@angular/core';
import { LocationSwitcher } from '../location-switcher/location-switcher';
import { RoleSwitcher } from '../role-switcher/role-switcher';
import { IconRail } from '../icon-rail/icon-rail';

@Component({
  selector: 'app-top-bar',
  imports: [LocationSwitcher, RoleSwitcher, IconRail],
  templateUrl: './top-bar.html',
})
export class TopBar {}
