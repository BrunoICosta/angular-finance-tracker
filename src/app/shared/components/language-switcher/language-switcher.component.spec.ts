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

  const trigger = (): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  it('shows the current language in the label', () => {
    expect(trigger().textContent).toContain('PT');
    expect(trigger().getAttribute('aria-label')).toBe('Idioma: Português (Brasil). Alterar idioma');
  });

  it('switches the language from the menu and updates its own labels', async () => {
    trigger().click();
    await fixture.whenStable();

    const options = [...document.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')];
    expect(options.length).toBe(2);
    expect(options[0].textContent).toContain('Português (Brasil)');
    expect(options[1].textContent).toContain('English');
    expect(options[0].getAttribute('aria-checked')).toBe('true');

    options[1].click();
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    expect(TestBed.inject(LanguageService).lang()).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(trigger().textContent).toContain('EN');
    expect(trigger().getAttribute('aria-label')).toBe('Language: English. Change language');
  });
});
