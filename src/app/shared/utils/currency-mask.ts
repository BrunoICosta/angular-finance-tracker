import { formatBrl, parseAmount, toCents } from './money';

/** Largest amount the mask accepts: 12 digits of cents (R$ 9.999.999.999,99). */
export const MAX_MASK_DIGITS = 12;

/** Keeps only the digits of a typed text and reads them as cents (`'R$ 1.234,5'` -> 12345). */
export function digitsToCents(text: string): number | null {
  const digits = text
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '')
    .slice(0, MAX_MASK_DIGITS);
  return digits ? Number(digits) : null;
}

/** Text shown in a masked money input: `R$ 1.234,56` (pt-BR) or `R$1,234.56` (en-US). */
export function formatMaskedCents(cents: number | null, locale: string): string {
  return cents === null ? '' : formatBrl(cents, locale);
}

/**
 * Cents for a pasted text. Pasting "1.234,56", "1,234.56" or "R$ 89,90" keeps the meaning of
 * the separators; plain digits ("1500") are read as whole reais, like a person would expect.
 */
export function pastedTextToCents(text: string): number | null {
  const amount = parseAmount(text);
  if (amount === null) {
    return digitsToCents(text);
  }
  return Math.min(Math.abs(toCents(amount)), 10 ** MAX_MASK_DIGITS - 1);
}

/**
 * Next cents value after an `input` event (cents-first typing: digits fill from the right).
 * When a deletion only removed a separator or the currency symbol, one digit is dropped instead,
 * so Backspace always has a visible effect.
 */
export function nextCents(
  previous: number | null,
  text: string,
  isDeletion: boolean,
): number | null {
  const cents = digitsToCents(text);
  if (isDeletion && cents !== null && cents === previous) {
    const dropped = Math.floor(cents / 10);
    return dropped === 0 ? null : dropped;
  }
  return cents;
}
