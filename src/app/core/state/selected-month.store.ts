import { Injectable, computed, signal } from '@angular/core';
import { MonthKey, addMonths, currentMonthKey, monthStart } from '../utils/month';

/** The month the person is looking at, shared by the dashboard, transactions and budgets. */
@Injectable({ providedIn: 'root' })
export class SelectedMonthStore {
  private readonly _month = signal<MonthKey>(currentMonthKey());

  readonly month = this._month.asReadonly();
  readonly date = computed(() => monthStart(this._month()));
  readonly isCurrentMonth = computed(() => this._month() === currentMonthKey());

  select(month: MonthKey): void {
    this._month.set(month);
  }

  previous(): void {
    this._month.update((month) => addMonths(month, -1));
  }

  next(): void {
    this._month.update((month) => addMonths(month, 1));
  }

  goToCurrent(): void {
    this._month.set(currentMonthKey());
  }
}
