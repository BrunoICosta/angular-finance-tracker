import { Budget } from './budget.model';
import { Category } from './category.model';
import { Transaction } from './transaction.model';

export const FINANCE_DATA_VERSION = 1;

/** The whole persisted state of the app. */
export interface FinanceData {
  readonly version: typeof FINANCE_DATA_VERSION;
  readonly transactions: readonly Transaction[];
  readonly categories: readonly Category[];
  readonly budgets: readonly Budget[];
}

export function emptyFinanceData(categories: readonly Category[] = []): FinanceData {
  return { version: FINANCE_DATA_VERSION, transactions: [], categories, budgets: [] };
}
