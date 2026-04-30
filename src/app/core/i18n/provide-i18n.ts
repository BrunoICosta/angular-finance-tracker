import {
  EnvironmentProviders,
  Provider,
  inject,
  isDevMode,
  provideAppInitializer,
} from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { provideContentLangFromUi } from './content-lang';
import { AVAILABLE_LANGS, DEFAULT_LANG } from './language';
import { LanguageService } from './language.service';
import { TranslatedTitleStrategy } from './translated-title.strategy';
import { TranslocoHttpLoader } from './transloco-http.loader';

/** Transloco, translated route titles and the startup language. */
export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    ...provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true, logMissingKey: isDevMode() },
      },
      loader: TranslocoHttpLoader,
    }),
    { provide: TitleStrategy, useExisting: TranslatedTitleStrategy },
    provideContentLangFromUi(),
    provideAppInitializer(() => inject(LanguageService).init()),
  ];
}
