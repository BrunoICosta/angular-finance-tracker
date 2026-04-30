import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { TranslationParams } from '../../shared/i18n/translated-text';

/**
 * Thin wrapper around the snack bar so features share the same look and timing.
 * Messages are translation keys (root or of a loaded feature scope).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  success(key: string, params?: TranslationParams): void {
    this.snackBar.open(this.t(key, params), this.t('common.ok'), { duration: 3500 });
  }

  error(key: string, params?: TranslationParams): void {
    this.snackBar.open(this.t(key, params), this.t('common.close'), {
      duration: 7000,
      politeness: 'assertive',
    });
  }

  /** Shows a message with an action (e.g. "Desfazer"); resolves `true` if it was clicked. */
  async withAction(key: string, actionKey: string, params?: TranslationParams): Promise<boolean> {
    const ref = this.snackBar.open(this.t(key, params), this.t(actionKey), { duration: 6000 });
    return new Promise((resolve) => {
      let clicked = false;
      ref.onAction().subscribe(() => (clicked = true));
      ref.afterDismissed().subscribe(() => resolve(clicked));
    });
  }

  private t(key: string, params?: TranslationParams): string {
    return this.transloco.translate(key, params);
  }
}
