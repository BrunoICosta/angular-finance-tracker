/**
 * Minimal RFC 4180 CSV reader/writer: quoted fields, escaped quotes (`""`),
 * delimiters and line breaks inside quotes, CRLF or LF line endings.
 */

export type CsvDelimiter = ',' | ';';

export function escapeCsvField(value: string, delimiter: CsvDelimiter): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    /[\r\n]/.test(value) ||
    /^\s|\s$/.test(value);
  return needsQuotes ? `"${value.replace(/"/g, '""')}"` : value;
}

export function serializeCsv(
  rows: readonly (readonly string[])[],
  delimiter: CsvDelimiter,
): string {
  return rows
    .map((row) => row.map((field) => escapeCsvField(field, delimiter)).join(delimiter))
    .join('\r\n');
}

/** Picks `;` or `,` by counting them on the header line (outside quotes). */
export function detectDelimiter(text: string): CsvDelimiter {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  let semicolons = 0;
  let commas = 0;
  let quoted = false;
  for (const char of firstLine) {
    if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ';') {
      semicolons++;
    } else if (!quoted && char === ',') {
      commas++;
    }
  }
  return semicolons >= commas && semicolons > 0 ? ';' : ',';
}

/** Parses CSV text into rows of fields. Blank lines are skipped. */
export function parseCsv(
  text: string,
  delimiter: CsvDelimiter = detectDelimiter(text),
): string[][] {
  const source = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  const pushRow = (): void => {
    row.push(field);
    if (row.some((value) => value.trim() !== '')) {
      rows.push(row);
    }
    row = [];
    field = '';
  };

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') {
        i++;
      }
      pushRow();
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) {
    pushRow();
  }
  return rows;
}
