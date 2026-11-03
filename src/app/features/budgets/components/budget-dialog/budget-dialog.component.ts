import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { Category } from '../../../../core/models';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { CurrencyInputDirective } from '../../../../shared/directives/currency-input.directive';
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
    CurrencyInputDirective,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('budgets')],
  template: `
    <h2 mat-dialog-title class="title">
      <app-category-icon [icon]="data.category.icon" [color]="data.category.color" />
      {{ 'budgets.dialog.title' | transloco: { name: data.category.name } }}
    </h2>
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <mat-dialog-content>
        <p class="intro">{{ 'budgets.dialog.intro' | transloco }}</p>
        <mat-form-field appearance="outline" floatLabel="always" class="field">
          <mat-label>{{ 'budgets.dialog.limit' | transloco }}</mat-label>
          <input
            matInput
            appCurrencyInput
            [placeholder]="'common.amountPlaceholder' | transloco"
            formControlName="limit"
            cdkFocusInitial
          />
          @if (data.averageCents) {
            <mat-hint>{{
              'budgets.dialog.average' | transloco: { amount: (data.averageCents | brl) }
            }}</mat-hint>
          }
          @if (form.controls.limit.hasError('required')) {
            <mat-error>{{ 'budgets.dialog.errors.required' | transloco }}</mat-error>
          } @else if (form.controls.limit.hasError('min')) {
            <mat-error>{{ 'budgets.dialog.errors.min' | transloco }}</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions>
        @if (data.limitCents) {
          <button mat-button type="button" class="remove" (click)="removeBudget()">
            {{ 'budgets.dialog.remove' | transloco }}
          </button>
        }
        <span class="spacer"></span>
        <button mat-button type="button" mat-dialog-close>{{ 'common.cancel' | transloco }}</button>
        <button mat-flat-button type="submit">{{ 'common.save' | transloco }}</button>
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
