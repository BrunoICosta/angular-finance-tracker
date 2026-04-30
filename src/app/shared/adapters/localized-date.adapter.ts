import { Injectable, Provider, inject } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { LanguageService } from '../../core/i18n/language.service';

/**
 * `NativeDateAdapter` relies on `Date.parse`, which reads `03/04/2026` as March 4th no matter
 * the language. This adapter parses typed dates in the order of the active locale:
 * `dd/MM/yyyy` for pt-BR and `MM/dd/yyyy` for English.
 */
@Injectable()
export class LocalizedDateAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value === 'string') {
      const match = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\s*$/.exec(value);
      if (match) {
        const monthFirst = this.locale.toLowerCase().startsWith('en');
        const day = Number(monthFirst ? match[2] : match[1]);
        const month = Number(monthFirst ? match[1] : match[2]) - 1;
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
      throw new Error('LocalizedDateAdapter: cannot format invalid date.');
    }
    return new Intl.DateTimeFormat(this.locale, { ...displayFormat, timeZone: 'UTC' }).format(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
  }
}

export const LOCALIZED_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: null },
  display: {
    dateInput: { year: 'numeric', month: '2-digit', day: '2-digit' },
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

/** Date picker providers using the active UI locale; add them where a `mat-datepicker` is used. */
export function provideLocalizedDateAdapter(): Provider[] {
  return [
    { provide: MAT_DATE_LOCALE, useFactory: () => inject(LanguageService).locale() },
    { provide: DateAdapter, useClass: LocalizedDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: LOCALIZED_DATE_FORMATS },
  ];
}
