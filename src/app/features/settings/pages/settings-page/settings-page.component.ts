import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../../core/services/notification.service';
import { Theme, ThemeService } from '../../../../core/services/theme.service';
import { FinanceStore } from '../../../../core/state/finance.store';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { toIsoDate } from '../../../../shared/utils/month';
import { FileTransferService } from '../../data-access/file-transfer.service';
import {
  CSV_HEADERS,
  CsvFormatError,
  CsvImportError,
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
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  protected readonly store = inject(FinanceStore);
  protected readonly theme = inject(ThemeService);
  private readonly files = inject(FileTransferService);
  private readonly notifications = inject(NotificationService);

  protected readonly csvHeaders = CSV_HEADERS.join(';');
  protected readonly importing = signal(false);
  protected readonly importSummary = signal<ImportSummary | null>(null);
  protected readonly importError = signal<string | null>(null);

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  protected exportCsv(): void {
    const csv = transactionsToCsv(this.store.transactions(), this.store.categoryById());
    this.files.download(csv, `financas-${toIsoDate(new Date())}.csv`, 'text/csv');
    this.notifications.success(`${this.store.transactions().length} transações exportadas.`);
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
      this.importError.set('Arquivo muito grande. O limite é 2 MB.');
      return;
    }
    this.importing.set(true);
    try {
      const text = await this.files.readText(file);
      const result = csvToTransactions(text, this.store.categories());
      const imported = this.store.importTransactions(result.transactions, result.newCategories);
      this.importSummary.set({
        fileName: file.name,
        imported,
        newCategories: result.newCategories.length,
        errors: result.errors,
      });
      if (imported) {
        this.notifications.success(`${imported} transações importadas.`);
      }
    } catch (error) {
      this.importError.set(
        error instanceof CsvFormatError ? error.message : 'Não foi possível ler o arquivo.',
      );
    } finally {
      this.importing.set(false);
    }
  }
}
