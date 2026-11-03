import { TextFieldModule } from '@angular/cdk/text-field';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { Transaction, TransactionDraft, TransactionType } from '../../../../core/models';
import { FinanceStore } from '../../../../core/state/finance.store';
import { provideLocalizedDateAdapter } from '../../../../shared/adapters/localized-date.adapter';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { CurrencyInputDirective } from '../../../../shared/directives/currency-input.directive';
import { fromCents, toCents } from '../../../../shared/utils/money';
import { fromIsoDate, toIsoDate } from '../../../../shared/utils/month';

export interface TransactionFormDialogData {
  /** Present when editing. */
  readonly transaction?: Transaction;
  /** Pre-selected type when creating. */
  readonly type?: TransactionType;
}

export const DESCRIPTION_MAX_LENGTH = 80;
export const NOTES_MAX_LENGTH = 280;
export const MAX_AMOUNT = 10_000_000;

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim().length ? null : { required: true };
}

@Component({
  selector: 'app-transaction-form-dialog',
  imports: [
    ReactiveFormsModule,
    TextFieldModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CategoryIconComponent,
    CurrencyInputDirective,
    TranslocoPipe,
  ],
  // Dialogs are created outside the route injector, so they provide their own scope.
  providers: [provideLocalizedDateAdapter(), provideTranslocoScope('transactions')],
  templateUrl: './transaction-form-dialog.component.html',
  styleUrl: './transaction-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFormDialogComponent {
  private readonly store = inject(FinanceStore);
  private readonly dialogRef =
    inject<MatDialogRef<TransactionFormDialogComponent, TransactionDraft>>(MatDialogRef);
  private readonly data = inject<TransactionFormDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly isEdit = !!this.data?.transaction;
  protected readonly descriptionMax = DESCRIPTION_MAX_LENGTH;
  protected readonly notesMax = NOTES_MAX_LENGTH;

  readonly form = inject(NonNullableFormBuilder).group({
    type: [this.data?.transaction?.type ?? this.data?.type ?? ('expense' as TransactionType)],
    description: [
      this.data?.transaction?.description ?? '',
      [Validators.required, notBlank, Validators.maxLength(DESCRIPTION_MAX_LENGTH)],
    ],
    amount: [
      this.data?.transaction
        ? fromCents(this.data.transaction.amountCents)
        : (null as number | null),
      [Validators.required, Validators.min(0.01), Validators.max(MAX_AMOUNT)],
    ],
    date: [
      this.data?.transaction
        ? fromIsoDate(this.data.transaction.date)
        : (new Date() as Date | null),
      Validators.required,
    ],
    categoryId: [this.data?.transaction?.categoryId ?? '', Validators.required],
    notes: [this.data?.transaction?.notes ?? '', Validators.maxLength(NOTES_MAX_LENGTH)],
  });

  private readonly type = toSignal(this.form.controls.type.valueChanges, {
    initialValue: this.form.controls.type.value,
  });

  protected readonly categories = computed(() =>
    this.type() === 'income' ? this.store.incomeCategories() : this.store.expenseCategories(),
  );

  protected readonly notesLength = toSignal(this.form.controls.notes.valueChanges, {
    initialValue: this.form.controls.notes.value,
  });

  constructor() {
    // A category belongs to one type: clear the selection when the type no longer matches.
    this.form.controls.type.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
      const category = this.store.categoryById().get(this.form.controls.categoryId.value);
      if (category && category.type !== type) {
        this.form.controls.categoryId.reset('');
      }
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const notes = value.notes.trim();
    const draft: TransactionDraft = {
      type: value.type,
      description: value.description.trim(),
      amountCents: toCents(value.amount ?? 0),
      date: toIsoDate(value.date ?? new Date()),
      categoryId: value.categoryId,
      ...(notes ? { notes } : {}),
    };
    this.dialogRef.close(draft);
  }
}
