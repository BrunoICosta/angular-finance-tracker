/** Lowercases and strips accents and extra spaces, so "Alimentação " equals "alimentacao". */
export function normalizeName(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}
