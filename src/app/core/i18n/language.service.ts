import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import './register-locales';
import {
  AVAILABLE_LANGS,
  AppLang,
  LANG_LABELS,
  LANG_LOCALES,
  LANG_STORAGE_KEY,
  detectLanguage,
} from './language';

/**
 * Owns the active UI language: detects it on startup, keeps Transloco, `<html lang>` and
 * localStorage in sync, and exposes the matching formatting locale as a signal.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);

  private readonly _lang = signal<AppLang>(this.initialLang());

  readonly lang = this._lang.asReadonly();
  /** Locale for dates, numbers and currency (`pt-BR` or `en-US`). */
  readonly locale = computed(() => LANG_LOCALES[this._lang()]);
  readonly languages = AVAILABLE_LANGS.map((code) => ({ code, label: LANG_LABELS[code] }));

  constructor() {
    effect(() => {
      const lang = this._lang();
      this.transloco.setActiveLang(lang);
      this.document.documentElement.lang = lang;
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {
        // Storage unavailable: the choice lasts for this session only.
      }
    });
  }

  /** Loads the root translations of the initial language (used by the app initializer). */
  init(): Promise<unknown> {
    this.transloco.setActiveLang(this._lang());
    this.document.documentElement.lang = this._lang();
    return firstValueFrom(this.transloco.load(this._lang()));
  }

  async use(lang: AppLang): Promise<void> {
    // Load first so the switch happens in one go instead of flashing keys.
    await firstValueFrom(this.transloco.load(lang));
    this._lang.set(lang);
  }

  private initialLang(): AppLang {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(LANG_STORAGE_KEY);
    } catch {
      // Ignore: fall back to the browser language.
    }
    const navigator = this.document.defaultView?.navigator;
    const browserLanguages = navigator?.languages?.length
      ? navigator.languages
      : [navigator?.language ?? ''];
    return detectLanguage(saved, browserLanguages);
  }
}
