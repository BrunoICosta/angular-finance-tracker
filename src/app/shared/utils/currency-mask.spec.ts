import { digitsToCents, formatMaskedCents, nextCents, pastedTextToCents } from './currency-mask';

const normalize = (text: string): string => text.replace(/\s/g, ' ');

describe('currency mask', () => {
  it('reads only the digits as cents', () => {
    expect(digitsToCents('R$ 1.234,56')).toBe(123456);
    expect(digitsToCents('R$1,234.56')).toBe(123456);
    expect(digitsToCents('7')).toBe(7);
    expect(digitsToCents('000012')).toBe(12);
    expect(digitsToCents('R$ ')).toBeNull();
    expect(digitsToCents('')).toBeNull();
  });

  it('caps the number of digits', () => {
    expect(digitsToCents('9'.repeat(20))).toBe(999_999_999_999);
  });

  it('formats cents in BRL for the active locale', () => {
    expect(normalize(formatMaskedCents(123456, 'pt-BR'))).toBe('R$ 1.234,56');
    expect(formatMaskedCents(123456, 'en-US')).toBe('R$1,234.56');
    expect(normalize(formatMaskedCents(5, 'pt-BR'))).toBe('R$ 0,05');
    expect(formatMaskedCents(null, 'pt-BR')).toBe('');
  });

  it('fills digits from the right while typing', () => {
    let cents: number | null = null;
    for (const digit of ['1', '2', '3', '4']) {
      const shown = formatMaskedCents(cents, 'pt-BR');
      cents = nextCents(cents, shown + digit, false);
    }
    expect(cents).toBe(1234);
    expect(normalize(formatMaskedCents(cents, 'pt-BR'))).toBe('R$ 12,34');
  });

  it('drops a digit when Backspace only removed a separator', () => {
    // "R$ 12,34" with the comma deleted still has the same digits.
    expect(nextCents(1234, 'R$ 1234', true)).toBe(123);
    // A normal deletion of the last digit.
    expect(nextCents(1234, 'R$ 12,3', true)).toBe(123);
    // Deleting the last remaining digit empties the field.
    expect(nextCents(5, 'R$ 0,05', true)).toBeNull();
  });

  it('understands pasted amounts in both notations', () => {
    expect(pastedTextToCents('1.234,56')).toBe(123456);
    expect(pastedTextToCents('1,234.56')).toBe(123456);
    expect(pastedTextToCents('R$ 89,90')).toBe(8990);
    expect(pastedTextToCents('1500')).toBe(150000);
    expect(pastedTextToCents('-20,00')).toBe(2000);
    expect(pastedTextToCents('abc')).toBeNull();
  });
});
