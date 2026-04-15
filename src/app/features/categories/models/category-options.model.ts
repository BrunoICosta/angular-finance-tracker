export interface ColorOption {
  readonly value: string;
  readonly label: string;
}

/** Palette offered in the category form. Mid-tone colors that read well on light and dark. */
export const CATEGORY_COLORS: readonly ColorOption[] = [
  { value: '#6d5bd0', label: 'Violeta' },
  { value: '#9b51e0', label: 'Roxo' },
  { value: '#e0457b', label: 'Rosa' },
  { value: '#d64545', label: 'Vermelho' },
  { value: '#e8772e', label: 'Laranja' },
  { value: '#c99a06', label: 'Mostarda' },
  { value: '#2e9d5b', label: 'Verde' },
  { value: '#14a89c', label: 'Turquesa' },
  { value: '#1f8fb3', label: 'Azul-petróleo' },
  { value: '#2f80ed', label: 'Azul' },
  { value: '#5f7d8c', label: 'Cinza-azulado' },
  { value: '#7b8794', label: 'Cinza' },
];

export interface IconOption {
  readonly name: string;
  readonly label: string;
}

/** Material Symbols available for categories, with accessible labels. */
export const CATEGORY_ICONS: readonly IconOption[] = [
  { name: 'payments', label: 'Pagamentos' },
  { name: 'work', label: 'Trabalho' },
  { name: 'trending_up', label: 'Investimentos' },
  { name: 'savings', label: 'Poupança' },
  { name: 'card_giftcard', label: 'Presente' },
  { name: 'home', label: 'Casa' },
  { name: 'restaurant', label: 'Restaurante' },
  { name: 'shopping_cart', label: 'Mercado' },
  { name: 'directions_car', label: 'Carro' },
  { name: 'directions_bus', label: 'Ônibus' },
  { name: 'local_gas_station', label: 'Combustível' },
  { name: 'favorite', label: 'Saúde' },
  { name: 'medication', label: 'Remédios' },
  { name: 'fitness_center', label: 'Academia' },
  { name: 'sports_esports', label: 'Jogos' },
  { name: 'movie', label: 'Cinema' },
  { name: 'flight', label: 'Viagem' },
  { name: 'school', label: 'Educação' },
  { name: 'menu_book', label: 'Livros' },
  { name: 'subscriptions', label: 'Assinaturas' },
  { name: 'wifi', label: 'Internet' },
  { name: 'bolt', label: 'Energia' },
  { name: 'water_drop', label: 'Água' },
  { name: 'shopping_bag', label: 'Compras' },
  { name: 'checkroom', label: 'Roupas' },
  { name: 'pets', label: 'Pets' },
  { name: 'child_care', label: 'Filhos' },
  { name: 'receipt_long', label: 'Contas' },
  { name: 'account_balance', label: 'Banco' },
  { name: 'more_horiz', label: 'Outros' },
];
