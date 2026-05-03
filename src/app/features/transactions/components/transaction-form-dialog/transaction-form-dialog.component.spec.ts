import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_CATEGORIES } from '../../../../core/data/default-categories';
import { FINANCE_DATA_VERSION, Transaction } from '../../../../core/models';
import { FinanceStore } from '../../../../core/state/finance.store';
import { FinanceRepository } from '../../../../core/storage/finance.repository';
import { InMemoryFinanceRepository } from '../../../../core/storage/in-memory-finance.repository';
import {
  TransactionFormDialogComponent,
  TransactionFormDialogData,
} from './transaction-form-dialog.component';
import { provideI18nTesting } from '../../../../../testing/i18n.testing';

describe('TransactionFormDialogComponent', () => {
  let fixture: ComponentFixture<TransactionFormDialogComponent>;
  let component: TransactionFormDialogComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<TransactionFormDialogComponent>>;

  async function create(data: TransactionFormDialogData | null = null): Promise<void> {
    dialogRef = jasmine.createSpyObj<MatDialogRef<TransactionFormDialogComponent>>('MatDialogRef', [
      'close',
    ]);
    await TestBed.configureTestingModule({
      imports: [TransactionFormDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideI18nTesting(),
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
        {
          provide: FinanceRepository,
          useValue: new InMemoryFinanceRepository({
            version: FINANCE_DATA_VERSION,
            transactions: [],
            categories: DEFAULT_CATEGORIES,
            budgets: [],
          }),
        },
      ],
    }).compileComponents();
    await TestBed.inject(FinanceStore).load();
    fixture = TestBed.createComponent(TransactionFormDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  }

  it('starts as an expense dated today and is invalid until filled', async () => {
    await create();
    const { type, date } = component.form.controls;
    expect(type.value).toBe('expense');
    expect(date.value?.toDateString()).toBe(new Date().toDateString());
    expect(component.form.valid).toBeFalse();
  });

  it('shows validation messages and does not close when submitted empty', async () => {
    await create();
    const form = (fixture.nativeElement as HTMLElement).querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    const errors = (fixture.nativeElement as HTMLElement).querySelectorAll('mat-error');
    expect(errors.length).toBeGreaterThanOrEqual(3);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('rejects blank descriptions and non-positive amounts', async () => {
    await create();
    component.form.controls.description.setValue('   ');
    component.form.controls.amount.setValue(0);
    expect(component.form.controls.description.hasError('required')).toBeTrue();
    expect(component.form.controls.amount.hasError('min')).toBeTrue();
  });

  it('closes with a trimmed draft in cents', async () => {
    await create();
    component.form.setValue({
      type: 'expense',
      description: '  Mercado  ',
      amount: 123.45,
      date: new Date(2026, 3, 9),
      categoryId: 'cat-food',
      notes: '  ',
    });
    (fixture.nativeElement as HTMLElement)
      .querySelector('form')
      ?.dispatchEvent(new Event('submit'));

    expect(dialogRef.close).toHaveBeenCalledOnceWith({
      type: 'expense',
      description: 'Mercado',
      amountCents: 12345,
      date: '2026-04-09',
      categoryId: 'cat-food',
    });
  });

  it('clears the category when the type no longer matches it', async () => {
    await create();
    component.form.controls.categoryId.setValue('cat-food');
    component.form.controls.type.setValue('income');
    expect(component.form.controls.categoryId.value).toBe('');
  });

  it('fills the form when editing', async () => {
    const transaction: Transaction = {
      id: 't1',
      description: 'Salário',
      amountCents: 680000,
      date: '2026-04-05',
      type: 'income',
      categoryId: 'cat-salary',
      notes: 'Abril',
      createdAt: '2026-04-05T12:00:00.000Z',
    };
    await create({ transaction });
    const value = component.form.getRawValue();
    expect(value.amount).toBe(6800);
    expect(value.type).toBe('income');
    expect(value.date?.getDate()).toBe(5);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Editar transação');
  });
});
