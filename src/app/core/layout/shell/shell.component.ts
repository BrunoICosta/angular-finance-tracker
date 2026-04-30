import { ChangeDetectionStrategy, Component, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { FinanceStore } from '../../state/finance.store';
import { injectMediaQuery } from '../../../shared/utils/responsive';
import { NAV_ITEMS } from '../nav-items';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    TranslocoPipe,
    LanguageSwitcherComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly store = inject(FinanceStore);
  protected readonly theme = inject(ThemeService);
  protected readonly navItems = NAV_ITEMS;

  private readonly notifications = inject(NotificationService);
  private readonly drawer = viewChild(MatSidenav);

  /** Below this width the menu becomes an overlay drawer. */
  protected readonly isHandset = injectMediaQuery('(max-width: 959.98px)');

  constructor() {
    effect(() => {
      const message = this.store.saveError();
      if (message) {
        this.notifications.error('shell.saveError');
      }
    });
  }

  /**
   * A plain `href="#main-content"` would resolve against `<base href>` and navigate away
   * when the app is served from a sub-path (GitHub Pages), so focus the landmark instead.
   */
  protected skipToContent(main: HTMLElement): void {
    main.focus();
    main.scrollIntoView({ block: 'start' });
  }

  protected onNavigate(): void {
    if (this.isHandset()) {
      void this.drawer()?.close();
    }
  }
}
