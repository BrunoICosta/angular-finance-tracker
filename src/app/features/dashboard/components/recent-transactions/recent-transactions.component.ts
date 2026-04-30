import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Transaction } from '../../../../core/models';
import { FinanceStore } from '../../../../core/state/finance.store';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';

@Component({
  selector: 'app-recent-transactions',
  imports: [LocalDatePipe, BrlPipe, CategoryIconComponent, TranslocoPipe],
  template: `
    <ul class="recent" role="list">
      @for (transaction of transactions(); track transaction.id) {
        @let category = store.categoryById().get(transaction.categoryId);
        <li class="recent__item">
          <app-category-icon
            [icon]="category?.icon ?? 'help'"
            [color]="category?.color ?? '#7b8794'"
          />
          <div class="recent__text">
            <span class="recent__description">{{ transaction.description }}</span>
            <span class="recent__meta"
              >{{ category?.name ?? ('common.noCategory' | transloco) }} ·
              {{ transaction.date | localDate: 'd MMM' }}</span
            >
          </div>
          <span
            class="recent__amount tabular"
            [class.text-income]="transaction.type === 'income'"
            [class.text-expense]="transaction.type === 'expense'"
          >
            {{ transaction.type === 'income' ? '+' : '−' }}
            {{ transaction.amountCents | brl }}
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    .recent {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .recent__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
    }
    .recent__item + .recent__item {
      border-top: 1px solid var(--app-border);
    }
    .recent__text {
      display: flex;
      flex: 1;
      min-width: 0;
      flex-direction: column;
    }
    .recent__description {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
    }
    .recent__meta {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
    .recent__amount {
      font-weight: 600;
      white-space: nowrap;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTransactionsComponent {
  protected readonly store = inject(FinanceStore);
  readonly transactions = input.required<readonly Transaction[]>();
}
