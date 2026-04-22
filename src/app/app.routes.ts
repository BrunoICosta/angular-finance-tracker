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
      {
        path: 'transacoes',
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
      },
      {
        path: 'orcamentos',
        loadChildren: () =>
          import('./features/budgets/budgets.routes').then((m) => m.BUDGETS_ROUTES),
      },
      {
        path: 'configuracoes',
        loadChildren: () =>
          import('./features/settings/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
