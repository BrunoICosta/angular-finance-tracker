import { ChangeDetectorRef, Signal, effect, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';

/**
 * Active formatting locale for a pipe. Also marks the host view for check when the language
 * changes, so OnPush views that only show formatted values refresh too.
 */
export function injectLocale(): Signal<string> {
  const locale = inject(LanguageService).locale;
  // Absent when the pipe is created outside a view (e.g. injected directly in a test).
  const cdr = inject(ChangeDetectorRef, { optional: true });
  effect(() => {
    locale();
    cdr?.markForCheck();
  });
  return locale;
}
