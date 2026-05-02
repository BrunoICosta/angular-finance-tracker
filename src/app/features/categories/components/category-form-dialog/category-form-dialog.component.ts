import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoPipe, provideTranslocoScope } from '@jsverse/transloco';
import { Category, CategoryDraft, TransactionType } from '../../../../core/models';
import { FinanceStore } from '../../../../core/state/finance.store';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { normalizeName } from '../../../../shared/utils/text';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../models/category-options.model';

export interface CategoryFormDialogData {
  readonly category?: Category;
  readonly type?: TransactionType;
  /** Number of transactions using the category; the type is locked when greater than zero. */
  readonly usage?: number;
}

export const CATEGORY_NAME_MAX_LENGTH = 30;

/** Rejects a name already used by another category of the same type. */
function uniqueNameValidator(
  categories: () => readonly Category[],
  ignoreId: string | undefined,
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const name = normalizeName(group.get('name')?.value ?? '');
    const type = group.get('type')?.value as TransactionType;
    const taken = categories().some(
      (category) =>
        category.id !== ignoreId && category.type === type && normalizeName(category.name) === name,
    );
    return name && taken ? { duplicateName: true } : null;
  };
}

@Component({
  selector: 'app-category-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    CategoryIconComponent,
    TranslocoPipe,
  ],
  providers: [provideTranslocoScope('categories')],
  templateUrl: './category-form-dialog.component.html',
  styleUrl: './category-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormDialogComponent {
  private readonly store = inject(FinanceStore);
  private readonly dialogRef =
    inject<MatDialogRef<CategoryFormDialogComponent, CategoryDraft>>(MatDialogRef);
  private readonly data = inject<CategoryFormDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly isEdit = !!this.data?.category;
  protected readonly typeLocked = (this.data?.usage ?? 0) > 0;
  protected readonly colors = CATEGORY_COLORS;
  protected readonly icons = CATEGORY_ICONS;
  protected readonly nameMax = CATEGORY_NAME_MAX_LENGTH;

  readonly form = inject(NonNullableFormBuilder).group(
    {
      name: [
        this.data?.category?.name ?? '',
        [Validators.required, Validators.maxLength(CATEGORY_NAME_MAX_LENGTH)],
      ],
      type: [
        {
          value: this.data?.category?.type ?? this.data?.type ?? ('expense' as TransactionType),
          disabled: this.typeLocked,
        },
      ],
      color: [this.data?.category?.color ?? CATEGORY_COLORS[0].value, Validators.required],
      icon: [this.data?.category?.icon ?? CATEGORY_ICONS[0].name, Validators.required],
    },
    {
      validators: uniqueNameValidator(() => this.store.categories(), this.data?.category?.id),
    },
  );

  protected readonly preview = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.dialogRef.close({ ...value, name: value.name.trim() });
  }
}
