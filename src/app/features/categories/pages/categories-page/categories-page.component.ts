import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { Category, CategoryDraft, TransactionType } from '../../../../core/models';
import { NotificationService } from '../../../../core/services/notification.service';
import { CategoryInUseError, FinanceStore } from '../../../../core/state/finance.store';
import { CategoryIconComponent } from '../../../../shared/components/category-icon/category-icon.component';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { TranslatedText, plural } from '../../../../shared/i18n/translated-text';
import {
  CategoryFormDialogComponent,
  CategoryFormDialogData,
} from '../../components/category-form-dialog/category-form-dialog.component';

interface CategoryItem {
  readonly category: Category;
  readonly usageLabel: TranslatedText;
}

interface CategoryGroup {
  readonly type: TransactionType;
  readonly title: string;
  readonly items: readonly CategoryItem[];
}

function usageLabel(usage: number): TranslatedText {
  return usage === 0 ? { key: 'categories.usage.none' } : plural('categories.usage', usage);
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
    TranslocoPipe,
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
      {
        type: 'expense',
        title: 'common.type.expensePlural',
        items: toItems(this.store.expenseCategories()),
      },
      {
        type: 'income',
        title: 'common.type.incomePlural',
        items: toItems(this.store.incomeCategories()),
      },
    ];
  });

  protected async create(type: TransactionType): Promise<void> {
    const draft = await this.open({ type });
    if (draft) {
      this.store.addCategory(draft);
      this.notifications.success('categories.toast.created', { name: draft.name });
    }
  }

  protected async edit(category: Category): Promise<void> {
    const usage = this.store.categoryUsage().get(category.id) ?? 0;
    const draft = await this.open({ category, usage });
    if (draft) {
      this.store.updateCategory(category.id, draft);
      this.notifications.success('categories.toast.updated');
    }
  }

  protected async remove(category: Category): Promise<void> {
    const usage = this.store.categoryUsage().get(category.id) ?? 0;
    if (usage > 0) {
      this.notifications.error('categories.toast.inUse', { name: category.name, count: usage });
      return;
    }
    const confirmed = await this.confirmDialog.confirm({
      title: 'categories.delete.title',
      message: 'categories.delete.message',
      params: { name: category.name },
      confirmLabel: 'common.delete',
      destructive: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      this.store.removeCategory(category.id);
      this.notifications.success('categories.toast.deleted');
    } catch (error) {
      if (error instanceof CategoryInUseError) {
        this.notifications.error('categories.toast.inUse', {
          name: category.name,
          count: error.usage,
        });
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
