import { formatDate } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { fromIsoDate } from '../utils/month';
import { injectLocale } from './locale-aware';

/**
 * `formatDate` in the active locale. Accepts a `Date` or an ISO `YYYY-MM-DD` string; strings
 * are read as local dates so they are not shifted by the time zone.
 */
@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly locale = injectLocale();

  transform(value: Date | string | null | undefined, format = 'mediumDate'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    const date = typeof value === 'string' ? fromIsoDate(value) : value;
    return formatDate(date, format, this.locale());
  }
}
