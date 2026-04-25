import { Budget, Category, Transaction, TransactionType } from '../models';
import {
  averageMonthlyExpenses,
  budgetProgress,
  budgetStatus,
  expensesByCategory,
  monthlyTotals,
  percentChange,
  summarize,
  transactionsInMonth,
} from './finance-calculations';

const food: Category = {
  id: 'food',
  name: 'Alimentação',
  type: 'expense',
  color: '#f00',
  icon: 'x',
};
const fun: Category = { id: 'fun', name: 'Lazer', type: 'expense', color: '#0f0', icon: 'x' };
const salary: Category = {
  id: 'salary',
  name: 'Salário',
  type: 'income',
  color: '#00f',
  icon: 'x',
};
const categoryById = new Map([food, fun, salary].map((category) => [category.id, category]));

let sequence = 0;
function tx(
  date: string,
  type: TransactionType,
  categoryId: string,
  amountCents: number,
): Transaction {
  sequence++;
  return {
    id: `t${sequence}`,
    description: `t${sequence}`,
    amountCents,
    date,
    type,
    categoryId,
    createdAt: `${date}T10:00:00.000Z`,
  };
}

describe('finance calculations', () => {
  const transactions = [
    tx('2026-03-05', 'income', 'salary', 500_000),
    tx('2026-03-10', 'expense', 'food', 40_000),
    tx('2026-04-05', 'income', 'salary', 500_000),
    tx('2026-04-08', 'expense', 'food', 30_000),
    tx('2026-04-09', 'expense', 'food', 20_000),
    tx('2026-04-20', 'expense', 'fun', 50_000),
  ];

  it('filters transactions by month', () => {
    expect(transactionsInMonth(transactions, '2026-04').length).toBe(4);
    expect(transactionsInMonth(transactions, '2026-01').length).toBe(0);
  });

  it('summarizes income, expenses and balance', () => {
    expect(summarize(transactionsInMonth(transactions, '2026-04'))).toEqual({
      incomeCents: 500_000,
      expenseCents: 100_000,
      balanceCents: 400_000,
    });
    expect(summarize([])).toEqual({ incomeCents: 0, expenseCents: 0, balanceCents: 0 });
  });

  it('groups expenses by category, largest first, with shares', () => {
    const totals = expensesByCategory(transactionsInMonth(transactions, '2026-04'), categoryById);
    expect(totals.map((item) => [item.category.id, item.totalCents, item.share])).toEqual([
      ['food', 50_000, 0.5],
      ['fun', 50_000, 0.5],
    ]);
  });

  it('ignores expenses whose category no longer exists', () => {
    const totals = expensesByCategory([tx('2026-04-01', 'expense', 'gone', 100)], categoryById);
    expect(totals).toEqual([]);
  });

  it('builds monthly totals including empty months', () => {
    const series = monthlyTotals(transactions, '2026-04', 3);
    expect(series).toEqual([
      { month: '2026-02', incomeCents: 0, expenseCents: 0 },
      { month: '2026-03', incomeCents: 500_000, expenseCents: 40_000 },
      { month: '2026-04', incomeCents: 500_000, expenseCents: 100_000 },
    ]);
  });

  it('classifies budget status by ratio', () => {
    expect(budgetStatus(0.5)).toBe('ok');
    expect(budgetStatus(0.8)).toBe('warning');
    expect(budgetStatus(1)).toBe('warning');
    expect(budgetStatus(1.01)).toBe('over');
  });

  it('computes budget progress sorted by consumption', () => {
    const budgets: Budget[] = [
      { categoryId: 'food', limitCents: 100_000 },
      { categoryId: 'fun', limitCents: 40_000 },
      { categoryId: 'gone', limitCents: 1_000 },
    ];
    const progress = budgetProgress(
      budgets,
      transactionsInMonth(transactions, '2026-04'),
      categoryById,
    );
    expect(progress.map((item) => [item.category.id, item.status, item.remainingCents])).toEqual([
      ['fun', 'over', -10_000],
      ['food', 'ok', 50_000],
    ]);
    expect(progress[0].ratio).toBeCloseTo(1.25);
  });

  it('computes the percent change against the previous value', () => {
    expect(percentChange(110, 100)).toBeCloseTo(0.1);
    expect(percentChange(50, 100)).toBeCloseTo(-0.5);
    expect(percentChange(10, 0)).toBeNull();
  });

  it('averages monthly expenses of previous months only', () => {
    const averages = averageMonthlyExpenses(transactions, '2026-05', 2);
    // March 40.000 + April 50.000 of food over 2 months; fun only in April.
    expect(averages.get('food')).toBe(45_000);
    expect(averages.get('fun')).toBe(25_000);
    expect(averages.has('salary')).toBeFalse();
  });
});
