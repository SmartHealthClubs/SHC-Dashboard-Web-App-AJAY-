import { Component } from '@angular/core';
import { AppShell } from './shell/app-shell/app-shell';
import { Dashboard } from './dashboard/dashboard/dashboard';

@Component({
  selector: 'app-root',
  imports: [AppShell, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
