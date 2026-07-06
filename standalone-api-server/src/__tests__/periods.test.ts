import { describe, it, expect } from 'vitest';
import {
  getWeekPeriod,
  getMonthPeriod,
  getWeekRange,
  getMonthRange,
  formatPeriodLabel,
  getPreviousWeekPeriod,
  getNthPreviousWeekPeriod,
  getPreviousMonthPeriod,
} from '../utils/periods';

// ─── getWeekPeriod ────────────────────────────────────────────────────────────

describe('getWeekPeriod', () => {
  it('returns YYYY-Www format', () => {
    expect(getWeekPeriod(new Date('2024-01-08'))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('pads single-digit week numbers', () => {
    expect(getWeekPeriod(new Date('2024-01-01'))).toBe('2024-W01');
  });

  it('returns the correct ISO week for known dates', () => {
    // 2024-01-01 is Monday of week 1 2024
    expect(getWeekPeriod(new Date('2024-01-01'))).toBe('2024-W01');
    // 2024-01-08 is Monday of week 2 2024
    expect(getWeekPeriod(new Date('2024-01-08'))).toBe('2024-W02');
    // 2025-12-29 is in week 1 of 2026 per ISO
    expect(getWeekPeriod(new Date('2025-12-29'))).toBe('2026-W01');
  });

  it('is stable across the same week', () => {
    const mon = getWeekPeriod(new Date('2024-03-11'));
    const fri = getWeekPeriod(new Date('2024-03-15'));
    const sun = getWeekPeriod(new Date('2024-03-17'));
    expect(mon).toBe(fri);
    expect(fri).toBe(sun);
  });
});

// ─── getMonthPeriod ───────────────────────────────────────────────────────────

describe('getMonthPeriod', () => {
  it('returns YYYY-MM format', () => {
    expect(getMonthPeriod(new Date('2024-03-15'))).toBe('2024-03');
  });

  it('pads single-digit months', () => {
    expect(getMonthPeriod(new Date('2024-01-31'))).toBe('2024-01');
    expect(getMonthPeriod(new Date('2024-09-01'))).toBe('2024-09');
  });

  it('returns 12 for December', () => {
    expect(getMonthPeriod(new Date('2024-12-25'))).toBe('2024-12');
  });
});

// ─── getWeekRange ─────────────────────────────────────────────────────────────

describe('getWeekRange', () => {
  it('spans exactly 7 days', () => {
    const { start, end } = getWeekRange('2024-W10');
    const diffMs = end.getTime() - start.getTime();
    expect(diffMs).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('round-trips with getWeekPeriod (start → period → start)', () => {
    const periods = ['2024-W01', '2024-W10', '2024-W52'];
    for (const period of periods) {
      const { start } = getWeekRange(period);
      expect(getWeekPeriod(start)).toBe(period);
    }
  });

  it('end is after start', () => {
    const { start, end } = getWeekRange('2024-W05');
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});

// ─── getMonthRange ────────────────────────────────────────────────────────────

describe('getMonthRange', () => {
  it('January: start is Jan 1, end is Feb 1', () => {
    const { start, end } = getMonthRange('2024-01');
    expect(start.getUTCFullYear()).toBe(2024);
    expect(start.getUTCMonth()).toBe(0);
    expect(start.getUTCDate()).toBe(1);
    expect(end.getUTCMonth()).toBe(1);
    expect(end.getUTCDate()).toBe(1);
  });

  it('December rolls end into next year', () => {
    const { end } = getMonthRange('2024-12');
    expect(end.getUTCFullYear()).toBe(2025);
    expect(end.getUTCMonth()).toBe(0);
    expect(end.getUTCDate()).toBe(1);
  });

  it('end is after start', () => {
    const { start, end } = getMonthRange('2024-06');
    expect(end.getTime()).toBeGreaterThan(start.getTime());
  });
});

// ─── formatPeriodLabel ────────────────────────────────────────────────────────

describe('formatPeriodLabel', () => {
  it('formats weekly periods as "Week N, YYYY"', () => {
    expect(formatPeriodLabel('2024-W01')).toBe('Week 1, 2024');
    expect(formatPeriodLabel('2024-W05')).toBe('Week 5, 2024');
    expect(formatPeriodLabel('2024-W52')).toBe('Week 52, 2024');
  });

  it('strips leading zeros from week number', () => {
    expect(formatPeriodLabel('2024-W05')).toBe('Week 5, 2024');
  });

  it('formats monthly periods with month name and year', () => {
    const result = formatPeriodLabel('2024-03');
    expect(result.toLowerCase()).toContain('march');
    expect(result).toContain('2024');
  });

  it('formats December correctly', () => {
    const result = formatPeriodLabel('2024-12');
    expect(result.toLowerCase()).toContain('december');
    expect(result).toContain('2024');
  });
});

// ─── getPreviousWeekPeriod / getNthPreviousWeekPeriod ─────────────────────────

describe('getPreviousWeekPeriod', () => {
  it('returns a valid week period string', () => {
    expect(getPreviousWeekPeriod()).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('is one week behind getNthPreviousWeekPeriod(1)', () => {
    expect(getPreviousWeekPeriod()).toBe(getNthPreviousWeekPeriod(1));
  });
});

describe('getNthPreviousWeekPeriod', () => {
  it('n=0 returns current week', () => {
    const now = getWeekPeriod(new Date());
    expect(getNthPreviousWeekPeriod(0)).toBe(now);
  });

  it('returns valid format for various n', () => {
    for (const n of [1, 2, 4, 10]) {
      expect(getNthPreviousWeekPeriod(n)).toMatch(/^\d{4}-W\d{2}$/);
    }
  });
});

// ─── getPreviousMonthPeriod ───────────────────────────────────────────────────

describe('getPreviousMonthPeriod', () => {
  it('returns a valid month period string', () => {
    expect(getPreviousMonthPeriod()).toMatch(/^\d{4}-\d{2}$/);
  });
});
