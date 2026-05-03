import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideI18nTesting } from '../../../testing/i18n.testing';
import { LANG_STORAGE_KEY } from './language';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  afterEach(() => localStorage.removeItem(LANG_STORAGE_KEY));

  function setup(saved: 'pt-BR' | 'en') {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideI18nTesting(saved)],
    });
    return TestBed.inject(LanguageService);
  }

  it('starts with the saved language and its locale', () => {
    const service = setup('en');
    expect(service.lang()).toBe('en');
    expect(service.locale()).toBe('en-US');
  });

  it('switches Transloco, <html lang> and the saved choice', async () => {
    const service = setup('pt-BR');
    const transloco = TestBed.inject(TranslocoService);

    await service.use('en');
    TestBed.tick();

    expect(service.lang()).toBe('en');
    expect(service.locale()).toBe('en-US');
    expect(transloco.getActiveLang()).toBe('en');
    expect(TestBed.inject(DOCUMENT).documentElement.lang).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(transloco.translate('nav.settings')).toBe('Settings');
  });

  it('lists the available languages with native names', () => {
    const service = setup('pt-BR');
    expect(service.languages.map((language) => language.label)).toEqual([
      'Português (Brasil)',
      'English',
    ]);
  });
});
