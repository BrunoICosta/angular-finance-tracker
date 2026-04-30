export interface NavItem {
  readonly path: string;
  /** Translation key. */
  readonly label: string;
  readonly icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'nav.dashboard', icon: 'space_dashboard' },
  { path: '/transacoes', label: 'nav.transactions', icon: 'receipt_long' },
  { path: '/orcamentos', label: 'nav.budgets', icon: 'savings' },
  { path: '/categorias', label: 'nav.categories', icon: 'category' },
  { path: '/configuracoes', label: 'nav.settings', icon: 'settings' },
];
