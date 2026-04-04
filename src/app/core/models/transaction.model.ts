export type TransactionType = 'income' | 'expense';

export const TRANSACTION_TYPE_LABELS: Readonly<Record<TransactionType, string>> = {
  income: 'Receita',
  expense: 'Despesa',
};

export interface Transaction {
  readonly id: string;
  readonly description: string;
  /** Always positive, stored in cents to avoid floating point drift. */
  readonly amountCents: number;
  /** Calendar date in ISO format (`YYYY-MM-DD`), no time zone. */
  readonly date: string;
  readonly type: TransactionType;
  readonly categoryId: string;
  readonly notes?: string;
  readonly createdAt: string;
}

export type TransactionDraft = Omit<Transaction, 'id' | 'createdAt'>;
