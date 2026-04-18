import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CategoryTotal } from '../../../../core/domain/finance-calculations';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { formatBrl, fromCents } from '../../../../shared/utils/money';
import { CHART_FONT, injectChartPalette } from '../../data-access/chart-theme';

/** Doughnut of expenses by category, with an HTML legend that doubles as an accessible table. */
@Component({
  selector: 'app-expenses-chart',
  imports: [BaseChartDirective, BrlPipe, PercentPipe],
  template: `
    <div class="layout">
      <div class="chart">
        <canvas
          baseChart
          type="doughnut"
          role="img"
          [attr.aria-label]="ariaLabel()"
          [data]="data()"
          [options]="options()"
        ></canvas>
        <div class="chart__center" aria-hidden="true">
          <span class="chart__total tabular">{{ total() | brl }}</span>
          <span class="chart__caption">em despesas</span>
        </div>
      </div>
      <ul class="legend" role="list">
        @for (item of totals(); track item.category.id) {
          <li class="legend__item">
            <span class="legend__dot" [style.background]="item.category.color"></span>
            <span class="legend__name">{{ item.category.name }}</span>
            <span class="legend__share tabular">{{ item.share | percent: '1.0-0' }}</span>
            <span class="legend__value tabular">{{ item.totalCents | brl }}</span>
          </li>
        }
      </ul>
    </div>
  `,
  styleUrl: './expenses-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesChartComponent {
  readonly totals = input.required<readonly CategoryTotal[]>();

  private readonly palette = injectChartPalette();

  protected readonly total = computed(() =>
    this.totals().reduce((sum, item) => sum + item.totalCents, 0),
  );

  protected readonly ariaLabel = computed(
    () =>
      'Despesas por categoria: ' +
      this.totals()
        .map((item) => `${item.category.name} ${formatBrl(item.totalCents)}`)
        .join(', '),
  );

  protected readonly data = computed<ChartConfiguration<'doughnut'>['data']>(() => ({
    labels: this.totals().map((item) => item.category.name),
    datasets: [
      {
        data: this.totals().map((item) => fromCents(item.totalCents)),
        backgroundColor: this.totals().map((item) => item.category.color),
        borderColor: this.palette().surface,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }));

  protected readonly options = computed<ChartConfiguration<'doughnut'>['options']>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        bodyFont: CHART_FONT,
        callbacks: { label: (context) => ` ${formatBrl(Math.round(context.parsed * 100))}` },
      },
    },
  }));
}
