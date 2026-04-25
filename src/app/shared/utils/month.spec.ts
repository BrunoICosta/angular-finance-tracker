import {
  addMonths,
  fromIsoDate,
  isValidIsoDate,
  lastMonths,
  monthKeyOf,
  toIsoDate,
  toMonthKey,
} from './month';

describe('month utils', () => {
  it('builds month keys from local dates', () => {
    expect(toMonthKey(new Date(2026, 0, 31))).toBe('2026-01');
    expect(monthKeyOf('2026-04-15')).toBe('2026-04');
  });

  it('adds months across year boundaries', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2025-12', 1)).toBe('2026-01');
    expect(addMonths('2026-04', 0)).toBe('2026-04');
  });

  it('lists the last N months oldest first', () => {
    expect(lastMonths('2026-02', 4)).toEqual(['2025-11', '2025-12', '2026-01', '2026-02']);
  });

  it('round-trips ISO dates without time zone shifts', () => {
    const date = fromIsoDate('2026-04-01');
    expect(date.getDate()).toBe(1);
    expect(date.getMonth()).toBe(3);
    expect(toIsoDate(date)).toBe('2026-04-01');
  });

  it('validates real calendar dates', () => {
    expect(isValidIsoDate('2026-02-28')).toBeTrue();
    expect(isValidIsoDate('2026-02-30')).toBeFalse();
    expect(isValidIsoDate('26-02-01')).toBeFalse();
  });
});
