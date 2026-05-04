import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../../../core/i18n/language.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Theme, ThemeService } from '../../../../core/services/theme.service';
import { FinanceStore } from '../../../../core/state/finance.store';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { LanguageSwitcherComponent } from '../../../../shared/components/language-switcher/language-switcher.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TranslatedText, plural } from '../../../../shared/i18n/translated-text';
import { toIsoDate } from '../../../../shared/utils/month';
import { FileTransferService } from '../../data-access/file-transfer.service';
import {
  CsvFormatError,
  CsvImportError,
  csvHeaderLine,
  csvToTransactions,
  transactionsToCsv,
} from '../../data-access/transactions-csv';

/** Files above this size are rejected before reading (localStorage could not hold them anyway). */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

export interface ImportSummary {
  readonly fileName: string;
  readonly imported: number;
  readonly newCategories: number;
  readonly errors: readonly CsvImportError[];
}

@Component({
  selector: 'app-settings-page',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    LanguageSwitcherComponent,
    TranslocoPipe,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  protected readonly store = inject(FinanceStore);
  protected readonly theme = inject(ThemeService);
  protected readonly languages = inject(LanguageService);
  private readonly transloco = inject(TranslocoService);
  private readonly files = inject(FileTransferService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  protected readonly csvHeaders = computed(() => csvHeaderLine(this.languages.lang()));
  protected readonly exportText = computed(() =>
    plural('settings.export.text', this.store.transactions().length),
  );
  protected readonly importing = signal(false);
  protected readonly importSummary = signal<ImportSummary | null>(null);
  protected readonly importError = signal<TranslatedText | null>(null);

  protected readonly summaryLines = computed(() => {
    const summary = this.importSummary();
    if (!summary) {
      return null;
    }
    return {
      summary,
      imported: plural('settings.import.imported', summary.imported, { file: summary.fileName }),
      categories: summary.newCategories
        ? plural('settings.import.categoriesCreated', summary.newCategories)
        : null,
      skipped: summary.errors.length
        ? plural('settings.import.skipped', summary.errors.length)
        : null,
    };
  });

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  protected exportCsv(): void {
    const csv = transactionsToCsv(
      this.store.transactions(),
      this.store.categoryById(),
      this.languages.lang(),
    );
    const prefix = this.transloco.translate('settings.export.filePrefix');
    this.files.download(csv, `${prefix}-${toIsoDate(new Date())}.csv`, 'text/csv');
    this.notifications.success('settings.export.done', {
      count: this.store.transactions().length,
    });
  }

  protected async importCsv(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    this.importSummary.set(null);
    this.importError.set(null);
    if (file.size > MAX_IMPORT_BYTES) {
      this.importError.set({ key: 'settings.import.errors.tooLarge' });
      return;
    }
    this.importing.set(true);
    try {
      const text = await this.files.readText(file);
      const result = csvToTransactions(text, this.store.categories(), {
        fallbackCategoryNames: {
          income: this.transloco.translate('settings.import.fallbackIncome'),
          expense: this.transloco.translate('settings.import.fallbackExpense'),
        },
      });
      const imported = this.store.importTransactions(result.transactions, result.newCategories);
      this.importSummary.set({
        fileName: file.name,
        imported,
        newCategories: result.newCategories.length,
        errors: result.errors,
      });
      if (imported) {
        this.notifications.success('settings.import.done', { count: imported });
      }
    } catch (error) {
      this.importError.set(
        error instanceof CsvFormatError
          ? { key: error.key, params: error.params }
          : { key: 'settings.import.errors.unreadable' },
      );
    } finally {
      this.importing.set(false);
    }
  }

  protected async clearData(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'settings.data.clearConfirm.title',
      message: 'settings.data.clearConfirm.message',
      confirmLabel: 'settings.data.clear',
      destructive: true,
    });
    if (confirmed) {
      this.store.clearAll();
      this.importSummary.set(null);
      this.notifications.success('settings.data.cleared');
    }
  }

  protected async restoreDemo(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'settings.data.restoreConfirm.title',
      message: 'settings.data.restoreConfirm.message',
      confirmLabel: 'settings.data.restoreConfirm.confirm',
    });
    if (confirmed) {
      this.store.restoreDemo();
      this.importSummary.set(null);
      this.notifications.success('settings.data.restored');
    }
  }
}
