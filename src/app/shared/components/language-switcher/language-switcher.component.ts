import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { AVAILABLE_LANGS, AppLang } from '../../../core/i18n/language';
import { LanguageService } from '../../../core/i18n/language.service';
import { FlagIconComponent } from '../flag-icon/flag-icon.component';

/**
 * Language picker as a radio group of flag buttons. Each option is named in its own language
 * (`lang` attribute + tooltip); arrow keys move and select, like a native radio group.
 */
@Component({
  selector: 'app-language-switcher',
  imports: [FlagIconComponent, MatTooltipModule, TranslocoPipe],
  template: `
    <div
      class="group"
      role="radiogroup"
      [attr.aria-label]="'language.group' | transloco"
    >
      @for (language of languages.languages; track language.code) {
        @let selected = language.code === languages.lang();
        <button
          type="button"
          role="radio"
          class="option"
          [class.option--selected]="selected"
          [attr.aria-checked]="selected"
          [attr.aria-label]="language.label"
          [attr.lang]="language.code"
          [attr.data-lang]="language.code"
          [tabindex]="selected ? 0 : -1"
          [matTooltip]="language.label"
          (click)="select(language.code)"
          (keydown)="onKeydown($event)"
        >
          <app-flag-icon [lang]="language.code" />
        </button>
      }
    </div>
  `,
  styles: `
    .group {
      display: inline-flex;
      gap: 2px;
      padding: 2px;
      border-radius: 999px;
    }
    .option {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      opacity: 0.55;
      filter: grayscale(0.6);
      transition:
        opacity 120ms ease,
        filter 120ms ease,
        background-color 120ms ease;
    }
    .option:hover,
    .option:focus-visible {
      opacity: 1;
      filter: none;
      background: var(--mat-sys-surface-container-high);
    }
    .option:focus-visible {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 1px;
    }
    /* Selected: full color plus a ring, so the state does not rely on color alone. */
    .option--selected {
      opacity: 1;
      filter: none;
    }
    .option--selected app-flag-icon {
      outline: 2px solid var(--mat-sys-primary);
      outline-offset: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly languages = inject(LanguageService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected select(lang: AppLang): void {
    void this.languages.use(lang);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) {
      return;
    }
    event.preventDefault();
    const current = AVAILABLE_LANGS.indexOf(this.languages.lang());
    const next =
      AVAILABLE_LANGS[(current + step + AVAILABLE_LANGS.length) % AVAILABLE_LANGS.length];
    this.select(next);
    this.host.nativeElement.querySelector<HTMLButtonElement>(`[data-lang="${next}"]`)?.focus();
  }
}
