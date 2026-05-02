export interface ColorOption {
  readonly value: string;
  /** Translation key. */
  readonly label: string;
}

/** Palette offered in the category form. Mid-tone colors that read well on light and dark. */
export const CATEGORY_COLORS: readonly ColorOption[] = [
  { value: '#6d5bd0', label: 'categories.colors.violet' },
  { value: '#9b51e0', label: 'categories.colors.purple' },
  { value: '#e0457b', label: 'categories.colors.pink' },
  { value: '#d64545', label: 'categories.colors.red' },
  { value: '#e8772e', label: 'categories.colors.orange' },
  { value: '#c99a06', label: 'categories.colors.mustard' },
  { value: '#2e9d5b', label: 'categories.colors.green' },
  { value: '#14a89c', label: 'categories.colors.teal' },
  { value: '#1f8fb3', label: 'categories.colors.petrol' },
  { value: '#2f80ed', label: 'categories.colors.blue' },
  { value: '#5f7d8c', label: 'categories.colors.slate' },
  { value: '#7b8794', label: 'categories.colors.gray' },
];

export interface IconOption {
  readonly name: string;
  readonly label: string;
}

/** Material Symbols available for categories; `label` is the translation key of its name. */
export const CATEGORY_ICONS: readonly IconOption[] = [
  { name: 'payments', label: 'categories.icons.payments' },
  { name: 'work', label: 'categories.icons.work' },
  { name: 'trending_up', label: 'categories.icons.trending_up' },
  { name: 'savings', label: 'categories.icons.savings' },
  { name: 'card_giftcard', label: 'categories.icons.card_giftcard' },
  { name: 'home', label: 'categories.icons.home' },
  { name: 'restaurant', label: 'categories.icons.restaurant' },
  { name: 'shopping_cart', label: 'categories.icons.shopping_cart' },
  { name: 'directions_car', label: 'categories.icons.directions_car' },
  { name: 'directions_bus', label: 'categories.icons.directions_bus' },
  { name: 'local_gas_station', label: 'categories.icons.local_gas_station' },
  { name: 'favorite', label: 'categories.icons.favorite' },
  { name: 'medication', label: 'categories.icons.medication' },
  { name: 'fitness_center', label: 'categories.icons.fitness_center' },
  { name: 'sports_esports', label: 'categories.icons.sports_esports' },
  { name: 'movie', label: 'categories.icons.movie' },
  { name: 'flight', label: 'categories.icons.flight' },
  { name: 'school', label: 'categories.icons.school' },
  { name: 'menu_book', label: 'categories.icons.menu_book' },
  { name: 'subscriptions', label: 'categories.icons.subscriptions' },
  { name: 'wifi', label: 'categories.icons.wifi' },
  { name: 'bolt', label: 'categories.icons.bolt' },
  { name: 'water_drop', label: 'categories.icons.water_drop' },
  { name: 'shopping_bag', label: 'categories.icons.shopping_bag' },
  { name: 'checkroom', label: 'categories.icons.checkroom' },
  { name: 'pets', label: 'categories.icons.pets' },
  { name: 'child_care', label: 'categories.icons.child_care' },
  { name: 'receipt_long', label: 'categories.icons.receipt_long' },
  { name: 'account_balance', label: 'categories.icons.account_balance' },
  { name: 'more_horiz', label: 'categories.icons.more_horiz' },
];
