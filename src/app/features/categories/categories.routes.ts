import { Routes } from '@angular/router';
import { provideTranslocoScope } from '@jsverse/transloco';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    title: 'titles.categories',
    providers: [provideTranslocoScope('categories')],
    loadComponent: () =>
      import('./pages/categories-page/categories-page.component').then(
        (m) => m.CategoriesPageComponent,
      ),
  },
];
