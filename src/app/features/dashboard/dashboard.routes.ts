import { Routes } from '@angular/router';
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { provideCharts } from 'ng2-charts';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    title: 'Visão geral · Finanças',
    // Chart.js is registered here so it ships with the dashboard chunk, not the main bundle.
    providers: [
      provideCharts({
        registerables: [
          DoughnutController,
          ArcElement,
          BarController,
          BarElement,
          CategoryScale,
          LinearScale,
          Tooltip,
          Legend,
        ],
      }),
    ],
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page.component').then(
        (m) => m.DashboardPageComponent,
      ),
  },
];
