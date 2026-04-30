import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { AppLang, LANG_LABELS } from '../../../core/i18n/language';
import { LanguageService } from '../../../core/i18n/language.service';

/** Header button + menu to switch the UI language. Shows the current language code. */
@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslocoPipe],
  template: `
    <button
      mat-button
      type="button"
      class="trigger"
      [matMenuTriggerFor]="menu"
      [attr.aria-label]="'language.label' | transloco: { language: currentLabel() }"
      [matTooltip]="'language.change' | transloco"
    >
      <mat-icon>translate</mat-icon>
      <span class="trigger__code" aria-hidden="true">{{ shortCode() }}</span>
    </button>
    <mat-menu #menu="matMenu" xPosition="before">
      @for (language of languages.languages; track language.code) {
        <button
          mat-menu-item
          type="button"
          role="menuitemradio"
          [attr.aria-checked]="language.code === languages.lang()"
          [attr.lang]="language.code"
          (click)="select(language.code)"
        >
          <mat-icon>{{ language.code === languages.lang() ? 'check' : '' }}</mat-icon>
          <span>{{ language.label }}</span>
        </button>
      }
    </mat-menu>
  `,
  styles: `
    .trigger {
      min-width: 0;
      --mat-button-text-label-text-color: var(--mat-sys-on-surface);
    }
    .trigger__code {
      font-weight: 600;
      letter-spacing: 0.04em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);

  protected readonly currentLabel = computed(() => LANG_LABELS[this.languages.lang()]);
  protected readonly shortCode = computed(() => this.languages.lang().slice(0, 2).toUpperCase());

  protected select(lang: AppLang): void {
    void this.languages.use(lang);
  }
}
