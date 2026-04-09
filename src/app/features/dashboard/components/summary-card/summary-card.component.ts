import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';

export type SummaryTone = 'balance' | 'income' | 'expense';

const ICONS: Record<SummaryTone, string> = {
  balance: 'account_balance',
  income: 'arrow_downward',
  expense: 'arrow_upward',
};

@Component({
  selector: 'app-summary-card',
  imports: [MatIconModule, BrlPipe],
  template: `
    <div class="card__header">
      <span class="card__label">{{ label() }}</span>
      <span class="card__icon" aria-hidden="true"
        ><mat-icon>{{ icon() }}</mat-icon></span
      >
    </div>
    <p class="card__value tabular" [class.card__value--negative]="valueCents() < 0">
      {{ valueCents() | brl }}
    </p>
    @if (hint()) {
      <p class="card__hint">{{ hint() }}</p>
    }
  `,
  host: { '[class]': '"card card--" + tone()' },
  styleUrl: './summary-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryCardComponent {
  readonly label = input.required<string>();
  readonly valueCents = input.required<number>();
  readonly tone = input<SummaryTone>('balance');
  readonly hint = input<string>();

  protected readonly icon = computed(() => ICONS[this.tone()]);
}
