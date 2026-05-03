import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectedMonthStore } from '../../../core/state/selected-month.store';
import { MonthNavigatorComponent } from './month-navigator.component';
import { provideI18nTesting } from '../../../../testing/i18n.testing';

describe('MonthNavigatorComponent', () => {
  let fixture: ComponentFixture<MonthNavigatorComponent>;
  let months: SelectedMonthStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthNavigatorComponent],
      providers: [provideZonelessChangeDetection(), provideI18nTesting()],
    }).compileComponents();
    months = TestBed.inject(SelectedMonthStore);
    months.select('2026-01');
    fixture = TestBed.createComponent(MonthNavigatorComponent);
    await fixture.whenStable();
  });

  const element = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const label = (): string =>
    element().querySelector('.navigator__label')?.textContent?.trim() ?? '';
  const button = (name: string): HTMLButtonElement =>
    element().querySelector(`button[aria-label="${name}"]`) as HTMLButtonElement;

  it('shows the selected month in Portuguese', () => {
    expect(label()).toBe('janeiro 2026');
  });

  it('moves to the previous and next month', async () => {
    button('Mês anterior').click();
    await fixture.whenStable();
    expect(months.month()).toBe('2025-12');
    expect(label()).toBe('dezembro 2025');

    button('Próximo mês').click();
    button('Próximo mês').click();
    await fixture.whenStable();
    expect(months.month()).toBe('2026-02');
  });

  it('offers a shortcut back to the current month', async () => {
    const shortcut = element().querySelector('.navigator__today') as HTMLButtonElement;
    expect(shortcut).toBeTruthy();
    shortcut.click();
    await fixture.whenStable();
    expect(months.isCurrentMonth()).toBeTrue();
    expect(element().querySelector('.navigator__today')).toBeNull();
  });
});
