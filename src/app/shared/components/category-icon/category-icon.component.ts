import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Round badge with the category icon tinted by its color. Decorative: pair it with a text label. */
@Component({
  selector: 'app-category-icon',
  imports: [MatIconModule],
  template: `<mat-icon aria-hidden="true">{{ icon() }}</mat-icon>`,
  host: {
    '[style.--category-color]': 'color()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
  },
  styles: `
    :host {
      display: inline-grid;
      flex: none;
      place-items: center;
      border-radius: 50%;
      color: light-dark(
        var(--category-color),
        color-mix(in srgb, var(--category-color) 65%, white)
      );
      background: color-mix(in srgb, var(--category-color) 18%, transparent);
    }
    mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryIconComponent {
  readonly icon = input.required<string>();
  readonly color = input.required<string>();
  readonly size = input(36);
}
