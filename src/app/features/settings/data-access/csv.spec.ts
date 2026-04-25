import { detectDelimiter, escapeCsvField, parseCsv, serializeCsv } from './csv';

describe('csv', () => {
  it('escapes fields only when needed', () => {
    expect(escapeCsvField('simple', ';')).toBe('simple');
    expect(escapeCsvField('a;b', ';')).toBe('"a;b"');
    expect(escapeCsvField('a,b', ';')).toBe('a,b');
    expect(escapeCsvField('say "hi"', ',')).toBe('"say ""hi"""');
    expect(escapeCsvField('two\nlines', ',')).toBe('"two\nlines"');
  });

  it('round-trips tricky values', () => {
    const rows = [
      ['data', 'descricao'],
      ['2026-04-01', 'Café; pão e "manteiga"'],
      ['2026-04-02', 'linha 1\nlinha 2'],
    ];
    expect(parseCsv(serializeCsv(rows, ';'), ';')).toEqual(rows);
  });

  it('detects the delimiter from the header', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
    expect(detectDelimiter('"a;b",c\n1,2')).toBe(',');
  });

  it('handles CRLF, a BOM and blank lines', () => {
    const text = String.fromCharCode(0xfeff) + 'a,b\r\n1,2\r\n\r\n3,4\r\n';
    expect(parseCsv(text)).toEqual([
      ['a', 'b'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('keeps empty trailing fields', () => {
    expect(parseCsv('a;b;c\n1;;')).toEqual([
      ['a', 'b', 'c'],
      ['1', '', ''],
    ]);
  });
});
