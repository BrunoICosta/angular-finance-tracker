import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DateAdapter } from '@angular/material/core';
import { BR_DATE_FORMATS, provideBrDateAdapter } from './br-date.adapter';

describe('BrDateAdapter', () => {
  let adapter: DateAdapter<Date>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideBrDateAdapter()],
    });
    adapter = TestBed.inject(DateAdapter);
  });

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

  it('formats in pt-BR', () => {
    expect(adapter.format(new Date(2026, 3, 3), BR_DATE_FORMATS.display.dateInput)).toBe(
      '03/04/2026',
    );
  });
});
