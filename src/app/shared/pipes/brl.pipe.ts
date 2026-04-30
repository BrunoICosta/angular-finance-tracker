import { formatCurrency } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { fromCents } from '../utils/money';
import { injectLocale } from './locale-aware';

/**
 * Formats an amount in cents as Brazilian reais in the active locale
 * (`R$ 1.234,56` in pt-BR, `R$1,234.56` in English). `signed` prefixes positives with `+`.
 *
 * Impure because the result depends on the active language, not only on the input; the
 * work is a cheap Intl call and the views are OnPush.
 */
@Pipe({ name: 'brl', pure: false })
export class BrlPipe implements PipeTransform {
  private readonly locale = injectLocale();

  transform(cents: number | null | undefined, signed = false): string {
    if (cents === null || cents === undefined || Number.isNaN(cents)) {
      return '';
    }
    const formatted = formatCurrency(fromCents(cents), this.locale(), 'R$', 'BRL', '1.2-2');
    return signed && cents > 0 ? `+${formatted}` : formatted;
  }
}
