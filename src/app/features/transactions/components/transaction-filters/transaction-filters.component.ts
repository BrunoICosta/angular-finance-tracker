import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Category } from '../../../../core/models';
import {
  DEFAULT_FILTERS,
  TransactionFilters,
  TypeFilter,
  hasActiveFilters,
} from '../../data-access/transaction-query';

@Component({
  selector: 'app-transaction-filters',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './transaction-filters.component.html',
  styleUrl: './transaction-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFiltersComponent {
  readonly filters = model.required<TransactionFilters>();
  readonly categories = input.required<readonly Category[]>();

  protected readonly visibleCategories = computed(() => {
    const type = this.filters().type;
    return type === 'all'
      ? this.categories()
      : this.categories().filter((category) => category.type === type);
  });
  protected readonly canClear = computed(() => hasActiveFilters(this.filters()));

  protected setSearch(search: string): void {
    this.filters.update((filters) => ({ ...filters, search }));
  }

  protected setType(type: TypeFilter): void {
    this.filters.update((filters) => {
      const category = this.categories().find((item) => item.id === filters.categoryId);
      const keepCategory = type === 'all' || !category || category.type === type;
      return { ...filters, type, categoryId: keepCategory ? filters.categoryId : 'all' };
    });
  }

  protected setCategory(categoryId: string): void {
    this.filters.update((filters) => ({ ...filters, categoryId }));
  }

  protected setOnlySelectedMonth(onlySelectedMonth: boolean): void {
    this.filters.update((filters) => ({ ...filters, onlySelectedMonth }));
  }

  protected clear(): void {
    this.filters.update((filters) => ({
      ...DEFAULT_FILTERS,
      onlySelectedMonth: filters.onlySelectedMonth,
    }));
  }
}
