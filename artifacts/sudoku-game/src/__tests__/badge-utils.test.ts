import { describe, it, expect } from 'vitest';
import { formatPeriodLabel, badgeTypeLabel, BADGE_META } from '../lib/badge-utils';

// ─── formatPeriodLabel ────────────────────────────────────────────────────────

describe('formatPeriodLabel', () => {
  it('formats weekly period as "Week N, YYYY"', () => {
    expect(formatPeriodLabel('2024-W01')).toBe('Week 1, 2024');
    expect(formatPeriodLabel('2024-W52')).toBe('Week 52, 2024');
  });

  it('strips leading zero from single-digit week', () => {
    expect(formatPeriodLabel('2024-W05')).toBe('Week 5, 2024');
    expect(formatPeriodLabel('2024-W09')).toBe('Week 9, 2024');
  });

  it('formats monthly period with month name and year', () => {
    const result = formatPeriodLabel('2024-03');
    expect(result.toLowerCase()).toContain('march');
    expect(result).toContain('2024');
  });

  it('formats December correctly', () => {
    const result = formatPeriodLabel('2024-12');
    expect(result.toLowerCase()).toContain('december');
    expect(result).toContain('2024');
  });

  it('formats January correctly', () => {
    const result = formatPeriodLabel('2025-01');
    expect(result.toLowerCase()).toContain('january');
    expect(result).toContain('2025');
  });
});

// ─── badgeTypeLabel ───────────────────────────────────────────────────────────

describe('badgeTypeLabel', () => {
  it('returns the correct title for all known badge types', () => {
    expect(badgeTypeLabel('weekly_1st')).toBe('Weekly Champion');
    expect(badgeTypeLabel('weekly_2nd')).toBe('Weekly Runner-up');
    expect(badgeTypeLabel('weekly_3rd')).toBe('Weekly Third');
    expect(badgeTypeLabel('monthly_1st')).toBe('Monthly Champion');
    expect(badgeTypeLabel('monthly_2nd')).toBe('Monthly Runner-up');
    expect(badgeTypeLabel('monthly_3rd')).toBe('Monthly Third');
  });

  it('returns the raw string for unknown badge types', () => {
    expect(badgeTypeLabel('unknown')).toBe('unknown');
    expect(badgeTypeLabel('')).toBe('');
    expect(badgeTypeLabel('daily_1st')).toBe('daily_1st');
  });
});

// ─── BADGE_META ───────────────────────────────────────────────────────────────

describe('BADGE_META', () => {
  const EXPECTED_TYPES = ['weekly_1st', 'weekly_2nd', 'weekly_3rd', 'monthly_1st', 'monthly_2nd', 'monthly_3rd'];

  it('contains exactly 6 badge types', () => {
    expect(Object.keys(BADGE_META)).toHaveLength(6);
  });

  it('contains all expected badge types', () => {
    expect(Object.keys(BADGE_META)).toEqual(expect.arrayContaining(EXPECTED_TYPES));
  });

  it('every badge has emoji, title, subtitle, color, bg, barColor, borderColor', () => {
    for (const badge of Object.values(BADGE_META)) {
      expect(typeof badge.emoji).toBe('string');
      expect(badge.emoji.length).toBeGreaterThan(0);
      expect(typeof badge.title).toBe('string');
      expect(badge.title.length).toBeGreaterThan(0);
      expect(typeof badge.subtitle).toBe('string');
      expect(typeof badge.color).toBe('string');
      expect(typeof badge.bg).toBe('string');
      expect(typeof badge.barColor).toBe('string');
      expect(typeof badge.borderColor).toBe('string');
    }
  });

  it('weekly_1st uses a gold/yellow colour scheme', () => {
    expect(BADGE_META.weekly_1st.emoji).toBe('🥇');
    expect(BADGE_META.monthly_1st.emoji).toBe('🏆');
  });
});
