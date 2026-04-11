import { Injectable, Provider } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';

/**
 * `NativeDateAdapter` relies on `Date.parse`, which reads `03/04/2026` as March 4th.
 * This adapter understands the Brazilian `dd/MM/yyyy` format typed in the input.
 */
@Injectable()
export class BrDateAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value === 'string') {
      const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\s*$/.exec(value);
      if (match) {
        const day = Number(match[1]);
        const month = Number(match[2]) - 1;
        const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
        const date = new Date(year, month, day);
        const isRealDate =
          date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
        return isRealDate ? date : this.invalid();
      }
      if (value.trim() === '') {
        return null;
      }
    }
    return super.parse(value, parseFormat);
  }

  override format(date: Date, displayFormat: object): string {
    if (!this.isValid(date)) {
      throw new Error('BrDateAdapter: cannot format invalid date.');
    }
    return new Intl.DateTimeFormat('pt-BR', { ...displayFormat, timeZone: 'UTC' }).format(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  }
}

export const BR_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: null },
  display: {
    dateInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

/** Date picker providers for pt-BR; add them where a `mat-datepicker` is used. */
export function provideBrDateAdapter(): Provider[] {
  return [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    { provide: DateAdapter, useClass: BrDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: BR_DATE_FORMATS },
  ];
}
