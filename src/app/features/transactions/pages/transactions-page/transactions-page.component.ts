import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { transactionsInMonth } from '../../../../core/domain/finance-calculations';
import { FinanceStore } from '../../../../core/state/finance.store';
import { SelectedMonthStore } from '../../../../core/state/selected-month.store';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { MonthNavigatorComponent } from '../../../../shared/components/month-navigator/month-navigator.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { HANDSET_QUERY, injectMediaQuery } from '../../../../shared/utils/responsive';
import { TransactionsTableComponent } from '../../components/transactions-table/transactions-table.component';
import { TransactionDialogService } from '../../data-access/transaction-dialog.service';

@Component({
  selector: 'app-transactions-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    MonthNavigatorComponent,
    EmptyStateComponent,
    TransactionsTableComponent,
  ],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsPageComponent {
  protected readonly store = inject(FinanceStore);
  protected readonly dialogs = inject(TransactionDialogService);
  private readonly months = inject(SelectedMonthStore);

  protected readonly isHandset = injectMediaQuery(HANDSET_QUERY);

  protected readonly rows = computed(() =>
    transactionsInMonth(this.store.transactions(), this.months.month()).sort((a, b) =>
      b.date.localeCompare(a.date),
    ),
  );
}
