import { describe, it, expect } from 'vitest';
import { getLevelFromXp, LEVEL_TIERS } from '../lib/levels';

describe('LEVEL_TIERS', () => {
  it('has 16 tiers', () => {
    expect(LEVEL_TIERS).toHaveLength(16);
  });

  it('starts at Iron with 0 XP', () => {
    expect(LEVEL_TIERS[0].name).toBe('Iron');
    expect(LEVEL_TIERS[0].minXp).toBe(0);
  });

  it('ends at Immortal', () => {
    expect(LEVEL_TIERS[LEVEL_TIERS.length - 1].name).toBe('Immortal');
  });

  it('minXp values are strictly increasing', () => {
    for (let i = 1; i < LEVEL_TIERS.length; i++) {
      expect(LEVEL_TIERS[i].minXp).toBeGreaterThan(LEVEL_TIERS[i - 1].minXp);
    }
  });
});

describe('getLevelFromXp', () => {
  it('returns Iron at 0 XP', () => {
    const r = getLevelFromXp(0);
    expect(r.name).toBe('Iron');
    expect(r.index).toBe(0);
  });

  it('transitions exactly at each tier boundary', () => {
    const boundaries = [
      [0, 'Iron'], [50, 'Bronze'], [150, 'Silver'], [300, 'Gold'],
      [500, 'Ruby'], [800, 'Sapphire'], [1200, 'Emerald'], [1800, 'Platinum'],
      [2500, 'Diamond'], [3500, 'Champion'], [5000, 'Titan'], [7000, 'Master'],
      [10000, 'Grandmaster'], [14000, 'Legend'], [20000, 'Mythic'], [28000, 'Immortal'],
    ] as const;
    for (const [xp, name] of boundaries) {
      expect(getLevelFromXp(xp).name).toBe(name);
    }
  });

  it('stays in previous tier just below boundary', () => {
    expect(getLevelFromXp(49).name).toBe('Iron');
    expect(getLevelFromXp(149).name).toBe('Bronze');
    expect(getLevelFromXp(299).name).toBe('Silver');
  });

  it('calculates 50% progress midway between tiers', () => {
    // Iron 0→50: midpoint = 25 → progress = 50%
    expect(getLevelFromXp(25).progress).toBe(50);
  });

  it('returns 100 progress and null nextTier at max tier', () => {
    const r = getLevelFromXp(999999);
    expect(r.progress).toBe(100);
    expect(r.nextTier).toBeNull();
  });

  it('provides correct nextTier for intermediate tiers', () => {
    const r = getLevelFromXp(0);
    expect(r.nextTier?.name).toBe('Bronze');
  });

  it('index matches tier position in LEVEL_TIERS', () => {
    for (let i = 0; i < LEVEL_TIERS.length; i++) {
      expect(getLevelFromXp(LEVEL_TIERS[i].minXp).index).toBe(i);
    }
  });

  it('progress is clamped to [0, 100]', () => {
    for (const xp of [0, 25, 50, 300, 5000, 99999]) {
      const r = getLevelFromXp(xp);
      expect(r.progress).toBeGreaterThanOrEqual(0);
      expect(r.progress).toBeLessThanOrEqual(100);
    }
  });
});
