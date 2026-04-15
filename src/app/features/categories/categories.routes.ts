import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    title: 'Categorias · Finanças',
    loadComponent: () =>
      import('./pages/categories-page/categories-page.component').then(
        (m) => m.CategoriesPageComponent,
      ),
  },
];
