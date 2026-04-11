import { Category, Transaction, TransactionType } from '../../../core/models';
import { MonthKey, monthKeyOf } from '../../../shared/utils/month';

export type TypeFilter = 'all' | TransactionType;

export interface TransactionFilters {
  readonly type: TypeFilter;
  /** Category id, or `'all'`. */
  readonly categoryId: string;
  readonly search: string;
  /** Restrict to the selected month, or show the whole history. */
  readonly onlySelectedMonth: boolean;
}

export const DEFAULT_FILTERS: TransactionFilters = {
  type: 'all',
  categoryId: 'all',
  search: '',
  onlySelectedMonth: true,
};

export type SortField = 'date' | 'description' | 'category' | 'amount';
export type SortDirection = 'asc' | 'desc';

export interface TransactionSort {
  readonly field: SortField;
  readonly direction: SortDirection;
}

export const DEFAULT_SORT: TransactionSort = { field: 'date', direction: 'desc' };

/** Lowercases and strips accents, so "alimentacao" finds "Alimentação". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.type !== DEFAULT_FILTERS.type ||
    filters.categoryId !== DEFAULT_FILTERS.categoryId ||
    filters.search.trim() !== ''
  );
}

export function filterTransactions(
  transactions: readonly Transaction[],
  filters: TransactionFilters,
  month: MonthKey,
  categoryById: ReadonlyMap<string, Category>,
): Transaction[] {
  const terms = normalizeText(filters.search).split(/\s+/).filter(Boolean);
  return transactions.filter((transaction) => {
    if (filters.onlySelectedMonth && monthKeyOf(transaction.date) !== month) {
      return false;
    }
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }
    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) {
      return false;
    }
    if (terms.length) {
      const haystack = normalizeText(
        [
          transaction.description,
          transaction.notes ?? '',
          categoryById.get(transaction.categoryId)?.name ?? '',
        ].join(' '),
      );
      return terms.every((term) => haystack.includes(term));
    }
    return true;
  });
}

/** Returns a sorted copy. Ties fall back to the newest date first, then creation time. */
export function sortTransactions(
  transactions: readonly Transaction[],
  sort: TransactionSort,
  categoryById: ReadonlyMap<string, Category>,
): Transaction[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });
  const compare = (a: Transaction, b: Transaction): number => {
    switch (sort.field) {
      case 'amount':
        return signedAmount(a) - signedAmount(b);
      case 'description':
        return collator.compare(a.description, b.description);
      case 'category':
        return collator.compare(
          categoryById.get(a.categoryId)?.name ?? '',
          categoryById.get(b.categoryId)?.name ?? '',
        );
      case 'date':
        return a.date.localeCompare(b.date);
    }
  };
  return [...transactions].sort(
    (a, b) =>
      factor * compare(a, b) ||
      b.date.localeCompare(a.date) ||
      b.createdAt.localeCompare(a.createdAt),
  );
}

export function paginate<T>(items: readonly T[], pageIndex: number, pageSize: number): T[] {
  const start = pageIndex * pageSize;
  return items.slice(start, start + pageSize);
}

function signedAmount(transaction: Transaction): number {
  return transaction.type === 'income' ? transaction.amountCents : -transaction.amountCents;
}
