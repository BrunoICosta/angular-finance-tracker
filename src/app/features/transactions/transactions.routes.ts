import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';
import { provideTranslatedPaginator } from '../../shared/i18n/translated-paginator-intl';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideTranslocoScope('transactions'), provideTranslatedPaginator()],
    title: 'titles.transactions',
    loadComponent: () =>
      import('./pages/transactions-page/transactions-page.component').then(
        (m) => m.TransactionsPageComponent,
      ),
  },
];
