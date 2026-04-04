import { TransactionType } from './transaction.model';

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly type: TransactionType;
  /** Hex color, e.g. `#7c4dff`. */
  readonly color: string;
  /** Material Symbols icon name. */
  readonly icon: string;
}

export type CategoryDraft = Omit<Category, 'id'>;
