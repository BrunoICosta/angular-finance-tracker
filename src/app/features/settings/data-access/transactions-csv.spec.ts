import { Category, Transaction } from '../../../core/models';
import {
  CsvFormatError,
  csvToTransactions,
  parseDate,
  transactionsToCsv,
} from './transactions-csv';

const categories: Category[] = [
  { id: 'food', name: 'Alimentação', type: 'expense', color: '#f00', icon: 'x' },
  { id: 'salary', name: 'Salário', type: 'income', color: '#0f0', icon: 'x' },
];
const categoryById = new Map(categories.map((category) => [category.id, category]));

describe('transactions csv', () => {
  it('exports with Portuguese headers, ; separator and decimal comma', () => {
    const transactions: Transaction[] = [
      {
        id: '2',
        description: 'Mercado; feira',
        amountCents: 123456,
        date: '2026-04-10',
        type: 'expense',
        categoryId: 'food',
        notes: 'com "desconto"',
        createdAt: '2026-04-10T10:00:00.000Z',
      },
      {
        id: '1',
        description: 'Salário',
        amountCents: 500000,
        date: '2026-04-05',
        type: 'income',
        categoryId: 'salary',
        createdAt: '2026-04-05T10:00:00.000Z',
      },
    ];
    const lines = transactionsToCsv(transactions, categoryById).split('\r\n');
    expect(lines).toEqual([
      'data;descricao;valor;tipo;categoria;observacoes',
      '2026-04-05;Salário;5000,00;receita;Salário;',
      '2026-04-10;"Mercado; feira";1234,56;despesa;Alimentação;"com ""desconto"""',
    ]);
  });

  it('imports its own export (round trip)', () => {
    const csv = [
      'data;descricao;valor;tipo;categoria;observacoes',
      '2026-04-10;Mercado;1234,56;despesa;alimentacao;feira',
    ].join('\n');
    const result = csvToTransactions(csv, categories);
    expect(result.errors).toEqual([]);
    expect(result.newCategories).toEqual([]);
    expect(result.transactions).toEqual([
      {
        date: '2026-04-10',
        description: 'Mercado',
        amountCents: 123456,
        type: 'expense',
        categoryId: 'food',
        notes: 'feira',
      },
    ]);
  });

  it('accepts bank-like files: comma separator, br dates, signed amounts, no type', () => {
    const csv = [
      'Data,Descrição,Valor,Categoria',
      '05/04/2026,Padaria,"-12,50",Alimentação',
      '06/04/2026,Reembolso,300.00,',
      '07/04/2026,Pet shop,-89.9,Pets',
    ].join('\n');
    const result = csvToTransactions(csv, categories);
    expect(result.errors).toEqual([]);
    expect(result.transactions.map((item) => [item.type, item.amountCents])).toEqual([
      ['expense', 1250],
      ['income', 30000],
      ['expense', 8990],
    ]);
    // "Pets" (expense) and the income fallback category are created once each.
    expect(result.newCategories.map((category) => [category.name, category.type])).toEqual([
      ['Outras receitas', 'income'],
      ['Pets', 'expense'],
    ]);
    expect(result.transactions[2].categoryId).toBe(result.newCategories[1].id);
  });

  it('reports invalid rows with their line numbers and keeps the valid ones', () => {
    const csv = [
      'data;descricao;valor;tipo',
      '2026-02-30;Data ruim;10;despesa',
      '2026-04-01;;10;despesa',
      '2026-04-01;Valor ruim;abc;despesa',
      '2026-04-01;Tipo ruim;10;transferencia',
      '2026-04-01;Ok;10;despesa',
    ].join('\n');
    const result = csvToTransactions(csv, categories);
    expect(result.transactions.length).toBe(1);
    expect(result.errors.map((error) => error.line)).toEqual([2, 3, 4, 5]);
  });

  it('rejects files without the required columns', () => {
    expect(() => csvToTransactions('nome;preco\nx;1', categories)).toThrowError(CsvFormatError);
    expect(() => csvToTransactions('', categories)).toThrowError(CsvFormatError);
  });

  it('parses ISO and Brazilian dates', () => {
    expect(parseDate('2026-04-01')).toBe('2026-04-01');
    expect(parseDate('1/4/2026')).toBe('2026-04-01');
    expect(parseDate('31/04/2026')).toBeNull();
    expect(parseDate('April 1')).toBeNull();
  });

  it('exports in the English format when asked', () => {
    const transactions: Transaction[] = [
      {
        id: '1',
        description: 'Groceries',
        amountCents: 123456,
        date: '2026-04-10',
        type: 'expense',
        categoryId: 'food',
        createdAt: '2026-04-10T10:00:00.000Z',
      },
    ];
    const csv = transactionsToCsv(transactions, categoryById, 'en');
    expect(csv.split('\r\n')).toEqual([
      'date,description,amount,type,category,notes',
      '2026-04-10,Groceries,1234.56,expense,Alimentação,',
    ]);
    // ...and the importer reads it back.
    const result = csvToTransactions(csv, categories);
    expect(result.errors).toEqual([]);
    expect(result.transactions[0].amountCents).toBe(123456);
    expect(result.transactions[0].categoryId).toBe('food');
  });

  it('reports errors as translation keys', () => {
    const result = csvToTransactions('date,description,amount\nxx,Ok,10', categories);
    expect(result.errors).toEqual([
      { line: 2, key: 'settings.import.errors.date', params: { value: 'xx' } },
    ]);
  });
});
