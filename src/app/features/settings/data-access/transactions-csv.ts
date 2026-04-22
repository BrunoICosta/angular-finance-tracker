import { Category, Transaction, TransactionDraft, TransactionType } from '../../../core/models';
import { createId } from '../../../shared/utils/id';
import { parseAmount, toCents } from '../../../shared/utils/money';
import { isValidIsoDate } from '../../../shared/utils/month';
import { normalizeName } from '../../../shared/utils/text';
import { parseCsv, serializeCsv } from './csv';

/** Column order of the exported file. Headers are in Portuguese, like the UI. */
export const CSV_HEADERS = [
  'data',
  'descricao',
  'valor',
  'tipo',
  'categoria',
  'observacoes',
] as const;
type CsvColumn = (typeof CSV_HEADERS)[number];

/** Accepted header names (normalized) for each column, so files from other tools also work. */
const HEADER_ALIASES: Record<CsvColumn, readonly string[]> = {
  data: ['data', 'date'],
  descricao: ['descricao', 'description', 'descr', 'historico'],
  valor: ['valor', 'amount', 'value', 'quantia'],
  tipo: ['tipo', 'type'],
  categoria: ['categoria', 'category'],
  observacoes: ['observacoes', 'observacao', 'notes', 'notas', 'obs'],
};

const TYPE_LABELS: Record<TransactionType, string> = { income: 'receita', expense: 'despesa' };
const TYPE_ALIASES: Record<string, TransactionType> = {
  receita: 'income',
  entrada: 'income',
  income: 'income',
  despesa: 'expense',
  saida: 'expense',
  expense: 'expense',
};

const NEW_CATEGORY_COLORS = ['#5f7d8c', '#2f80ed', '#14a89c', '#e8772e', '#9b51e0', '#c99a06'];

export interface CsvImportError {
  /** 1-based line number in the file (the header is line 1). */
  readonly line: number;
  readonly message: string;
}

export interface CsvImportResult {
  readonly transactions: TransactionDraft[];
  /** Categories referenced by the file that do not exist yet. */
  readonly newCategories: Category[];
  readonly errors: CsvImportError[];
}

export class CsvFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsvFormatError';
  }
}

/** Serializes transactions as `;`-separated CSV with decimal commas, as Excel pt-BR expects. */
export function transactionsToCsv(
  transactions: readonly Transaction[],
  categoryById: ReadonlyMap<string, Category>,
): string {
  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map((transaction) => [
      transaction.date,
      transaction.description,
      (transaction.amountCents / 100).toFixed(2).replace('.', ','),
      TYPE_LABELS[transaction.type],
      categoryById.get(transaction.categoryId)?.name ?? '',
      transaction.notes ?? '',
    ]);
  return serializeCsv([[...CSV_HEADERS], ...rows], ';');
}

/**
 * Parses a CSV file into transaction drafts. Invalid rows are reported (not thrown) so a single
 * bad line does not block the rest. Throws `CsvFormatError` only when the file is unusable.
 */
export function csvToTransactions(
  text: string,
  existingCategories: readonly Category[],
): CsvImportResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new CsvFormatError('O arquivo está vazio.');
  }
  const columns = mapHeader(rows[0]);
  const missing = (['data', 'descricao', 'valor'] as const).filter((column) => columns[column] < 0);
  if (missing.length) {
    throw new CsvFormatError(`Colunas obrigatórias ausentes: ${missing.join(', ')}.`);
  }

  const categoriesByKey = new Map(
    existingCategories.map((category) => [categoryKey(category.name, category.type), category]),
  );
  const newCategories: Category[] = [];
  const transactions: TransactionDraft[] = [];
  const errors: CsvImportError[] = [];

  rows.slice(1).forEach((row, index) => {
    const line = index + 2;
    const cell = (column: CsvColumn): string =>
      columns[column] >= 0 ? (row[columns[column]] ?? '').trim() : '';

    const date = parseDate(cell('data'));
    if (!date) {
      errors.push({ line, message: `Data inválida: "${cell('data')}".` });
      return;
    }
    const description = cell('descricao');
    if (!description) {
      errors.push({ line, message: 'Descrição vazia.' });
      return;
    }
    const amount = parseAmount(cell('valor'));
    if (amount === null || amount === 0) {
      errors.push({ line, message: `Valor inválido: "${cell('valor')}".` });
      return;
    }
    const rawType = normalizeName(cell('tipo'));
    let type: TransactionType;
    if (rawType) {
      const mapped = TYPE_ALIASES[rawType];
      if (!mapped) {
        errors.push({ line, message: `Tipo desconhecido: "${cell('tipo')}".` });
        return;
      }
      type = mapped;
    } else {
      // Bank statements usually have no type column: negative means money out.
      type = amount < 0 ? 'expense' : 'income';
    }

    const categoryName =
      cell('categoria') || (type === 'income' ? 'Outras receitas' : 'Outras despesas');
    const key = categoryKey(categoryName, type);
    let category = categoriesByKey.get(key);
    if (!category) {
      category = {
        id: createId(),
        name: categoryName.slice(0, 30),
        type,
        color: NEW_CATEGORY_COLORS[newCategories.length % NEW_CATEGORY_COLORS.length],
        icon: type === 'income' ? 'savings' : 'sell',
      };
      categoriesByKey.set(key, category);
      newCategories.push(category);
    }

    const notes = cell('observacoes');
    transactions.push({
      date,
      description: description.slice(0, 80),
      amountCents: toCents(Math.abs(amount)),
      type,
      categoryId: category.id,
      ...(notes ? { notes: notes.slice(0, 280) } : {}),
    });
  });

  return { transactions, newCategories, errors };
}

function mapHeader(header: readonly string[]): Record<CsvColumn, number> {
  const normalized = header.map((name) => normalizeName(name).replace(/[^a-z]/g, ''));
  const result = {} as Record<CsvColumn, number>;
  for (const column of CSV_HEADERS) {
    result[column] = normalized.findIndex((name) => HEADER_ALIASES[column].includes(name));
  }
  return result;
}

function categoryKey(name: string, type: TransactionType): string {
  return `${type}:${normalizeName(name)}`;
}

/** Accepts `YYYY-MM-DD` and `dd/MM/yyyy`; returns ISO or `null`. */
export function parseDate(value: string): string | null {
  if (isValidIsoDate(value)) {
    return value;
  }
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  if (!match) {
    return null;
  }
  const iso = `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
  return isValidIsoDate(iso) ? iso : null;
}
