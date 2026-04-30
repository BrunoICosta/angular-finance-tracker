import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoPipe } from '@jsverse/transloco';
import { LocalDatePipe } from '../../pipes/local-date.pipe';
import { SelectedMonthStore } from '../../../core/state/selected-month.store';

@Component({
  selector: 'app-month-navigator',
  imports: [LocalDatePipe, MatButtonModule, MatIconModule, MatTooltipModule, TranslocoPipe],
  template: `
    <div class="navigator" role="group" [attr.aria-label]="'monthNavigator.label' | transloco">
      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'monthNavigator.previous' | transloco"
        [matTooltip]="'monthNavigator.previous' | transloco"
        (click)="months.previous()"
      >
        <mat-icon>chevron_left</mat-icon>
      </button>
      <span class="navigator__label" aria-live="polite">{{
        months.date() | localDate: 'MMMM y'
      }}</span>
      <button
        mat-icon-button
        type="button"
        [attr.aria-label]="'monthNavigator.next' | transloco"
        [matTooltip]="'monthNavigator.next' | transloco"
        (click)="months.next()"
      >
        <mat-icon>chevron_right</mat-icon>
      </button>
    </div>
    @if (!months.isCurrentMonth()) {
      <button mat-button type="button" class="navigator__today" (click)="months.goToCurrent()">
        {{ 'monthNavigator.current' | transloco }}
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .navigator {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: var(--app-card);
    }
    .navigator__label {
      min-width: 9.5rem;
      text-align: center;
      font: var(--mat-sys-title-small);
      font-weight: 600;
    }
    .navigator__label::first-letter {
      text-transform: uppercase;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthNavigatorComponent {
  protected readonly months = inject(SelectedMonthStore);
}
