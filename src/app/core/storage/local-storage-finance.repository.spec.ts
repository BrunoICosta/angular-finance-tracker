import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FINANCE_DATA_VERSION, FinanceData } from '../models';
import { FinanceDataCorruptedError } from './finance.repository';
import {
  FINANCE_STORAGE,
  FINANCE_STORAGE_KEY,
  LocalStorageFinanceRepository,
} from './local-storage-finance.repository';

/** Minimal in-memory `Storage` so the tests never touch the real localStorage. */
class MemoryStorage implements Storage {
  private readonly items = new Map<string, string>();
  get length(): number {
    return this.items.size;
  }
  clear(): void {
    this.items.clear();
  }
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

describe('LocalStorageFinanceRepository', () => {
  let storage: MemoryStorage;
  let repository: LocalStorageFinanceRepository;

  const data: FinanceData = {
    version: FINANCE_DATA_VERSION,
    transactions: [],
    categories: [{ id: 'c', name: 'Casa', type: 'expense', color: '#000', icon: 'home' }],
    budgets: [{ categoryId: 'c', limitCents: 1000 }],
  };

  beforeEach(() => {
    storage = new MemoryStorage();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        LocalStorageFinanceRepository,
        { provide: FINANCE_STORAGE, useValue: storage },
      ],
    });
    repository = TestBed.inject(LocalStorageFinanceRepository);
  });

  it('returns null when nothing was saved', async () => {
    expect(await repository.load()).toBeNull();
  });

  it('saves and loads the data', async () => {
    await repository.save(data);
    expect(storage.getItem(FINANCE_STORAGE_KEY)).toContain('"Casa"');
    expect(await repository.load()).toEqual(data);
  });

  it('clears the saved data', async () => {
    await repository.save(data);
    await repository.clear();
    expect(await repository.load()).toBeNull();
  });

  it('rejects invalid JSON and unexpected shapes', async () => {
    storage.setItem(FINANCE_STORAGE_KEY, '{oops');
    await expectAsync(repository.load()).toBeRejectedWithError(FinanceDataCorruptedError);

    storage.setItem(FINANCE_STORAGE_KEY, JSON.stringify({ version: 99, transactions: [] }));
    await expectAsync(repository.load()).toBeRejectedWithError(FinanceDataCorruptedError);
  });
});
