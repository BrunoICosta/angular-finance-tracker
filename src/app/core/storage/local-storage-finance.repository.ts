import { Injectable, InjectionToken, inject } from '@angular/core';
import { FINANCE_DATA_VERSION, FinanceData } from '../models';
import { FinanceDataCorruptedError, FinanceRepository } from './finance.repository';

export const FINANCE_STORAGE_KEY = 'finance-tracker:data';

/** The Web Storage used by the repository; overridable in tests. */
export const FINANCE_STORAGE = new InjectionToken<Storage>('FINANCE_STORAGE', {
  providedIn: 'root',
  factory: () => localStorage,
});

@Injectable()
export class LocalStorageFinanceRepository extends FinanceRepository {
  private readonly storage = inject(FINANCE_STORAGE);

  async load(): Promise<FinanceData | null> {
    const raw = this.storage.getItem(FINANCE_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new FinanceDataCorruptedError();
    }
    if (!isFinanceData(parsed)) {
      throw new FinanceDataCorruptedError();
    }
    return parsed;
  }

  async save(data: FinanceData): Promise<void> {
    this.storage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    this.storage.removeItem(FINANCE_STORAGE_KEY);
  }
}

function isFinanceData(value: unknown): value is FinanceData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const data = value as Record<string, unknown>;
  return (
    data['version'] === FINANCE_DATA_VERSION &&
    Array.isArray(data['transactions']) &&
    Array.isArray(data['categories']) &&
    Array.isArray(data['budgets'])
  );
}
