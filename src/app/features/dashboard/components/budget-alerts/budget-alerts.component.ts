import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BudgetProgress } from '../../../../core/domain/finance-calculations';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';

/** Budgets that are over the limit or close to it. */
@Component({
  selector: 'app-budget-alerts',
  imports: [MatIconModule, BrlPipe, PercentPipe],
  template: `
    <ul class="alerts" role="list">
      @for (alert of alerts(); track alert.category.id) {
        <li class="alert" [class.alert--over]="alert.status === 'over'">
          <mat-icon class="alert__icon" aria-hidden="true">{{
            alert.status === 'over' ? 'error' : 'warning'
          }}</mat-icon>
          <div class="alert__text">
            <span class="alert__title">
              {{ alert.category.name }}
              <span class="visually-hidden">:</span>
              <span class="alert__ratio tabular">{{ alert.ratio | percent: '1.0-0' }}</span>
            </span>
            <span class="alert__detail">
              @if (alert.status === 'over') {
                Passou {{ -alert.remainingCents | brl }} do limite de {{ alert.limitCents | brl }}
              } @else {
                Restam {{ alert.remainingCents | brl }} de {{ alert.limitCents | brl }}
              }
            </span>
          </div>
        </li>
      }
    </ul>
  `,
  styles: `
    .alerts {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .alert {
      --tone: var(--app-warning);
      --tone-container: var(--app-warning-container);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      border-radius: var(--app-radius-sm);
      background: var(--tone-container);
    }
    .alert--over {
      --tone: var(--app-expense);
      --tone-container: var(--app-expense-container);
    }
    .alert__icon {
      flex: none;
      color: var(--tone);
    }
    .alert__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .alert__title {
      display: flex;
      gap: 8px;
      font-weight: 600;
    }
    .alert__ratio {
      color: var(--tone);
    }
    .alert__detail {
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-small);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetAlertsComponent {
  readonly alerts = input.required<readonly BudgetProgress[]>();
}
