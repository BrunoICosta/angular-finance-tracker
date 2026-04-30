import { InjectionToken, inject } from '@angular/core';
import { AppLang, DEFAULT_LANG } from './language';
import { LanguageService } from './language.service';

/**
 * Reads the language used to generate content (demo data, default categories). The default
 * keeps core state free of Transloco (handy in tests); `provideI18n()` binds it to the UI language.
 */
export const CONTENT_LANG = new InjectionToken<() => AppLang>('CONTENT_LANG', {
  providedIn: 'root',
  factory: () => () => DEFAULT_LANG,
});

export function provideContentLangFromUi() {
  return {
    provide: CONTENT_LANG,
    useFactory: () => {
      const languages = inject(LanguageService);
      return () => languages.lang();
    },
  };
}
