/** Converts a value in reais (e.g. 12.34) to integer cents (1234). */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/** Converts integer cents to reais. */
export function fromCents(cents: number): number {
  return cents / 100;
}

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formats cents as BRL (`R$ 1.234,56`). Useful outside templates (charts, CSV). */
export function formatBrl(cents: number): string {
  return BRL_FORMATTER.format(fromCents(cents));
}

/**
 * Parses an amount typed by a person or found in a CSV file.
 * Accepts `1234.56`, `1234,56`, `1.234,56`, `1,234.56` and an optional `R$` prefix.
 * Returns `null` when the text is not a valid number.
 */
export function parseAmount(text: string): number | null {
  let cleaned = text.replace(/R\$|\s/g, '').trim();
  if (!cleaned) {
    return null;
  }
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  if (lastComma > lastDot) {
    // Comma is the decimal separator (pt-BR): drop the thousand dots.
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  return Number(cleaned);
}
