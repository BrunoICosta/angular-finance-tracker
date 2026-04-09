import { Pipe, PipeTransform } from '@angular/core';
import { fromIsoDate } from '../utils/month';

/**
 * Turns a `YYYY-MM-DD` string into a local `Date`, so `| date` does not shift it by the
 * time zone (`new Date('2026-04-01')` is UTC midnight, i.e. March 31st in Brazil).
 */
@Pipe({ name: 'isoDate' })
export class IsoDatePipe implements PipeTransform {
  transform(value: string): Date {
    return fromIsoDate(value);
  }
}
