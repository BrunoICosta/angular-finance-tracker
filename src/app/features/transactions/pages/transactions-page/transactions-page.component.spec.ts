import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_CATEGORIES } from '../../../../core/data/default-categories';
import { FINANCE_DATA_VERSION, Transaction } from '../../../../core/models';
import { FinanceStore } from '../../../../core/state/finance.store';
import { SelectedMonthStore } from '../../../../core/state/selected-month.store';
import { FinanceRepository } from '../../../../core/storage/finance.repository';
import { InMemoryFinanceRepository } from '../../../../core/storage/in-memory-finance.repository';
import { provideTranslatedPaginator } from '../../../../shared/i18n/translated-paginator-intl';
import { LanguageService } from '../../../../core/i18n/language.service';
import { TransactionsPageComponent } from './transactions-page.component';

function makeTransactions(count: number): Transaction[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `t${index}`,
    description: index === 0 ? 'Padaria do bairro' : `Compra ${index}`,
    amountCents: 1000 + index,
    date: `2026-04-${String((index % 28) + 1).padStart(2, '0')}`,
    type: 'expense' as const,
    categoryId: 'cat-food',
    createdAt: '2026-04-01T10:00:00.000Z',
  }));
}
import { provideI18nTesting } from '../../../../../testing/i18n.testing';

describe('TransactionsPageComponent', () => {
  let fixture: ComponentFixture<TransactionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionsPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslatedPaginator(),
        provideI18nTesting(),
        {
          provide: FinanceRepository,
          useValue: new InMemoryFinanceRepository({
            version: FINANCE_DATA_VERSION,
            transactions: makeTransactions(23),
            categories: DEFAULT_CATEGORIES,
            budgets: [],
          }),
        },
      ],
    }).compileComponents();
    await TestBed.inject(FinanceStore).load();
    TestBed.inject(SelectedMonthStore).select('2026-04');
    fixture = TestBed.createComponent(TransactionsPageComponent);
    await fixture.whenStable();
  });

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const rows = (): number => element().querySelectorAll('tr.mat-mdc-row').length;

  it('shows the first page and the total count', () => {
    expect(element().querySelector('#results-title')?.textContent).toContain('23 transações');
    expect(rows()).toBe(10);
    expect(element().querySelector('.mat-mdc-paginator-range-label')?.textContent).toContain(
      '1–10 de 23',
    );
  });

  it('filters by text and resets to the first page', async () => {
    (element().querySelector('button[aria-label="Próxima página"]') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(element().querySelector('.mat-mdc-paginator-range-label')?.textContent).toContain(
      '11–20 de 23',
    );

    const search = element().querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'padaria';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(rows()).toBe(1);
    expect(element().textContent).toContain('Padaria do bairro');
    expect(element().querySelector('.mat-mdc-paginator-range-label')?.textContent).toContain(
      '1–1 de 1',
    );
  });

  it('shows a "nothing found" state with a way to clear the filters', async () => {
    const search = element().querySelector('input[type="search"]') as HTMLInputElement;
    search.value = 'inexistente';
    search.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(element().textContent).toContain('Nada encontrado');
    const clear = [...element().querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Limpar filtros'),
    ) as HTMLButtonElement;
    clear.click();
    await fixture.whenStable();
    expect(rows()).toBe(10);
  });

  it('stays on the last existing page when rows are removed', async () => {
    const next = (): HTMLButtonElement =>
      element().querySelector('button[aria-label="Próxima página"]') as HTMLButtonElement;
    next().click();
    next().click();
    await fixture.whenStable();
    expect(rows()).toBe(3);

    const store = TestBed.inject(FinanceStore);
    for (const id of ['t20', 't21', 't22']) {
      store.removeTransaction(id);
    }
    await fixture.whenStable();

    expect(rows()).toBe(10);
    expect(element().querySelector('.mat-mdc-paginator-range-label')?.textContent).toContain(
      '11–20 de 20',
    );
  });

  it('renders in English with translated labels, dates and paginator', async () => {
    await TestBed.inject(LanguageService).use('en');
    await fixture.whenStable();

    expect(element().querySelector('h1')?.textContent).toContain('Transactions');
    expect(element().querySelector('#results-title')?.textContent).toContain('23 transactions');
    expect(element().querySelector('.mat-mdc-paginator-range-label')?.textContent).toContain(
      '1–10 of 23',
    );
    expect(element().querySelector('th')?.textContent).toContain('Date');
    // en-US short date (M/d/yy) and BRL with the English number format.
    expect(element().textContent).toContain('4/23/26');
    expect(element().textContent).toContain('R$10.22');
  });
});
