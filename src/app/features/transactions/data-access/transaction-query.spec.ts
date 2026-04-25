import { Category, Transaction } from '../../../core/models';
import {
  DEFAULT_FILTERS,
  filterTransactions,
  hasActiveFilters,
  normalizeText,
  paginate,
  sortTransactions,
} from './transaction-query';

const categories: Category[] = [
  { id: 'food', name: 'Alimentação', type: 'expense', color: '#f00', icon: 'x' },
  { id: 'salary', name: 'Salário', type: 'income', color: '#0f0', icon: 'x' },
];
const categoryById = new Map(categories.map((category) => [category.id, category]));

const make = (partial: Partial<Transaction> & Pick<Transaction, 'id'>): Transaction => ({
  description: 'Item',
  amountCents: 1000,
  date: '2026-04-10',
  type: 'expense',
  categoryId: 'food',
  createdAt: '2026-04-10T10:00:00.000Z',
  ...partial,
});

describe('transaction query', () => {
  const transactions = [
    make({ id: 'a', description: 'Padaria', amountCents: 1500, date: '2026-04-02' }),
    make({
      id: 'b',
      description: 'Mercado',
      amountCents: 25000,
      date: '2026-04-15',
      notes: 'feira',
    }),
    make({
      id: 'c',
      description: 'Salário',
      amountCents: 500000,
      date: '2026-04-05',
      type: 'income',
      categoryId: 'salary',
    }),
    make({ id: 'd', description: 'Açougue', amountCents: 9000, date: '2026-03-28' }),
  ];

  it('normalizes accents and case', () => {
    expect(normalizeText('  Alimentação ')).toBe('alimentacao');
  });

  it('keeps only the selected month by default', () => {
    const result = filterTransactions(transactions, DEFAULT_FILTERS, '2026-04', categoryById);
    expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('can search the whole history', () => {
    const filters = { ...DEFAULT_FILTERS, onlySelectedMonth: false };
    expect(filterTransactions(transactions, filters, '2026-04', categoryById).length).toBe(4);
  });

  it('filters by type and category', () => {
    const income = filterTransactions(
      transactions,
      { ...DEFAULT_FILTERS, type: 'income' },
      '2026-04',
      categoryById,
    );
    expect(income.map((item) => item.id)).toEqual(['c']);

    const food = filterTransactions(
      transactions,
      { ...DEFAULT_FILTERS, categoryId: 'food' },
      '2026-04',
      categoryById,
    );
    expect(food.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('searches description, notes and category name ignoring accents', () => {
    const search = (text: string): string[] =>
      filterTransactions(
        transactions,
        { ...DEFAULT_FILTERS, search: text, onlySelectedMonth: false },
        '2026-04',
        categoryById,
      ).map((item) => item.id);

    expect(search('acougue')).toEqual(['d']);
    expect(search('FEIRA')).toEqual(['b']);
    expect(search('alimentacao merc')).toEqual(['b']);
    expect(search('nada')).toEqual([]);
  });

  it('sorts by amount treating income as positive and expenses as negative', () => {
    const sorted = sortTransactions(
      transactions,
      { field: 'amount', direction: 'desc' },
      categoryById,
    );
    expect(sorted.map((item) => item.id)).toEqual(['c', 'a', 'd', 'b']);
  });

  it('sorts by date and description', () => {
    expect(
      sortTransactions(transactions, { field: 'date', direction: 'asc' }, categoryById).map(
        (item) => item.id,
      ),
    ).toEqual(['d', 'a', 'c', 'b']);
    expect(
      sortTransactions(transactions, { field: 'description', direction: 'asc' }, categoryById).map(
        (item) => item.description,
      ),
    ).toEqual(['Açougue', 'Mercado', 'Padaria', 'Salário']);
  });

  it('does not mutate the input when sorting', () => {
    const copy = [...transactions];
    sortTransactions(transactions, { field: 'amount', direction: 'asc' }, categoryById);
    expect(transactions).toEqual(copy);
  });

  it('paginates', () => {
    expect(paginate([1, 2, 3, 4, 5], 0, 2)).toEqual([1, 2]);
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([5]);
    expect(paginate([1, 2, 3], 5, 2)).toEqual([]);
  });

  it('detects active filters', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBeFalse();
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, onlySelectedMonth: false })).toBeFalse();
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'x' })).toBeTrue();
  });
});
