import { Routes } from '@angular/router';

export const BUDGETS_ROUTES: Routes = [
  {
    path: '',
    title: 'Orçamentos · Finanças',
    loadComponent: () =>
      import('./pages/budgets-page/budgets-page.component').then((m) => m.BudgetsPageComponent),
  },
];
