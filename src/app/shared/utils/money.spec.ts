import { formatBrl, fromCents, parseAmount, toCents } from './money';

describe('money utils', () => {
  it('converts between reais and cents without floating point drift', () => {
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(19.99)).toBe(1999);
    expect(fromCents(1999)).toBe(19.99);
  });

  it('formats cents as BRL', () => {
    // Intl uses a non-breaking space between the symbol and the value.
    expect(formatBrl(123456).replace(/\s/g, ' ')).toBe('R$ 1.234,56');
    expect(formatBrl(-500).replace(/\s/g, ' ')).toBe('-R$ 5,00');
  });

  describe('parseAmount', () => {
    it('reads pt-BR and en-US notations', () => {
      expect(parseAmount('1.234,56')).toBe(1234.56);
      expect(parseAmount('1234,56')).toBe(1234.56);
      expect(parseAmount('1,234.56')).toBe(1234.56);
      expect(parseAmount('1234.56')).toBe(1234.56);
      expect(parseAmount('R$ 89,90')).toBe(89.9);
      expect(parseAmount('-12,50')).toBe(-12.5);
    });

    it('returns null for invalid input', () => {
      expect(parseAmount('')).toBeNull();
      expect(parseAmount('abc')).toBeNull();
      expect(parseAmount('12,3,4')).toBeNull();
    });
  });
});
