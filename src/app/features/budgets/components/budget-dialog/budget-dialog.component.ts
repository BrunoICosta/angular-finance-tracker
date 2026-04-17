import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category } from '../../../../core/models';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { fromCents, toCents } from '../../../../shared/utils/money';

export interface BudgetDialogData {
  readonly category: Category;
  readonly limitCents?: number;
  /** Average monthly spending, shown as a hint. */
  readonly averageCents?: number;
}

/** `limitCents: 0` means "remove the budget". */
export interface BudgetDialogResult {
  readonly limitCents: number;
}

@Component({
  selector: 'app-budget-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CategoryIconComponent,
    BrlPipe,
  ],
  template: `
    <h2 mat-dialog-title class="title">
      <app-category-icon [icon]="data.category.icon" [color]="data.category.color" />
      Orçamento · {{ data.category.name }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content>
        <p class="intro">Defina quanto pretende gastar por mês nesta categoria.</p>
        <mat-form-field appearance="outline" floatLabel="always" class="field">
          <mat-label>Limite mensal</mat-label>
          <span matTextPrefix>R$&nbsp;</span>
          <input
            matInput
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            formControlName="limit"
            cdkFocusInitial
          />
          @if (data.averageCents) {
            <mat-hint>Média dos últimos meses: {{ data.averageCents | brl }}</mat-hint>
          }
          @if (form.controls.limit.hasError('required')) {
            <mat-error>Informe o limite.</mat-error>
          } @else if (form.controls.limit.hasError('min')) {
            <mat-error>O limite deve ser maior que zero.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        @if (data.limitCents) {
          <button mat-button type="button" class="remove" (click)="removeBudget()">Remover</button>
        }
        <span class="spacer"></span>
        <button mat-button type="button" mat-dialog-close>Cancelar</button>
        <button mat-flat-button type="submit">Salvar</button>
      </mat-dialog-actions>
    </form>
  `,
  styles: `
    .title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .intro {
      margin: 0 0 16px;
      color: var(--mat-sys-on-surface-variant);
    }
    .field {
      width: 100%;
    }
    .spacer {
      flex: 1;
    }
    .remove {
      --mat-button-text-label-text-color: var(--mat-sys-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetDialogComponent {
  protected readonly data = inject<BudgetDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef =
    inject<MatDialogRef<BudgetDialogComponent, BudgetDialogResult>>(MatDialogRef);

  readonly form = inject(NonNullableFormBuilder).group({
    limit: [
      this.data.limitCents ? fromCents(this.data.limitCents) : (null as number | null),
      [Validators.required, Validators.min(0.01)],
    ],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ limitCents: toCents(this.form.getRawValue().limit ?? 0) });
  }

  protected removeBudget(): void {
    this.dialogRef.close({ limitCents: 0 });
  }
}
