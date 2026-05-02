import { AppLang } from '../i18n/language';
import { Category } from '../models';
import { demoLabel } from './demo-labels';

/** Starter categories. Stable ids keep demo data and CSV round-trips predictable. */
export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'cat-salary', name: 'Salário', type: 'income', color: '#2e9d5b', icon: 'payments' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', color: '#1f8fb3', icon: 'work' },
  {
    id: 'cat-investments',
    name: 'Investimentos',
    type: 'income',
    color: '#7a5cd6',
    icon: 'trending_up',
  },
  {
    id: 'cat-other-income',
    name: 'Outras receitas',
    type: 'income',
    color: '#5f7d8c',
    icon: 'savings',
  },
  { id: 'cat-housing', name: 'Moradia', type: 'expense', color: '#6d5bd0', icon: 'home' },
  { id: 'cat-food', name: 'Alimentação', type: 'expense', color: '#e8772e', icon: 'restaurant' },
  {
    id: 'cat-transport',
    name: 'Transporte',
    type: 'expense',
    color: '#2f80ed',
    icon: 'directions_car',
  },
  { id: 'cat-health', name: 'Saúde', type: 'expense', color: '#e0457b', icon: 'favorite' },
  { id: 'cat-leisure', name: 'Lazer', type: 'expense', color: '#14a89c', icon: 'sports_esports' },
  { id: 'cat-education', name: 'Educação', type: 'expense', color: '#c99a06', icon: 'school' },
  {
    id: 'cat-subscriptions',
    name: 'Assinaturas',
    type: 'expense',
    color: '#9b51e0',
    icon: 'subscriptions',
  },
  { id: 'cat-shopping', name: 'Compras', type: 'expense', color: '#d64545', icon: 'shopping_bag' },
  {
    id: 'cat-other-expense',
    name: 'Outras despesas',
    type: 'expense',
    color: '#7b8794',
    icon: 'more_horiz',
  },
];

/** Default categories with names in the given language. */
export function defaultCategories(lang: AppLang = 'pt-BR'): Category[] {
  return DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    name: demoLabel(category.name, lang),
  }));
}
