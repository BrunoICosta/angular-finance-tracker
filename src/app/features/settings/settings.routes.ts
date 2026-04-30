import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.settings',
    providers: [provideTranslocoScope('settings')],
    loadComponent: () =>
      import('./pages/settings-page/settings-page.component').then((m) => m.SettingsPageComponent),
  },
];
