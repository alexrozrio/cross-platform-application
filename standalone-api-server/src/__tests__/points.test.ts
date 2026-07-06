import { describe, it, expect } from 'vitest';
import { calcPoints, calcGems } from '../utils/points';

// ─── calcPoints ────────────────────────────────────────────────────────────────

describe('calcPoints', () => {
  // Base: 9×9 easy = 1000pts, par = 900s
  // At par with no mistakes/hints → exactly base × 1.0
  it('returns base points at par time with no mistakes or hints', () => {
    expect(calcPoints(9, 'easy', 900, 0, 0)).toBe(1000);
  });

  it('applies max time bonus (50%) when elapsed is 0', () => {
    // base * (1 + 0.5) * 1 * 1 = 1500
    expect(calcPoints(9, 'easy', 0, 0, 0)).toBe(1500);
  });

  it('gives no time bonus when elapsed exceeds par', () => {
    const overPar = calcPoints(9, 'easy', 9999, 0, 0);
    expect(overPar).toBe(1000); // timeBonus clamped at 0
  });

  it('applies difficulty multiplier for medium (1.5×)', () => {
    expect(calcPoints(9, 'medium', 900, 0, 0)).toBe(1500);
  });

  it('applies difficulty multiplier for hard (2×)', () => {
    expect(calcPoints(9, 'hard', 900, 0, 0)).toBe(2000);
  });

  it('applies difficulty multiplier for expert (3×)', () => {
    expect(calcPoints(9, 'expert', 900, 0, 0)).toBe(3000);
  });

  it('applies mistake penalty (5% per mistake)', () => {
    const clean = calcPoints(9, 'easy', 900, 0, 0); // 1000
    const messy = calcPoints(9, 'easy', 900, 10, 0); // penalty = max(0.5, 1 - 0.5) = 0.5
    expect(messy).toBe(Math.round(clean * 0.5));
  });

  it('clamps mistake penalty floor at 0.5', () => {
    const p = calcPoints(9, 'easy', 900, 100, 0);
    expect(p).toBe(Math.round(1000 * 0.5));
  });

  it('applies hint penalty (10% per hint)', () => {
    const clean = calcPoints(9, 'easy', 900, 0, 0);
    const hinted = calcPoints(9, 'easy', 900, 0, 3); // penalty = max(0.7, 1 - 0.3) = 0.7
    expect(hinted).toBe(Math.round(clean * 0.7));
  });

  it('clamps hint penalty floor at 0.7', () => {
    const p = calcPoints(9, 'easy', 900, 0, 100);
    expect(p).toBe(Math.round(1000 * 0.7));
  });

  it('scales correctly for 16×16 expert at par', () => {
    // base = 2500 * 3.0 = 7500; par = 2700; at par → no time bonus
    expect(calcPoints(16, 'expert', 2700, 0, 0)).toBe(7500);
  });

  it('scales correctly for 4×4 medium', () => {
    // base = 250 * 1.5 = 375; par = 300; at par → 375
    expect(calcPoints(4, 'medium', 300, 0, 0)).toBe(375);
  });

  it('returns at least 10 points regardless of penalties', () => {
    expect(calcPoints(9, 'easy', 99999, 100, 100)).toBeGreaterThanOrEqual(10);
  });

  it('falls back to 1000 base for unknown gridSize', () => {
    expect(calcPoints(99, 'easy', 900, 0, 0)).toBe(1000);
  });

  it('falls back to 1.0 multiplier for unknown difficulty', () => {
    expect(calcPoints(9, 'unknown', 900, 0, 0)).toBe(1000);
  });

  it('combining time bonus and mistake penalty is multiplicative', () => {
    // elapsed=0 → timeBonus=0.5; mistakes=10 → mistakePenalty=0.5
    const p = calcPoints(9, 'easy', 0, 10, 0);
    expect(p).toBe(Math.round(1000 * 1.5 * 0.5 * 1.0));
  });
});

// ─── calcGems ─────────────────────────────────────────────────────────────────

describe('calcGems', () => {
  it('returns 1 gem for any points below 5000', () => {
    expect(calcGems(0)).toBe(1);
    expect(calcGems(1)).toBe(1);
    expect(calcGems(4999)).toBe(1);
  });

  it('returns 1 gem at exactly 5000 points', () => {
    expect(calcGems(5000)).toBe(1);
  });

  it('returns 2 gems at 10000 points', () => {
    expect(calcGems(10000)).toBe(2);
  });

  it('returns 3 gems at 15000 points', () => {
    expect(calcGems(15000)).toBe(3);
  });

  it('floors partial gem amounts', () => {
    expect(calcGems(7499)).toBe(1);
    expect(calcGems(9999)).toBe(1);
  });

  it('scales linearly with point multiples of 5000', () => {
    for (let mult = 1; mult <= 5; mult++) {
      expect(calcGems(mult * 5000)).toBe(mult);
    }
  });
});
