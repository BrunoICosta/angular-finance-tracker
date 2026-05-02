import { AppLang } from '../../../core/i18n/language';
import { Category, Transaction, TransactionDraft, TransactionType } from '../../../core/models';
import { createId } from '../../../shared/utils/id';
import { parseAmount, toCents } from '../../../shared/utils/money';
import { isValidIsoDate } from '../../../shared/utils/month';
import { normalizeName } from '../../../shared/utils/text';
import { CsvDelimiter, parseCsv, serializeCsv } from './csv';

/** Internal column ids, in the order of the exported file. */
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

interface CsvFormat {
  readonly headers: Readonly<Record<CsvColumn, string>>;
  readonly types: Readonly<Record<TransactionType, string>>;
  readonly delimiter: CsvDelimiter;
  readonly decimal: ',' | '.';
}

/**
 * The export follows the UI language: Portuguese uses `;` and a decimal comma (what Excel pt-BR
 * expects), English uses `,` and a decimal point. The importer accepts both.
 */
export const CSV_FORMATS: Readonly<Record<AppLang, CsvFormat>> = {
  'pt-BR': {
    headers: {
      data: 'data',
      descricao: 'descricao',
      valor: 'valor',
      tipo: 'tipo',
      categoria: 'categoria',
      observacoes: 'observacoes',
    },
    types: { income: 'receita', expense: 'despesa' },
    delimiter: ';',
    decimal: ',',
  },
  en: {
    headers: {
      data: 'date',
      descricao: 'description',
      valor: 'amount',
      tipo: 'type',
      categoria: 'category',
      observacoes: 'notes',
    },
    types: { income: 'income', expense: 'expense' },
    delimiter: ',',
    decimal: '.',
  },
};

/** Header line shown in the UI as a hint, e.g. `data;descricao;valor;...`. */
export function csvHeaderLine(lang: AppLang): string {
  const format = CSV_FORMATS[lang];
  return CSV_HEADERS.map((column) => format.headers[column]).join(format.delimiter);
}
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
  /** Translation key (settings scope) and its params. */
  readonly key: string;
  readonly params?: Record<string, string>;
}

export interface CsvImportOptions {
  /** Names used for rows without a category, in the current language. */
  readonly fallbackCategoryNames?: Readonly<Record<TransactionType, string>>;
}

export interface CsvImportResult {
  readonly transactions: TransactionDraft[];
  /** Categories referenced by the file that do not exist yet. */
  readonly newCategories: Category[];
  readonly errors: CsvImportError[];
}

/** The file cannot be used at all. `key` is a translation key of the settings scope. */
export class CsvFormatError extends Error {
  constructor(
    readonly key: string,
    readonly params: Record<string, string> = {},
  ) {
    super(key);
    this.name = 'CsvFormatError';
  }
}

/** Serializes transactions as CSV in the format of the given language. */
export function transactionsToCsv(
  transactions: readonly Transaction[],
  categoryById: ReadonlyMap<string, Category>,
  lang: AppLang = 'pt-BR',
): string {
  const format = CSV_FORMATS[lang];
  const rows = [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
    .map((transaction) => [
      transaction.date,
      transaction.description,
      (transaction.amountCents / 100).toFixed(2).replace('.', format.decimal),
      format.types[transaction.type],
      categoryById.get(transaction.categoryId)?.name ?? '',
      transaction.notes ?? '',
    ]);
  const header = CSV_HEADERS.map((column) => format.headers[column]);
  return serializeCsv([header, ...rows], format.delimiter);
}

/**
 * Parses a CSV file into transaction drafts. Invalid rows are reported (not thrown) so a single
 * bad line does not block the rest. Throws `CsvFormatError` only when the file is unusable.
 */
export function csvToTransactions(
  text: string,
  existingCategories: readonly Category[],
  options: CsvImportOptions = {},
): CsvImportResult {
  const fallbackNames = options.fallbackCategoryNames ?? {
    income: 'Outras receitas',
    expense: 'Outras despesas',
  };
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new CsvFormatError('settings.import.errors.empty');
  }
  const columns = mapHeader(rows[0]);
  const missing = (['data', 'descricao', 'valor'] as const).filter((column) => columns[column] < 0);
  if (missing.length) {
    throw new CsvFormatError('settings.import.errors.missingColumns', {
      columns: missing.join(', '),
    });
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
      errors.push({ line, key: 'settings.import.errors.date', params: { value: cell('data') } });
      return;
    }
    const description = cell('descricao');
    if (!description) {
      errors.push({ line, key: 'settings.import.errors.description' });
      return;
    }
    const amount = parseAmount(cell('valor'));
    if (amount === null || amount === 0) {
      errors.push({ line, key: 'settings.import.errors.amount', params: { value: cell('valor') } });
      return;
    }
    const rawType = normalizeName(cell('tipo'));
    let type: TransactionType;
    if (rawType) {
      const mapped = TYPE_ALIASES[rawType];
      if (!mapped) {
        errors.push({ line, key: 'settings.import.errors.type', params: { value: cell('tipo') } });
        return;
      }
      type = mapped;
    } else {
      // Bank statements usually have no type column: negative means money out.
      type = amount < 0 ? 'expense' : 'income';
    }

    const categoryName = cell('categoria') || fallbackNames[type];
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
