import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoPipe } from '@jsverse/transloco';
import { BudgetProgress } from '../../../../core/domain/finance-calculations';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { LocalPercentPipe } from '../../../../shared/pipes/local-percent.pipe';

@Component({
  selector: 'app-budget-row',
  imports: [
    LocalPercentPipe,
    TranslocoPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    CategoryIconComponent,
    BrlPipe,
  ],
  template: `
    @let item = progress();
    <app-category-icon [icon]="item.category.icon" [color]="item.category.color" [size]="40" />
    <div class="body">
      <div class="line">
        <span class="name">{{ item.category.name }}</span>
        <span class="values tabular">
          <strong>{{ item.spentCents | brl }}</strong>
          {{ 'budgets.of' | transloco: { limit: (item.limitCents | brl) } }}
        </span>
      </div>
      <mat-progress-bar
        mode="determinate"
        [value]="barValue()"
        [attr.aria-label]="'budgets.row.usage' | transloco: { name: item.category.name }"
      />
      <div class="line line--meta">
        <span class="status">
          @switch (item.status) {
            @case ('over') {
              <mat-icon aria-hidden="true">error</mat-icon>
              {{ 'budgets.row.over' | transloco: { amount: (-item.remainingCents | brl) } }}
            }
            @case ('warning') {
              <mat-icon aria-hidden="true">warning</mat-icon>
              {{ 'budgets.row.left' | transloco: { amount: (item.remainingCents | brl) } }}
            }
            @default {
              {{ 'budgets.row.left' | transloco: { amount: (item.remainingCents | brl) } }}
            }
          }
        </span>
        <span class="tabular">{{ item.ratio | localPercent }}</span>
      </div>
    </div>
    <button
      mat-icon-button
      type="button"
      [attr.aria-label]="'budgets.row.edit' | transloco: { name: item.category.name }"
      (click)="edit.emit()"
    >
      <mat-icon>edit</mat-icon>
    </button>
  `,
  host: {
    '[class.is-warning]': 'progress().status === "warning"',
    '[class.is-over]': 'progress().status === "over"',
  },
  styleUrl: './budget-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetRowComponent {
  readonly progress = input.required<BudgetProgress>();
  readonly edit = output();

  protected readonly barValue = computed(() => Math.min(100, this.progress().ratio * 100));
}
