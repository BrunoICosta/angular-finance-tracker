import { PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BudgetProgress } from '../../../../core/domain/finance-calculations';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';

@Component({
  selector: 'app-budget-row',
  imports: [
    PercentPipe,
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
          <strong>{{ item.spentCents | brl }}</strong> de {{ item.limitCents | brl }}
        </span>
      </div>
      <mat-progress-bar
        mode="determinate"
        [value]="barValue()"
        [attr.aria-label]="'Consumo do orçamento de ' + item.category.name"
      />
      <div class="line line--meta">
        <span class="status">
          @switch (item.status) {
            @case ('over') {
              <mat-icon aria-hidden="true">error</mat-icon>
              Estourou em {{ -item.remainingCents | brl }}
            }
            @case ('warning') {
              <mat-icon aria-hidden="true">warning</mat-icon>
              Restam {{ item.remainingCents | brl }}
            }
            @default {
              Restam {{ item.remainingCents | brl }}
            }
          }
        </span>
        <span class="tabular">{{ item.ratio | percent: '1.0-0' }}</span>
      </div>
    </div>
    <button
      mat-icon-button
      type="button"
      [attr.aria-label]="'Editar orçamento de ' + item.category.name"
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
