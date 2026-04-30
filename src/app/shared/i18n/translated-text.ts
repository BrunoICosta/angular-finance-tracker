/** Interpolation params of a translation. */
export type TranslationParams = Record<string, unknown>;

/**
 * A text that is still to be translated: computed values return keys + params and the
 * template applies `| transloco`, so the text follows language changes.
 */
export interface TranslatedText {
  readonly key: string;
  readonly params?: TranslationParams;
}

/** Picks `<base>.one` or `<base>.other` and passes `count` as a param. */
export function plural(
  base: string,
  count: number,
  params: TranslationParams = {},
): TranslatedText {
  return { key: `${base}.${count === 1 ? 'one' : 'other'}`, params: { count, ...params } };
}
