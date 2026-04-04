import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  Budget,
  Category,
  CategoryDraft,
  FinanceData,
  Transaction,
  TransactionDraft,
  emptyFinanceData,
} from '../models';
import { FinanceRepository } from '../storage/finance-repository';
import { createId } from '../utils/id';

export type LoadStatus = 'loading' | 'ready' | 'error';

export class CategoryInUseError extends Error {
  constructor(readonly usage: number) {
    super(`A categoria está em uso por ${usage} transação(ões).`);
    this.name = 'CategoryInUseError';
  }
}

/**
 * Single source of truth for the finance data. State lives in a signal, everything else
 * is derived with `computed`, and an `effect` persists every change through the repository.
 */
@Injectable({ providedIn: 'root' })
export class FinanceStore {
  private readonly repository = inject(FinanceRepository);

  private readonly data = signal<FinanceData>(emptyFinanceData());
  private readonly _status = signal<LoadStatus>('loading');
  private readonly _loadError = signal<string | null>(null);
  private readonly _saveError = signal<string | null>(null);

  readonly status = this._status.asReadonly();
  readonly loadError = this._loadError.asReadonly();
  readonly saveError = this._saveError.asReadonly();

  readonly transactions = computed(() => this.data().transactions);
  readonly categories = computed(() => this.data().categories);
  readonly budgets = computed(() => this.data().budgets);

  readonly categoryById = computed(
    () => new Map(this.categories().map((category) => [category.id, category])),
  );
  readonly incomeCategories = computed(() =>
    this.categories().filter((category) => category.type === 'income'),
  );
  readonly expenseCategories = computed(() =>
    this.categories().filter((category) => category.type === 'expense'),
  );
  /** Number of transactions per category id. */
  readonly categoryUsage = computed(() => {
    const usage = new Map<string, number>();
    for (const transaction of this.transactions()) {
      usage.set(transaction.categoryId, (usage.get(transaction.categoryId) ?? 0) + 1);
    }
    return usage;
  });
  readonly budgetByCategory = computed(
    () => new Map(this.budgets().map((budget) => [budget.categoryId, budget])),
  );

  constructor() {
    effect(() => {
      const snapshot = this.data();
      if (this._status() === 'ready') {
        void this.persist(snapshot);
      }
    });
    void this.load();
  }

  async load(): Promise<void> {
    this._status.set('loading');
    this._loadError.set(null);
    try {
      const saved = await this.repository.load();
      this.data.set(saved ?? emptyFinanceData());
      this._status.set('ready');
    } catch (error) {
      this._loadError.set(error instanceof Error ? error.message : String(error));
      this._status.set('error');
    }
  }

  /** Drops whatever is saved (e.g. corrupted data) and starts again. */
  async reset(): Promise<void> {
    await this.repository.clear();
    await this.load();
  }

  // Transactions

  addTransaction(draft: TransactionDraft): Transaction {
    const transaction: Transaction = {
      ...draft,
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    this.patch({ transactions: [transaction, ...this.transactions()] });
    return transaction;
  }

  updateTransaction(id: string, draft: TransactionDraft): void {
    this.patch({
      transactions: this.transactions().map((transaction) =>
        transaction.id === id ? { ...transaction, ...draft } : transaction,
      ),
    });
  }

  removeTransaction(id: string): void {
    this.patch({
      transactions: this.transactions().filter((transaction) => transaction.id !== id),
    });
  }

  // Categories

  addCategory(draft: CategoryDraft): Category {
    const category: Category = { ...draft, id: createId() };
    this.patch({ categories: [...this.categories(), category] });
    return category;
  }

  updateCategory(id: string, draft: CategoryDraft): void {
    this.patch({
      categories: this.categories().map((category) =>
        category.id === id ? { ...category, ...draft } : category,
      ),
    });
  }

  /** Removes a category and its budget. Throws `CategoryInUseError` if transactions use it. */
  removeCategory(id: string): void {
    const usage = this.categoryUsage().get(id) ?? 0;
    if (usage > 0) {
      throw new CategoryInUseError(usage);
    }
    this.patch({
      categories: this.categories().filter((category) => category.id !== id),
      budgets: this.budgets().filter((budget) => budget.categoryId !== id),
    });
  }

  // Budgets

  /** Sets the monthly limit of a category; a limit of zero or less removes the budget. */
  setBudget(categoryId: string, limitCents: number): void {
    const others = this.budgets().filter((budget) => budget.categoryId !== categoryId);
    const budgets: Budget[] = limitCents > 0 ? [...others, { categoryId, limitCents }] : others;
    this.patch({ budgets });
  }

  private patch(changes: Partial<Omit<FinanceData, 'version'>>): void {
    this.data.update((data) => ({ ...data, ...changes }));
  }

  private async persist(snapshot: FinanceData): Promise<void> {
    try {
      await this.repository.save(snapshot);
      this._saveError.set(null);
    } catch (error) {
      this._saveError.set(
        error instanceof Error ? error.message : 'Não foi possível salvar os dados.',
      );
    }
  }
}
