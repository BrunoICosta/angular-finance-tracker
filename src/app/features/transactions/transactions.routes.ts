import { Routes } from '@angular/router';
import { providePtBrPaginator } from '../../shared/i18n/pt-br-paginator-intl';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [providePtBrPaginator()],
    title: 'Transações · Finanças',
    loadComponent: () =>
      import('./pages/transactions-page/transactions-page.component').then(
        (m) => m.TransactionsPageComponent,
      ),
  },
];
