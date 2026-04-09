import { formatCurrency } from '@angular/common';
import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { fromCents } from '../utils/money';

/**
 * Formats an amount in cents as Brazilian reais using the app locale (`R$ 1.234,56`).
 * `signed` prefixes positive values with `+`, handy for balances.
 */
@Pipe({ name: 'brl' })
export class BrlPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(cents: number | null | undefined, signed = false): string {
    if (cents === null || cents === undefined || Number.isNaN(cents)) {
      return '';
    }
    const formatted = formatCurrency(fromCents(cents), this.locale, 'R$', 'BRL', '1.2-2');
    return signed && cents > 0 ? `+${formatted}` : formatted;
  }
}
