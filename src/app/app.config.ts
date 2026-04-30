import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
} from '@angular/router';

import { routes } from './app.routes';
import { provideI18n } from './core/i18n/provide-i18n';
import { FinanceRepository } from './core/storage/finance.repository';
import { LocalStorageFinanceRepository } from './core/storage/local-storage-finance.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withFetch()),
    provideI18n(),
    { provide: FinanceRepository, useClass: LocalStorageFinanceRepository },
    // The domain is Brazilian: amounts are always BRL, only the formatting follows the language.
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    }),
  ],
};
