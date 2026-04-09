import { FinanceData } from '../models';

/**
 * Persistence boundary of the app. The store only talks to this abstraction, so the
 * localStorage implementation can be swapped for an HTTP API without touching the features.
 * The API is async on purpose: a remote backend would be.
 */
export abstract class FinanceRepository {
  /** Returns the saved data, or `null` when nothing was saved yet (first run). */
  abstract load(): Promise<FinanceData | null>;
  abstract save(data: FinanceData): Promise<void>;
  abstract clear(): Promise<void>;
}

export class FinanceDataCorruptedError extends Error {
  constructor(message = 'Os dados salvos estão corrompidos.') {
    super(message);
    this.name = 'FinanceDataCorruptedError';
  }
}
