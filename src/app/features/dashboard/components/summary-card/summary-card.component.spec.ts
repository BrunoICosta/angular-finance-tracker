import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SummaryCardComponent } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let fixture: ComponentFixture<SummaryCardComponent>;

  beforeAll(() => registerLocaleData(localePt, 'pt-BR'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardComponent],
      providers: [provideZonelessChangeDetection(), { provide: LOCALE_ID, useValue: 'pt-BR' }],
    }).compileComponents();
    fixture = TestBed.createComponent(SummaryCardComponent);
    fixture.componentRef.setInput('label', 'Saldo do mês');
    fixture.componentRef.setInput('valueCents', 320129);
    fixture.componentRef.setInput('hint', '26 transações no mês');
    await fixture.whenStable();
  });

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;

  it('renders label, formatted value and hint', () => {
    const text = element().textContent?.replace(/\s+/g, ' ') ?? '';
    expect(text).toContain('Saldo do mês');
    expect(text).toContain('R$ 3.201,29');
    expect(text).toContain('26 transações no mês');
  });

  it('applies the tone class and highlights negative values', async () => {
    fixture.componentRef.setInput('tone', 'expense');
    fixture.componentRef.setInput('valueCents', -100);
    await fixture.whenStable();
    expect(element().classList).toContain('card--expense');
    expect(element().querySelector('.card__value--negative')).toBeTruthy();
  });
});
