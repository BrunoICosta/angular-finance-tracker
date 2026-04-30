import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslocoPipe } from '@jsverse/transloco';
import { summarize } from '../../../../core/domain/finance-calculations';
import { FinanceStore } from '../../../../core/state/finance.store';
import { SelectedMonthStore } from '../../../../core/state/selected-month.store';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { MonthNavigatorComponent } from '../../../../shared/components/month-navigator/month-navigator.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { plural } from '../../../../shared/i18n/translated-text';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { HANDSET_QUERY, injectMediaQuery } from '../../../../shared/utils/responsive';
import { TransactionFiltersComponent } from '../../components/transaction-filters/transaction-filters.component';
import { TransactionsTableComponent } from '../../components/transactions-table/transactions-table.component';
import { TransactionDialogService } from '../../data-access/transaction-dialog.service';
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  TransactionFilters,
  TransactionSort,
  filterTransactions,
  hasActiveFilters,
  paginate,
  sortTransactions,
} from '../../data-access/transaction-query';

export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

@Component({
  selector: 'app-transactions-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    PageHeaderComponent,
    MonthNavigatorComponent,
    EmptyStateComponent,
    TransactionFiltersComponent,
    TransactionsTableComponent,
    BrlPipe,
    TranslocoPipe,
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
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected readonly filters = signal<TransactionFilters>(DEFAULT_FILTERS);
  protected readonly sort = signal<TransactionSort>(DEFAULT_SORT);
  protected readonly pageSize = signal<number>(PAGE_SIZE_OPTIONS[0]);
  /** Goes back to the first page whenever the result set changes shape. */
  protected readonly pageIndex = linkedSignal({
    source: () => ({
      filters: this.filters(),
      sort: this.sort(),
      month: this.months.month(),
      size: this.pageSize(),
    }),
    computation: () => 0,
  });

  protected readonly filtered = computed(() =>
    filterTransactions(
      this.store.transactions(),
      this.filters(),
      this.months.month(),
      this.store.categoryById(),
    ),
  );
  protected readonly sorted = computed(() =>
    sortTransactions(this.filtered(), this.sort(), this.store.categoryById()),
  );
  /**
   * The requested page clamped to the last existing one, so deleting the only row of the last
   * page (or importing/clearing data) never leaves the table on an empty page.
   */
  protected readonly currentPage = computed(() => {
    const lastPage = Math.max(0, Math.ceil(this.sorted().length / this.pageSize()) - 1);
    return Math.min(this.pageIndex(), lastPage);
  });
  protected readonly page = computed(() =>
    paginate(this.sorted(), this.currentPage(), this.pageSize()),
  );
  protected readonly totals = computed(() => summarize(this.filtered()));
  protected readonly resultsTitle = computed(() =>
    plural('transactions.results', this.filtered().length),
  );
  protected readonly isFiltering = computed(() => hasActiveFilters(this.filters()));

  protected onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }

  protected clearFilters(): void {
    this.filters.update((filters) => ({
      ...DEFAULT_FILTERS,
      onlySelectedMonth: filters.onlySelectedMonth,
    }));
  }
}
