import { Component } from '@angular/core';
import { TopBar } from '../top-bar/top-bar';
import { SideNav } from '../side-nav/side-nav';

@Component({
  selector: 'app-shell',
  imports: [TopBar, SideNav],
  templateUrl: './app-shell.html',
})
export class AppShell {}
