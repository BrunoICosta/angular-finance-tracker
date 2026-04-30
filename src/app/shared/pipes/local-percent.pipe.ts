import { formatPercent } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { injectLocale } from './locale-aware';

/** `formatPercent` in the active locale (`85%` / `85 %` depending on the language). */
@Pipe({ name: 'localPercent', pure: false })
export class LocalPercentPipe implements PipeTransform {
  private readonly locale = injectLocale();

  transform(value: number | null | undefined, digitsInfo = '1.0-0'): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }
    return formatPercent(value, this.locale(), digitsInfo);
  }
}
