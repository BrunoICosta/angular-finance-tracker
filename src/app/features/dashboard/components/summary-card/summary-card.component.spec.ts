import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppLang } from '../../../../core/i18n/language';
import { LanguageService } from '../../../../core/i18n/language.service';
import { provideI18nTesting } from '../../../../../testing/i18n.testing';
import { SummaryCardComponent } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let fixture: ComponentFixture<SummaryCardComponent>;

  async function create(lang: AppLang): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [SummaryCardComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting(lang)],
    }).compileComponents();
    fixture = TestBed.createComponent(SummaryCardComponent);
    fixture.componentRef.setInput('label', 'Saldo do mês');
    fixture.componentRef.setInput('valueCents', 320129);
    fixture.componentRef.setInput('hint', '26 transações no mês');
    await fixture.whenStable();
  }

  const text = (): string =>
    (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ') ?? '';

  it('renders label, value in BRL (pt-BR format) and hint', async () => {
    await create('pt-BR');
    expect(text()).toContain('Saldo do mês');
    expect(text()).toContain('R$ 3.201,29');
    expect(text()).toContain('26 transações no mês');
  });

  it('keeps BRL but uses the English number format in English', async () => {
    await create('en');
    expect(text()).toContain('R$3,201.29');
  });

  it('re-formats when the language changes at runtime', async () => {
    await create('pt-BR');
    await TestBed.inject(LanguageService).use('en');
    await fixture.whenStable();
    expect(text()).toContain('R$3,201.29');
  });

  it('applies the tone class and highlights negative values', async () => {
    await create('pt-BR');
    fixture.componentRef.setInput('tone', 'expense');
    fixture.componentRef.setInput('valueCents', -100);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.classList).toContain('card--expense');
    expect(element.querySelector('.card__value--negative')).toBeTruthy();
  });
});
