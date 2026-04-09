import { FinanceData } from '../models';
import { FinanceRepository } from './finance.repository';

/** Volatile implementation, used by unit tests and handy for prototyping. */
export class InMemoryFinanceRepository extends FinanceRepository {
  constructor(private data: FinanceData | null = null) {
    super();
  }

  get snapshot(): FinanceData | null {
    return this.data;
  }

  async load(): Promise<FinanceData | null> {
    return this.data ? structuredClone(this.data) : null;
  }

  async save(data: FinanceData): Promise<void> {
    this.data = structuredClone(data);
  }

  async clear(): Promise<void> {
    this.data = null;
  }
}
