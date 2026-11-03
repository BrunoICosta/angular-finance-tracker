import {
  Directive,
  ElementRef,
  effect,
  forwardRef,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LanguageService } from '../../core/i18n/language.service';
import { formatMaskedCents, nextCents, pastedTextToCents } from '../utils/currency-mask';
import { fromCents, toCents } from '../utils/money';

/**
 * Money mask for `<input appCurrencyInput formControlName="...">`.
 *
 * Shows BRL formatted for the active language while typing (`R$ 1.234,56` / `R$1,234.56`),
 * with cents-first entry (digits fill from the right), and handles paste. The form control
 * keeps a plain number in reais (or `null` when empty), so `Validators.min/max` keep working.
 */
@Directive({
  selector: 'input[appCurrencyInput]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CurrencyInputDirective),
      multi: true,
    },
  ],
  host: {
    type: 'text',
    inputmode: 'decimal',
    autocomplete: 'off',
    '(input)': 'onInput($event)',
    '(paste)': 'onPaste($event)',
    '(blur)': 'onTouched()',
  },
})
export class CurrencyInputDirective implements ControlValueAccessor {
  private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;
  private readonly locale = inject(LanguageService).locale;
  private readonly cents = signal<number | null>(null);

  private onChange: (value: number | null) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  constructor() {
    // Re-format when the language changes (and after every programmatic write).
    effect(() => {
      const text = formatMaskedCents(this.cents(), this.locale());
      untracked(() => this.render(text));
    });
  }

  writeValue(value: number | null | undefined): void {
    this.cents.set(
      value === null || value === undefined || Number.isNaN(value) ? null : toCents(value),
    );
    this.render(formatMaskedCents(this.cents(), this.locale()));
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.input.disabled = isDisabled;
  }

  protected onInput(event: Event): void {
    const isDeletion = (event as InputEvent).inputType?.startsWith('delete') ?? false;
    this.update(nextCents(this.cents(), this.input.value, isDeletion));
  }

  protected onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text');
    if (text === undefined) {
      return;
    }
    event.preventDefault();
    this.update(pastedTextToCents(text));
  }

  private update(cents: number | null): void {
    this.cents.set(cents);
    this.render(formatMaskedCents(cents, this.locale()));
    this.onChange(cents === null ? null : fromCents(cents));
  }

  /** Writes the text and keeps the caret at the end, where cents-first typing happens. */
  private render(text: string): void {
    if (this.input.value !== text) {
      this.input.value = text;
    }
    if (this.input.ownerDocument.activeElement === this.input) {
      this.input.setSelectionRange(text.length, text.length);
    }
  }
}
