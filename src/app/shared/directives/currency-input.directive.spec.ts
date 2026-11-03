import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppLang } from '../../core/i18n/language';
import { LanguageService } from '../../core/i18n/language.service';
import { provideI18nTesting } from '../../../testing/i18n.testing';
import { CurrencyInputDirective } from './currency-input.directive';

@Component({
  imports: [ReactiveFormsModule, CurrencyInputDirective],
  template: `<input appCurrencyInput aria-label="Valor" [formControl]="amount" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HostComponent {
  readonly amount = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0.01),
  ]);
}

describe('CurrencyInputDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let input: HTMLInputElement;

  const normalize = (text: string): string => text.replace(/\s/g, ' ');
  const control = () => fixture.componentInstance.amount;

  async function create(lang: AppLang): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting(lang)],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    input = (fixture.nativeElement as HTMLElement).querySelector('input') as HTMLInputElement;
  }

  /** Simulates typing one key at the end of the field. */
  function type(key: string): void {
    input.focus();
    input.value = input.value + key;
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText', data: key }));
  }

  function backspace(): void {
    input.focus();
    input.value = input.value.slice(0, -1);
    input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }));
  }

  it('is a decimal text field', async () => {
    await create('pt-BR');
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('decimal');
  });

  it('masks cents-first typing and keeps a number in the control (pt-BR)', async () => {
    await create('pt-BR');
    for (const key of '123456') {
      type(key);
    }
    expect(normalize(input.value)).toBe('R$ 1.234,56');
    expect(control().value).toBe(1234.56);
    expect(control().valid).toBeTrue();
    expect(input.selectionStart).toBe(input.value.length);

    backspace();
    expect(normalize(input.value)).toBe('R$ 123,45');
    expect(control().value).toBe(123.45);
  });

  it('uses the English number format in English', async () => {
    await create('en');
    for (const key of '123456') {
      type(key);
    }
    expect(input.value).toBe('R$1,234.56');
    expect(control().value).toBe(1234.56);
  });

  it('shows values written by the form and re-formats on language change', async () => {
    await create('pt-BR');
    control().setValue(6800);
    expect(normalize(input.value)).toBe('R$ 6.800,00');

    await TestBed.inject(LanguageService).use('en');
    await fixture.whenStable();
    expect(input.value).toBe('R$6,800.00');
    expect(control().value).toBe(6800);
  });

  it('handles paste and keeps validation working when emptied', async () => {
    await create('pt-BR');
    const paste = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
      cancelable: true,
    });
    paste.clipboardData?.setData('text', '1.500,25');
    input.dispatchEvent(paste);
    expect(normalize(input.value)).toBe('R$ 1.500,25');
    expect(control().value).toBe(1500.25);

    input.value = '';
    input.dispatchEvent(new InputEvent('input', { inputType: 'deleteContentBackward' }));
    expect(control().value).toBeNull();
    expect(control().hasError('required')).toBeTrue();
  });
});
