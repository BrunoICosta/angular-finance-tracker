import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { AppLang } from '../../core/i18n/language';
import { provideI18nTesting } from '../../../testing/i18n.testing';
import { LOCALIZED_DATE_FORMATS, provideLocalizedDateAdapter } from './localized-date.adapter';

function setup(lang: AppLang): DateAdapter<Date> {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideI18nTesting(lang),
      provideLocalizedDateAdapter(),
    ],
  });
  return TestBed.inject(DateAdapter);
}

describe('LocalizedDateAdapter', () => {
  describe('in pt-BR', () => {
    let adapter: DateAdapter<Date>;
    beforeEach(() => (adapter = setup('pt-BR')));

    it('parses dd/MM/yyyy as day first', () => {
      const date = adapter.parse('03/04/2026', null);
      expect(date?.getDate()).toBe(3);
      expect(date?.getMonth()).toBe(3);
      expect(date?.getFullYear()).toBe(2026);
    });

    it('accepts two-digit years', () => {
      expect(adapter.parse('1/2/26', null)?.getFullYear()).toBe(2026);
    });

    it('flags impossible dates as invalid', () => {
      const date = adapter.parse('31/02/2026', null);
      expect(date).not.toBeNull();
      expect(adapter.isValid(date as Date)).toBeFalse();
    });

    it('returns null for empty input', () => {
      expect(adapter.parse('  ', null)).toBeNull();
    });

    it('formats as dd/MM/yyyy', () => {
      expect(adapter.format(new Date(2026, 3, 3), LOCALIZED_DATE_FORMATS.display.dateInput)).toBe(
        '03/04/2026',
      );
    });
  });

  describe('in English', () => {
    let adapter: DateAdapter<Date>;
    beforeEach(() => (adapter = setup('en')));

    it('parses MM/dd/yyyy as month first', () => {
      const date = adapter.parse('03/04/2026', null);
      expect(date?.getMonth()).toBe(2);
      expect(date?.getDate()).toBe(4);
    });

    it('formats as MM/dd/yyyy', () => {
      expect(adapter.format(new Date(2026, 3, 3), LOCALIZED_DATE_FORMATS.display.dateInput)).toBe(
        '04/03/2026',
      );
    });
  });
});
