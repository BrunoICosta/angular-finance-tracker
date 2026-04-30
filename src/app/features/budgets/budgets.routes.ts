import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.budgets',
    providers: [provideTranslocoScope('budgets')],
    loadComponent: () =>
      import('./pages/budgets-page/budgets-page.component').then((m) => m.BudgetsPageComponent),
  },
];
