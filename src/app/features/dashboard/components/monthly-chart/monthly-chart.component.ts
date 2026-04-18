import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { MonthlyTotals } from '../../../../core/domain/finance-calculations';
import { formatBrl, fromCents } from '../../../../shared/utils/money';
import { monthStart } from '../../../../shared/utils/month';
import { CHART_FONT, injectChartPalette } from '../../data-access/chart-theme';

const COMPACT_BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** Grouped bars comparing income and expenses month by month. */
@Component({
  selector: 'app-monthly-chart',
  imports: [BaseChartDirective],
  template: `
    <div class="chart">
      <canvas
        baseChart
        type="bar"
        role="img"
        [attr.aria-label]="ariaLabel()"
        [data]="data()"
        [options]="options()"
      ></canvas>
    </div>
  `,
  styles: `
    .chart {
      position: relative;
      height: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyChartComponent {
  readonly months = input.required<readonly MonthlyTotals[]>();

  private readonly locale = inject(LOCALE_ID);
  private readonly palette = injectChartPalette();

  private readonly labels = computed(() =>
    this.months().map((item) =>
      formatDate(monthStart(item.month), 'MMM/yy', this.locale).replace('.', ''),
    ),
  );

  protected readonly ariaLabel = computed(
    () =>
      'Receitas e despesas por mês: ' +
      this.months()
        .map(
          (item, index) =>
            `${this.labels()[index]}: receitas ${formatBrl(item.incomeCents)}, despesas ${formatBrl(item.expenseCents)}`,
        )
        .join('; '),
  );

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => {
    const palette = this.palette();
    return {
      labels: this.labels(),
      datasets: [
        {
          label: 'Receitas',
          data: this.months().map((item) => fromCents(item.incomeCents)),
          backgroundColor: palette.income,
          borderRadius: 6,
          maxBarThickness: 28,
        },
        {
          label: 'Despesas',
          data: this.months().map((item) => fromCents(item.expenseCents)),
          backgroundColor: palette.expense,
          borderRadius: 6,
          maxBarThickness: 28,
        },
      ],
    };
  });

  protected readonly options = computed<ChartConfiguration<'bar'>['options']>(() => {
    const palette = this.palette();
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          grid: { display: false },
          border: { color: palette.grid },
          ticks: { color: palette.mutedText, font: CHART_FONT },
        },
        y: {
          beginAtZero: true,
          grid: { color: palette.grid },
          border: { display: false },
          ticks: {
            color: palette.mutedText,
            font: CHART_FONT,
            maxTicksLimit: 6,
            callback: (value) => COMPACT_BRL.format(Number(value)),
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: palette.text,
            font: CHART_FONT,
            usePointStyle: true,
            pointStyle: 'rectRounded',
          },
        },
        tooltip: {
          bodyFont: CHART_FONT,
          callbacks: {
            label: (context) =>
              ` ${context.dataset.label}: ${formatBrl(Math.round((context.parsed.y ?? 0) * 100))}`,
          },
        },
      },
    };
  });
}
