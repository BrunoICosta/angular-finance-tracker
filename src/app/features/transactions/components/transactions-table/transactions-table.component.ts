import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category, Transaction } from '../../../../core/models';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { IsoDatePipe } from '../../../../shared/pipes/iso-date.pipe';

const ALL_COLUMNS = ['date', 'description', 'category', 'amount', 'actions'] as const;
const COMPACT_COLUMNS = ['description', 'amount', 'actions'] as const;

@Component({
  selector: 'app-transactions-table',
  imports: [
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    BrlPipe,
    IsoDatePipe,
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

  readonly edit = output<Transaction>();
  readonly remove = output<Transaction>();

  protected readonly columns = computed<readonly string[]>(() =>
    this.compact() ? COMPACT_COLUMNS : ALL_COLUMNS,
  );
}
