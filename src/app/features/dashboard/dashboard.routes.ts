import { Routes } from '@angular/router';
import { ArcElement, DoughnutController, Legend, Tooltip } from 'chart.js';
import { provideCharts } from 'ng2-charts';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'Visão geral · Finanças',
    // Chart.js is registered here so it ships with the dashboard chunk, not the main bundle.
    providers: [
      provideCharts({ registerables: [DoughnutController, ArcElement, Tooltip, Legend] }),
    ],
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
];
