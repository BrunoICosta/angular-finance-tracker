import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { firstValueFrom } from 'rxjs';
import {
  averageMonthlyExpenses,
  budgetProgress,
  transactionsInMonth,
} from '../../../../core/domain/finance-calculations';
import { Category } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { FinanceStore } from '../../../../core/state/finance.store';
import { SelectedMonthStore } from '../../../../core/state/selected-month.store';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { MonthNavigatorComponent } from '../../../../shared/components/month-navigator/month-navigator.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import {
  BudgetDialogComponent,
  BudgetDialogData,
  BudgetDialogResult,
} from '../../components/budget-dialog/budget-dialog.component';
import { BudgetRowComponent } from '../../components/budget-row/budget-row.component';

const AVERAGE_WINDOW_MONTHS = 3;

@Component({
  selector: 'app-budgets-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PageHeaderComponent,
    MonthNavigatorComponent,
    EmptyStateComponent,
    CategoryIconComponent,
    BudgetRowComponent,
    BrlPipe,
  ],
  templateUrl: './budgets-page.component.html',
  styleUrl: './budgets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetsPageComponent {
  private readonly store = inject(FinanceStore);
  private readonly months = inject(SelectedMonthStore);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);

  private readonly monthTransactions = computed(() =>
    transactionsInMonth(this.store.transactions(), this.months.month()),
  );

  protected readonly progress = computed(() =>
    budgetProgress(this.store.budgets(), this.monthTransactions(), this.store.categoryById()),
  );

  protected readonly withoutBudget = computed(() => {
    const budgeted = this.store.budgetByCategory();
    return this.store.expenseCategories().filter((category) => !budgeted.has(category.id));
  });

  protected readonly totals = computed(() => {
    const items = this.progress();
    const limitCents = items.reduce((sum, item) => sum + item.limitCents, 0);
    const spentCents = items.reduce((sum, item) => sum + item.spentCents, 0);
    return {
      limitCents,
      spentCents,
      ratio: limitCents ? spentCents / limitCents : 0,
      overCount: items.filter((item) => item.status === 'over').length,
    };
  });

  protected readonly totalBarValue = computed(() => Math.min(100, this.totals().ratio * 100));

  private readonly averages = computed(() =>
    averageMonthlyExpenses(this.store.transactions(), this.months.month(), AVERAGE_WINDOW_MONTHS),
  );

  protected async editBudget(category: Category): Promise<void> {
    const ref = this.dialog.open<BudgetDialogComponent, BudgetDialogData, BudgetDialogResult>(
      BudgetDialogComponent,
      {
        data: {
          category,
          limitCents: this.store.budgetByCategory().get(category.id)?.limitCents,
          averageCents: this.averages().get(category.id),
        },
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
      },
    );
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) {
      return;
    }
    this.store.setBudget(category.id, result.limitCents);
    this.notifications.success(
      result.limitCents > 0
        ? `Orçamento de ${category.name} salvo.`
        : `Orçamento de ${category.name} removido.`,
    );
  }
}
