import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LANG_STORAGE_KEY } from '../../../core/i18n/language';
import { LanguageService } from '../../../core/i18n/language.service';
import { provideI18nTesting } from '../../../../testing/i18n.testing';
import { LanguageSwitcherComponent } from './language-switcher.component';

describe('LanguageSwitcherComponent', () => {
  let fixture: ComponentFixture<LanguageSwitcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguageSwitcherComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting('pt-BR')],
    }).compileComponents();
    fixture = TestBed.createComponent(LanguageSwitcherComponent);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem(LANG_STORAGE_KEY));

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const group = (): HTMLElement => element().querySelector('[role="radiogroup"]') as HTMLElement;
  /** Finds an option by role and accessible name, like a screen reader would. */
  const option = (name: string): HTMLButtonElement =>
    [...element().querySelectorAll<HTMLButtonElement>('[role="radio"]')].find(
      (radio) => radio.getAttribute('aria-label') === name,
    ) as HTMLButtonElement;

  it('is a labelled radio group with one flag per language, named in its own language', () => {
    expect(group().getAttribute('aria-label')).toBe('Idioma');
    const portuguese = option('Português (Brasil)');
    const english = option('English');
    expect(portuguese.getAttribute('lang')).toBe('pt-BR');
    expect(english.getAttribute('lang')).toBe('en');
    expect(portuguese.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('marks the current language as checked and keeps only it in the tab order', () => {
    expect(option('Português (Brasil)').getAttribute('aria-checked')).toBe('true');
    expect(option('English').getAttribute('aria-checked')).toBe('false');
    expect(option('Português (Brasil)').tabIndex).toBe(0);
    expect(option('English').tabIndex).toBe(-1);
  });

  it('switches and persists the language on click', async () => {
    option('English').click();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(option('English').getAttribute('aria-checked')).toBe('true');
    expect(group().getAttribute('aria-label')).toBe('Language');
  });

  it('moves the selection with the arrow keys', async () => {
    option('Português (Brasil)').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(document.activeElement).toBe(option('English'));
  });
});
