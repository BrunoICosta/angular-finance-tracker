import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Page title with an optional subtitle and a slot for actions (`[actions]`). */
@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header__text">
      <h1 class="page-header__title">{{ title() }}</h1>
      @if (subtitle()) {
        <p class="page-header__subtitle">{{ subtitle() }}</p>
      }
    </div>
    <div class="page-header__actions">
      <ng-content select="[actions]" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin: 16px 0 24px;
    }
    .page-header__title {
      margin: 0;
      font: var(--mat-sys-headline-small);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .page-header__subtitle {
      margin: 4px 0 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .page-header__actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
