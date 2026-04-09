import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent],
  template: `<app-page-header title="Visão geral" subtitle="Seu mês em um relance" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {}
