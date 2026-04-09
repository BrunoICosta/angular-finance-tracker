import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

/** The shell is the only eager piece; every feature is a lazy chunk. */
export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
