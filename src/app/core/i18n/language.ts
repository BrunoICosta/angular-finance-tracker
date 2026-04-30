/** Languages the UI is translated to. `pt-BR` is the default and the fallback. */
export const AVAILABLE_LANGS = ['pt-BR', 'en'] as const;
export type AppLang = (typeof AVAILABLE_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'pt-BR';
export const LANG_STORAGE_KEY = 'finance-tracker:lang';

/** Locale used by Angular/Intl formatting for each UI language. Currency stays BRL in both. */
export const LANG_LOCALES: Readonly<Record<AppLang, string>> = {
  'pt-BR': 'pt-BR',
  en: 'en-US',
};

/** Native names, shown in the language switcher. */
export const LANG_LABELS: Readonly<Record<AppLang, string>> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
};

export function isAppLang(value: unknown): value is AppLang {
  return typeof value === 'string' && (AVAILABLE_LANGS as readonly string[]).includes(value);
}

/**
 * Initial language: saved choice, then the first browser language we support
 * (`pt*` -> pt-BR, `en*` -> en), then pt-BR.
 */
export function detectLanguage(saved: string | null, browserLanguages: readonly string[]): AppLang {
  if (isAppLang(saved)) {
    return saved;
  }
  for (const language of browserLanguages) {
    const code = language.toLowerCase();
    if (code.startsWith('pt')) {
      return 'pt-BR';
    }
    if (code.startsWith('en')) {
      return 'en';
    }
  }
  return DEFAULT_LANG;
}
