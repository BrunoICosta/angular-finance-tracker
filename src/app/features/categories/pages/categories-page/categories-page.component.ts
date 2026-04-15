import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryDraft, TransactionType } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { CategoryInUseError, FinanceStore } from '../../../../core/state/finance.store';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import {
  CategoryFormDialogComponent,
  CategoryFormDialogData,
} from '../../components/category-form-dialog/category-form-dialog.component';

interface CategoryItem {
  readonly category: Category;
  readonly usageLabel: string;
}

interface CategoryGroup {
  readonly type: TransactionType;
  readonly title: string;
  readonly items: readonly CategoryItem[];
}

function usageLabel(usage: number): string {
  if (usage === 0) {
    return 'Nenhuma transação';
  }
  return usage === 1 ? '1 transação' : `${usage} transações`;
}

@Component({
  selector: 'app-categories-page',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    PageHeaderComponent,
    CategoryIconComponent,
    EmptyStateComponent,
  ],
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPageComponent {
  protected readonly store = inject(FinanceStore);
  private readonly dialog = inject(MatDialog);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly notifications = inject(NotificationService);

  protected readonly groups = computed<readonly CategoryGroup[]>(() => {
    const usage = this.store.categoryUsage();
    const toItems = (categories: readonly Category[]): CategoryItem[] =>
      categories.map((category) => ({
        category,
        usageLabel: usageLabel(usage.get(category.id) ?? 0),
      }));
    return [
      { type: 'expense', title: 'Despesas', items: toItems(this.store.expenseCategories()) },
      { type: 'income', title: 'Receitas', items: toItems(this.store.incomeCategories()) },
    ];
  });

  protected async create(type: TransactionType): Promise<void> {
    const draft = await this.open({ type });
    if (draft) {
      this.store.addCategory(draft);
      this.notifications.success(`Categoria "${draft.name}" criada.`);
    }
  }

  protected async edit(category: Category): Promise<void> {
    const usage = this.store.categoryUsage().get(category.id) ?? 0;
    const draft = await this.open({ category, usage });
    if (draft) {
      this.store.updateCategory(category.id, draft);
      this.notifications.success('Categoria atualizada.');
    }
  }

  protected async remove(category: Category): Promise<void> {
    const usage = this.store.categoryUsage().get(category.id) ?? 0;
    if (usage > 0) {
      this.notifications.error(
        `"${category.name}" possui ${usage} transação(ões). Mova ou exclua-as antes de remover a categoria.`,
      );
      return;
    }
    const confirmed = await this.confirmDialog.confirm({
      title: 'Excluir categoria?',
      message: `"${category.name}" e o orçamento associado serão removidos.`,
      confirmLabel: 'Excluir',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      this.store.removeCategory(category.id);
      this.notifications.success('Categoria excluída.');
    } catch (error) {
      if (error instanceof CategoryInUseError) {
        this.notifications.error(error.message);
      } else {
        throw error;
      }
    }
  }

  private open(data: CategoryFormDialogData): Promise<CategoryDraft | undefined> {
    const ref = this.dialog.open<
      CategoryFormDialogComponent,
      CategoryFormDialogData,
      CategoryDraft
    >(CategoryFormDialogComponent, { data, width: '520px', maxWidth: 'calc(100vw - 32px)' });
    return firstValueFrom(ref.afterClosed());
  }
}
