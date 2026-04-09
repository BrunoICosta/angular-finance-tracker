import { Budget, Category, Transaction } from '../models';
import { MonthKey, lastMonths, monthKeyOf } from '../../shared/utils/month';

export interface MonthSummary {
  readonly incomeCents: number;
  readonly expenseCents: number;
  readonly balanceCents: number;
}

export interface CategoryTotal {
  readonly category: Category;
  readonly totalCents: number;
  /** Fraction (0..1) of the grand total. */
  readonly share: number;
}

export interface MonthlyTotals {
  readonly month: MonthKey;
  readonly incomeCents: number;
  readonly expenseCents: number;
}

export type BudgetStatus = 'ok' | 'warning' | 'over';

export interface BudgetProgress {
  readonly category: Category;
  readonly limitCents: number;
  readonly spentCents: number;
  readonly remainingCents: number;
  /** spent / limit, may be greater than 1. */
  readonly ratio: number;
  readonly status: BudgetStatus;
}

/** Ratio from which a budget is flagged as close to its limit. */
export const BUDGET_WARNING_RATIO = 0.8;

export function transactionsInMonth(
  transactions: readonly Transaction[],
  month: MonthKey,
): Transaction[] {
  return transactions.filter((transaction) => monthKeyOf(transaction.date) === month);
}

export function summarize(transactions: readonly Transaction[]): MonthSummary {
  let incomeCents = 0;
  let expenseCents = 0;
  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      incomeCents += transaction.amountCents;
    } else {
      expenseCents += transaction.amountCents;
    }
  }
  return { incomeCents, expenseCents, balanceCents: incomeCents - expenseCents };
}

/** Expense totals grouped by category, largest first. Unknown categories are ignored. */
export function expensesByCategory(
  transactions: readonly Transaction[],
  categoryById: ReadonlyMap<string, Category>,
): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.type !== 'expense') {
      continue;
    }
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amountCents,
    );
  }
  const grandTotal = [...totals.values()].reduce((sum, value) => sum + value, 0);
  const result: CategoryTotal[] = [];
  for (const [categoryId, totalCents] of totals) {
    const category = categoryById.get(categoryId);
    if (category) {
      result.push({ category, totalCents, share: grandTotal ? totalCents / grandTotal : 0 });
    }
  }
  return result.sort((a, b) => b.totalCents - a.totalCents);
}

/** Income and expense totals for the `count` months ending at `end`, oldest first. */
export function monthlyTotals(
  transactions: readonly Transaction[],
  end: MonthKey,
  count: number,
): MonthlyTotals[] {
  const months = lastMonths(end, count);
  const byMonth = new Map(months.map((month) => [month, { incomeCents: 0, expenseCents: 0 }]));
  for (const transaction of transactions) {
    const bucket = byMonth.get(monthKeyOf(transaction.date));
    if (!bucket) {
      continue;
    }
    if (transaction.type === 'income') {
      bucket.incomeCents += transaction.amountCents;
    } else {
      bucket.expenseCents += transaction.amountCents;
    }
  }
  return months.map((month) => ({ month, ...byMonth.get(month)! }));
}

export function budgetStatus(ratio: number): BudgetStatus {
  if (ratio > 1) {
    return 'over';
  }
  return ratio >= BUDGET_WARNING_RATIO ? 'warning' : 'ok';
}

/**
 * Progress of every budget against the given (already month-filtered) transactions,
 * most consumed first.
 */
export function budgetProgress(
  budgets: readonly Budget[],
  monthTransactions: readonly Transaction[],
  categoryById: ReadonlyMap<string, Category>,
): BudgetProgress[] {
  const spentByCategory = new Map<string, number>();
  for (const transaction of monthTransactions) {
    if (transaction.type === 'expense') {
      spentByCategory.set(
        transaction.categoryId,
        (spentByCategory.get(transaction.categoryId) ?? 0) + transaction.amountCents,
      );
    }
  }
  const result: BudgetProgress[] = [];
  for (const budget of budgets) {
    const category = categoryById.get(budget.categoryId);
    if (!category || budget.limitCents <= 0) {
      continue;
    }
    const spentCents = spentByCategory.get(budget.categoryId) ?? 0;
    const ratio = spentCents / budget.limitCents;
    result.push({
      category,
      limitCents: budget.limitCents,
      spentCents,
      remainingCents: budget.limitCents - spentCents,
      ratio,
      status: budgetStatus(ratio),
    });
  }
  return result.sort((a, b) => b.ratio - a.ratio);
}
