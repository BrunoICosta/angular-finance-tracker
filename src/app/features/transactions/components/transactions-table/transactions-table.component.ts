import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category, Transaction } from '../../../../core/models';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';
import { SortField, TransactionSort } from '../../data-access/transaction-query';

const ALL_COLUMNS = ['date', 'description', 'category', 'amount', 'actions'] as const;
const COMPACT_COLUMNS = ['description', 'amount', 'actions'] as const;

@Component({
  selector: 'app-transactions-table',
  imports: [
    LocalDatePipe,
    TranslocoPipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSortModule,
    MatTooltipModule,
    BrlPipe,
    CategoryIconComponent,
  ],
  templateUrl: './transactions-table.component.html',
  styleUrl: './transactions-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsTableComponent {
  readonly transactions = input.required<readonly Transaction[]>();
  readonly categoryById = input.required<ReadonlyMap<string, Category>>();
  /** Hides secondary columns on narrow screens. */
  readonly compact = input(false);
  readonly sort = input.required<TransactionSort>();

  readonly edit = output<Transaction>();
  readonly remove = output<Transaction>();
  readonly sortChange = output<TransactionSort>();

  protected readonly columns = computed<readonly string[]>(() =>
    this.compact() ? COMPACT_COLUMNS : ALL_COLUMNS,
  );

  protected onSortChange(sort: Sort): void {
    this.sortChange.emit({
      field: sort.active as SortField,
      direction: sort.direction === 'asc' ? 'asc' : 'desc',
    });
  }
}
