import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  budgetProgress,
  expensesByCategory,
  percentChange,
  summarize,
  transactionsInMonth,
} from '../../../../core/domain/finance-calculations';
import { FinanceStore } from '../../../../core/state/finance.store';
import { SelectedMonthStore } from '../../../../core/state/selected-month.store';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { MonthNavigatorComponent } from '../../../../shared/components/month-navigator/month-navigator.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { addMonths } from '../../../../shared/utils/month';
import { BudgetAlertsComponent } from '../../components/budget-alerts/budget-alerts.component';
import { ExpensesChartComponent } from '../../components/expenses-chart/expenses-chart.component';
import { RecentTransactionsComponent } from '../../components/recent-transactions/recent-transactions.component';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';

const RECENT_LIMIT = 6;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    MonthNavigatorComponent,
    SummaryCardComponent,
    EmptyStateComponent,
    RecentTransactionsComponent,
    BudgetAlertsComponent,
    ExpensesChartComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly store = inject(FinanceStore);
  private readonly months = inject(SelectedMonthStore);

  protected readonly monthTransactions = computed(() =>
    transactionsInMonth(this.store.transactions(), this.months.month()),
  );
  protected readonly summary = computed(() => summarize(this.monthTransactions()));
  private readonly previousSummary = computed(() =>
    summarize(transactionsInMonth(this.store.transactions(), addMonths(this.months.month(), -1))),
  );

  protected readonly incomeHint = computed(() =>
    describeChange(this.summary().incomeCents, this.previousSummary().incomeCents),
  );
  protected readonly expenseHint = computed(() =>
    describeChange(this.summary().expenseCents, this.previousSummary().expenseCents),
  );
  protected readonly balanceHint = computed(() => {
    const count = this.monthTransactions().length;
    return count === 1 ? '1 transação no mês' : `${count} transações no mês`;
  });

  protected readonly expensesByCategory = computed(() =>
    expensesByCategory(this.monthTransactions(), this.store.categoryById()),
  );

  /** Budgets over the limit or close to it in the selected month, worst first. */
  protected readonly alerts = computed(() =>
    budgetProgress(
      this.store.budgets(),
      this.monthTransactions(),
      this.store.categoryById(),
    ).filter((item) => item.status !== 'ok'),
  );
  protected readonly alertsSummary = computed(() => {
    const over = this.alerts().filter((item) => item.status === 'over').length;
    const warning = this.alerts().length - over;
    const parts: string[] = [];
    if (over) {
      parts.push(over === 1 ? '1 acima do limite' : `${over} acima do limite`);
    }
    if (warning) {
      parts.push(warning === 1 ? '1 perto do limite' : `${warning} perto do limite`);
    }
    return parts.join(' · ');
  });

  protected readonly recent = computed(() =>
    [...this.monthTransactions()]
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, RECENT_LIMIT),
  );
}

function describeChange(current: number, previous: number): string {
  const change = percentChange(current, previous);
  if (change === null) {
    return 'Sem dados no mês anterior';
  }
  const rounded = Math.round(change * 100);
  if (rounded === 0) {
    return 'Igual ao mês anterior';
  }
  return `${rounded > 0 ? '▲' : '▼'} ${Math.abs(rounded)}% vs. mês anterior`;
}
