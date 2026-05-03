import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../../public/i18n/en.json';
import ptBR from '../../public/i18n/pt-BR.json';
import budgetsEn from '../../public/i18n/budgets/en.json';
import budgetsPt from '../../public/i18n/budgets/pt-BR.json';
import categoriesEn from '../../public/i18n/categories/en.json';
import categoriesPt from '../../public/i18n/categories/pt-BR.json';
import dashboardEn from '../../public/i18n/dashboard/en.json';
import dashboardPt from '../../public/i18n/dashboard/pt-BR.json';
import settingsEn from '../../public/i18n/settings/en.json';
import settingsPt from '../../public/i18n/settings/pt-BR.json';
import transactionsEn from '../../public/i18n/transactions/en.json';
import transactionsPt from '../../public/i18n/transactions/pt-BR.json';
import { AVAILABLE_LANGS, AppLang, LANG_STORAGE_KEY } from '../app/core/i18n/language';

/** The real translation files, keyed the way Transloco loads them (`<scope>/<lang>`). */
export const TEST_TRANSLATIONS = {
  'pt-BR': ptBR,
  en,
  'dashboard/pt-BR': dashboardPt,
  'dashboard/en': dashboardEn,
  'transactions/pt-BR': transactionsPt,
  'transactions/en': transactionsEn,
  'budgets/pt-BR': budgetsPt,
  'budgets/en': budgetsEn,
  'categories/pt-BR': categoriesPt,
  'categories/en': categoriesEn,
  'settings/pt-BR': settingsPt,
  'settings/en': settingsEn,
};

/**
 * Transloco with the real translations preloaded (no HTTP), starting in `lang`.
 * The language is also saved, so `LanguageService` picks it up instead of the browser's.
 */
export function provideI18nTesting(lang: AppLang = 'pt-BR'): EnvironmentProviders {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Not available: LanguageService falls back to the browser language.
  }
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: TEST_TRANSLATIONS,
      translocoConfig: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: lang,
        fallbackLang: 'pt-BR',
        reRenderOnLangChange: true,
      },
      preloadLangs: true,
    }),
  );
}
