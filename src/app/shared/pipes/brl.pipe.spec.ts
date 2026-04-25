import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrlPipe } from './brl.pipe';

describe('BrlPipe', () => {
  let pipe: BrlPipe;
  const normalize = (text: string): string => text.replace(/\s/g, ' ');

  beforeAll(() => registerLocaleData(localePt, 'pt-BR'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        BrlPipe,
        { provide: LOCALE_ID, useValue: 'pt-BR' },
      ],
    });
    pipe = TestBed.inject(BrlPipe);
  });

  it('formats cents as reais', () => {
    expect(normalize(pipe.transform(123456))).toBe('R$ 1.234,56');
    expect(normalize(pipe.transform(5))).toBe('R$ 0,05');
  });

  it('adds a plus sign to positive values when signed', () => {
    expect(normalize(pipe.transform(1000, true))).toBe('+R$ 10,00');
    expect(normalize(pipe.transform(-1000, true))).toBe('-R$ 10,00');
  });

  it('returns an empty string for missing values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
