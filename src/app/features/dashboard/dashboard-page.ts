import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeader } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeader],
  template: `<app-page-header title="Visão geral" subtitle="Seu mês em um relance" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {}
