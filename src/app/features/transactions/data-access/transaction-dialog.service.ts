import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { Transaction, TransactionDraft, TransactionType } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { FinanceStore } from '../../../core/state/finance.store';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import {
  TransactionFormDialogComponent,
  TransactionFormDialogData,
} from '../components/transaction-form-dialog/transaction-form-dialog.component';

/** Create / edit / delete flows for transactions, shared by the feature's pages. */
@Injectable({ providedIn: 'root' })
export class TransactionDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly store = inject(FinanceStore);
  private readonly notifications = inject(NotificationService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  async create(type?: TransactionType): Promise<void> {
    const draft = await this.open({ type });
    if (draft) {
      this.store.addTransaction(draft);
      this.notifications.success(
        draft.type === 'income' ? 'Receita adicionada.' : 'Despesa adicionada.',
      );
    }
  }

  async edit(transaction: Transaction): Promise<void> {
    const draft = await this.open({ transaction });
    if (draft) {
      this.store.updateTransaction(transaction.id, draft);
      this.notifications.success('Transação atualizada.');
    }
  }

  async remove(transaction: Transaction): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Excluir transação?',
      message: `"${transaction.description}" será removida permanentemente.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    this.store.removeTransaction(transaction.id);
    const undo = await this.notifications.withAction('Transação excluída.', 'Desfazer');
    if (undo) {
      this.store.restoreTransaction(transaction);
    }
  }

  private open(data: TransactionFormDialogData): Promise<TransactionDraft | undefined> {
    const ref = this.dialog.open<
      TransactionFormDialogComponent,
      TransactionFormDialogData,
      TransactionDraft
    >(TransactionFormDialogComponent, {
      data,
      width: '560px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
    });
    return firstValueFrom(ref.afterClosed());
  }
}
