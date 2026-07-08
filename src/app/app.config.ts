import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { LucideAngularModule } from 'lucide-angular';
import { ShcPreset } from '../theme/shc-preset';
import * as icons from './icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    importProvidersFrom(LucideAngularModule.pick({ ...icons })),
    providePrimeNG({
      theme: {
        preset: ShcPreset,
        // No dark mode in this app (matches the React app, which has no
        // dark-mode toggle) — `false` stops PrimeNG auto-switching on the
        // OS color-scheme media query.
        options: { darkModeSelector: false },
      },
    }),
  ]
};
