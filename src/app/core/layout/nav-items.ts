export interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/dashboard', label: 'Visão geral', icon: 'space_dashboard' },
  { path: '/transacoes', label: 'Transações', icon: 'receipt_long' },
  { path: '/orcamentos', label: 'Orçamentos', icon: 'savings' },
  { path: '/categorias', label: 'Categorias', icon: 'category' },
  { path: '/configuracoes', label: 'Configurações', icon: 'settings' },
];
