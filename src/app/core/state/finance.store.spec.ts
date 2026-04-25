import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_CATEGORIES } from '../data/default-categories';
import { FINANCE_DATA_VERSION, FinanceData, TransactionDraft } from '../models';
import { FinanceRepository } from '../storage/finance.repository';
import { InMemoryFinanceRepository } from '../storage/in-memory-finance.repository';
import { CategoryInUseError, FinanceStore } from './finance.store';

const draft: TransactionDraft = {
  description: 'Mercado',
  amountCents: 12_345,
  date: '2026-04-10',
  type: 'expense',
  categoryId: 'cat-food',
};

const savedData: FinanceData = {
  version: FINANCE_DATA_VERSION,
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budgets: [],
};

async function setup(repository = new InMemoryFinanceRepository(savedData)) {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      { provide: FinanceRepository, useValue: repository },
    ],
  });
  const store = TestBed.inject(FinanceStore);
  await store.load();
  return { store, repository };
}

/** Runs pending effects (persistence) and lets the async save settle. */
async function flush(): Promise<void> {
  TestBed.tick();
  await Promise.resolve();
}

describe('FinanceStore', () => {
  it('seeds demo data on first run', async () => {
    const { store } = await setup(new InMemoryFinanceRepository(null));
    expect(store.status()).toBe('ready');
    expect(store.transactions().length).toBeGreaterThan(50);
    expect(store.budgets().length).toBeGreaterThan(0);
  });

  it('loads previously saved data instead of seeding', async () => {
    const { store } = await setup();
    expect(store.transactions()).toEqual([]);
    expect(store.categories().length).toBe(DEFAULT_CATEGORIES.length);
  });

  it('exposes an error state when loading fails', async () => {
    const repository = new InMemoryFinanceRepository();
    spyOn(repository, 'load').and.rejectWith(new Error('quebrado'));
    const { store } = await setup(repository);
    expect(store.status()).toBe('error');
    expect(store.loadError()).toBe('quebrado');
  });

  it('adds, updates and removes transactions and persists them', async () => {
    const { store, repository } = await setup();

    const created = store.addTransaction(draft);
    expect(created.id).toBeTruthy();
    expect(store.transactions()).toEqual([created]);

    store.updateTransaction(created.id, { ...draft, amountCents: 999 });
    expect(store.transactions()[0].amountCents).toBe(999);
    expect(store.transactions()[0].createdAt).toBe(created.createdAt);

    await flush();
    expect(repository.snapshot?.transactions.length).toBe(1);

    store.removeTransaction(created.id);
    expect(store.transactions()).toEqual([]);
    store.restoreTransaction(created);
    expect(store.transactions().length).toBe(1);
  });

  it('derives category maps and usage', async () => {
    const { store } = await setup();
    store.addTransaction(draft);
    store.addTransaction(draft);
    expect(store.categoryById().get('cat-food')?.name).toBe('Alimentação');
    expect(store.categoryUsage().get('cat-food')).toBe(2);
    expect(store.incomeCategories().every((category) => category.type === 'income')).toBeTrue();
  });

  it('refuses to remove a category in use and removes its budget otherwise', async () => {
    const { store } = await setup();
    store.addTransaction(draft);
    expect(() => store.removeCategory('cat-food')).toThrowError(CategoryInUseError);

    store.setBudget('cat-leisure', 40_000);
    store.removeCategory('cat-leisure');
    expect(store.categoryById().has('cat-leisure')).toBeFalse();
    expect(store.budgetByCategory().has('cat-leisure')).toBeFalse();
  });

  it('sets, replaces and clears budgets', async () => {
    const { store } = await setup();
    store.setBudget('cat-food', 100_000);
    store.setBudget('cat-food', 150_000);
    expect(store.budgets()).toEqual([{ categoryId: 'cat-food', limitCents: 150_000 }]);
    store.setBudget('cat-food', 0);
    expect(store.budgets()).toEqual([]);
  });

  it('imports transactions together with new categories', async () => {
    const { store } = await setup();
    const pets = {
      id: 'pets',
      name: 'Pets',
      type: 'expense' as const,
      color: '#000',
      icon: 'pets',
    };
    const count = store.importTransactions([{ ...draft, categoryId: 'pets' }], [pets]);
    expect(count).toBe(1);
    expect(store.categoryById().get('pets')).toEqual(pets);
    expect(store.transactions()[0].categoryId).toBe('pets');
  });

  it('clears everything but keeps the default categories, and can restore the demo', async () => {
    const { store, repository } = await setup();
    store.addTransaction(draft);
    store.setBudget('cat-food', 100);

    store.clearAll();
    expect(store.transactions()).toEqual([]);
    expect(store.budgets()).toEqual([]);
    expect(store.categories().length).toBe(DEFAULT_CATEGORIES.length);
    await flush();
    // Saved as empty data (not removed), so the next visit does not seed the demo again.
    expect(repository.snapshot?.transactions).toEqual([]);

    store.restoreDemo();
    expect(store.transactions().length).toBeGreaterThan(50);
  });
});
