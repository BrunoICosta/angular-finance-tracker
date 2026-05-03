import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { FinanceRepository } from './core/storage/finance.repository';
import { InMemoryFinanceRepository } from './core/storage/in-memory-finance.repository';
import { provideI18nTesting } from '../testing/i18n.testing';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...appConfig.providers,
        { provide: FinanceRepository, useValue: new InMemoryFinanceRepository() },
        provideI18nTesting(),
      ],
    });
  });

  it('renders the shell with brand and navigation', async () => {
    const harness = await RouterTestingHarness.create('/');
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement?.ownerDocument.body ?? document.body;
    expect(element.querySelector('.brand__name')?.textContent).toContain('Finanças');
    expect(element.querySelectorAll('mat-nav-list a').length).toBeGreaterThan(0);
  });
});
