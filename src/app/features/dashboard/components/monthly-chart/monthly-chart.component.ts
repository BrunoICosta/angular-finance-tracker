import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { formatDate } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { translateSignal } from '@jsverse/transloco';
import { LanguageService } from '../../../../core/i18n/language.service';
import { MonthlyTotals } from '../../../../core/domain/finance-calculations';
import { formatBrl, fromCents } from '../../../../shared/utils/money';
import { monthStart } from '../../../../shared/utils/month';
import { CHART_FONT, injectChartPalette } from '../../data-access/chart-theme';

/** Axis labels like `R$ 8 mil` / `R$8K`. */
function compactBrl(locale: string): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}

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

  private readonly locale = inject(LanguageService).locale;
  private readonly incomeLabel = translateSignal('summary.income', {}, 'dashboard');
  private readonly expenseLabel = translateSignal('summary.expenses', {}, 'dashboard');
  private readonly palette = injectChartPalette();

  private readonly labels = computed(() =>
    this.months().map((item) =>
      formatDate(monthStart(item.month), 'MMM/yy', this.locale()).replace('.', ''),
    ),
  );

  protected readonly ariaLabel = translateSignal(
    'monthly.aria',
    computed(() => ({
      items: this.months()
        .map(
          (item, index) =>
            `${this.labels()[index]}: ${this.incomeLabel()} ${formatBrl(item.incomeCents, this.locale())}, ${this.expenseLabel()} ${formatBrl(item.expenseCents, this.locale())}`,
        )
        .join('; '),
    })),
    'dashboard',
  );

  protected readonly data = computed<ChartConfiguration<'bar'>['data']>(() => {
    const palette = this.palette();
    return {
      labels: this.labels(),
      datasets: [
        {
          label: this.incomeLabel(),
          data: this.months().map((item) => fromCents(item.incomeCents)),
          backgroundColor: palette.income,
          borderRadius: 6,
          maxBarThickness: 28,
        },
        {
          label: this.expenseLabel(),
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
    const locale = this.locale();
    const axisFormat = compactBrl(locale);
    return {
      locale,
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
            callback: (value) => axisFormat.format(Number(value)),
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
              ` ${context.dataset.label}: ${formatBrl(Math.round((context.parsed.y ?? 0) * 100), locale)}`,
          },
        },
      },
    };
  });
}
