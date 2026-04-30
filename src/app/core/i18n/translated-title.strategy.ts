import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

/**
 * Route `title`s are translation keys (e.g. `titles.dashboard`). The document title is
 * translated and re-applied whenever the language changes.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private subscription?: Subscription;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot);
    this.subscription?.unsubscribe();
    this.subscription = this.transloco
      .selectTranslate(key ?? 'titles.app')
      .subscribe((translated: string) => {
        const app = this.transloco.translate('titles.app');
        this.title.setTitle(key ? `${translated} · ${app}` : translated);
      });
  }
}
