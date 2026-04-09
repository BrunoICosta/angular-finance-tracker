import { Budget, FINANCE_DATA_VERSION, FinanceData, Transaction, TransactionType } from '../models';
import { toCents } from '../../shared/utils/money';
import { MonthKey, lastMonths, toMonthKey } from '../../shared/utils/month';
import { DEFAULT_CATEGORIES } from './default-categories';

/** Number of months covered by the demo data, ending at the current month. */
export const DEMO_MONTHS = 6;

const DEMO_BUDGETS: readonly Budget[] = [
  { categoryId: 'cat-housing', limitCents: toCents(3000) },
  { categoryId: 'cat-food', limitCents: toCents(1500) },
  { categoryId: 'cat-transport', limitCents: toCents(450) },
  { categoryId: 'cat-leisure', limitCents: toCents(400) },
  { categoryId: 'cat-subscriptions', limitCents: toCents(100) },
  { categoryId: 'cat-shopping', limitCents: toCents(350) },
];

/** Small deterministic PRNG (mulberry32), so the demo looks the same on every first run. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds realistic sample data for the last {@link DEMO_MONTHS} months ending at `today`'s month,
 * including budgets and at least one over-budget category in the current month.
 */
export function createDemoData(today: Date = new Date(), seed = 2026): FinanceData {
  const random = createRandom(seed);
  const between = (min: number, max: number): number =>
    Math.round((min + random() * (max - min)) * 100) / 100;
  const day = (min: number, max: number): number => Math.floor(between(min, max));

  const transactions: Transaction[] = [];
  let sequence = 0;
  const currentMonth = toMonthKey(today);

  const add = (
    month: MonthKey,
    dayOfMonth: number,
    type: TransactionType,
    categoryId: string,
    description: string,
    amount: number,
    notes?: string,
  ): void => {
    sequence += 1;
    const date = `${month}-${String(dayOfMonth).padStart(2, '0')}`;
    transactions.push({
      id: `demo-${String(sequence).padStart(4, '0')}`,
      description,
      amountCents: toCents(amount),
      date,
      type,
      categoryId,
      ...(notes ? { notes } : {}),
      createdAt: `${date}T12:00:00.000Z`,
    });
  };

  lastMonths(currentMonth, DEMO_MONTHS).forEach((month, index) => {
    // Income
    add(month, 5, 'income', 'cat-salary', 'Salário', 6800);
    if (index % 2 === 1) {
      add(month, day(12, 22), 'income', 'cat-freelance', 'Projeto freelance', between(900, 2400));
    }
    add(month, 28, 'income', 'cat-investments', 'Rendimento CDB', between(85, 160));

    // Housing and bills
    add(month, 10, 'expense', 'cat-housing', 'Aluguel', 2100);
    add(month, 10, 'expense', 'cat-housing', 'Condomínio', 480);
    add(month, 15, 'expense', 'cat-housing', 'Conta de luz', between(130, 230));
    add(month, 18, 'expense', 'cat-subscriptions', 'Internet fibra', 99.9);
    add(month, 7, 'expense', 'cat-subscriptions', 'Streaming de vídeo', 44.9);
    add(month, 7, 'expense', 'cat-subscriptions', 'Streaming de música', 21.9);

    // Day-to-day
    for (let i = 0; i < 4; i++) {
      add(
        month,
        day(1 + i * 7, 7 + i * 7),
        'expense',
        'cat-food',
        'Supermercado',
        between(160, 390),
      );
    }
    for (let i = 0; i < 3; i++) {
      add(month, day(1, 28), 'expense', 'cat-food', 'Delivery', between(38, 95));
    }
    add(month, day(1, 28), 'expense', 'cat-transport', 'Combustível', between(180, 260));
    add(month, day(1, 28), 'expense', 'cat-transport', 'Transporte por app', between(22, 64));
    add(month, day(1, 28), 'expense', 'cat-transport', 'Transporte por app', between(18, 48));
    add(month, day(1, 28), 'expense', 'cat-leisure', 'Cinema', between(48, 90));
    add(month, day(1, 28), 'expense', 'cat-leisure', 'Bar com amigos', between(70, 160));
    if (random() > 0.4) {
      add(month, day(1, 28), 'expense', 'cat-health', 'Farmácia', between(35, 140));
    }
    if (random() > 0.5) {
      add(month, day(1, 28), 'expense', 'cat-shopping', 'Roupas', between(120, 320));
    }
    if (index === 1 || index === 4) {
      add(month, day(1, 28), 'expense', 'cat-education', 'Curso online', between(180, 390));
    }
  });

  // Make the current month interesting: one budget blown, notes on a few entries.
  add(
    currentMonth,
    20,
    'expense',
    'cat-leisure',
    'Ingressos para show',
    340,
    'Dois ingressos, pista',
  );
  add(currentMonth, 12, 'expense', 'cat-health', 'Consulta odontológica', 250, 'Limpeza semestral');
  add(currentMonth, 16, 'expense', 'cat-shopping', 'Fone de ouvido', 289.9);

  transactions.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  return {
    version: FINANCE_DATA_VERSION,
    transactions,
    categories: [...DEFAULT_CATEGORIES],
    budgets: [...DEMO_BUDGETS],
  };
}
