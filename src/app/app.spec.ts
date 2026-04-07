import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { FinanceRepository } from './core/storage/finance-repository';
import { InMemoryFinanceRepository } from './core/storage/in-memory-finance.repository';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        ...appConfig.providers,
        { provide: FinanceRepository, useValue: new InMemoryFinanceRepository() },
      ],
    }).compileComponents();
  });

  it('renders the shell with brand and navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.brand__name')?.textContent).toContain('Finanças');
    expect(element.querySelectorAll('mat-nav-list a').length).toBeGreaterThan(0);
  });
});
