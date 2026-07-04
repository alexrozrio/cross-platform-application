import { describe, it, expect } from 'vitest';
import { getLevelFromXp, LEVEL_TIERS, XP_PER_DIFFICULTY } from '../utils/levels';

// ─── LEVEL_TIERS ──────────────────────────────────────────────────────────────

describe('LEVEL_TIERS', () => {
  it('has 16 tiers', () => {
    expect(LEVEL_TIERS).toHaveLength(16);
  });

  it('first tier starts at 0 XP', () => {
    expect(LEVEL_TIERS[0].minXp).toBe(0);
    expect(LEVEL_TIERS[0].name).toBe('Iron');
  });

  it('last tier is Immortal', () => {
    expect(LEVEL_TIERS[LEVEL_TIERS.length - 1].name).toBe('Immortal');
  });

  it('minXp is strictly increasing', () => {
    for (let i = 1; i < LEVEL_TIERS.length; i++) {
      expect(LEVEL_TIERS[i].minXp).toBeGreaterThan(LEVEL_TIERS[i - 1].minXp);
    }
  });

  it('every tier has required style fields', () => {
    for (const tier of LEVEL_TIERS) {
      expect(typeof tier.color).toBe('string');
      expect(typeof tier.textColor).toBe('string');
      expect(typeof tier.ring).toBe('string');
      expect(tier.color.length).toBeGreaterThan(0);
    }
  });
});

// ─── getLevelFromXp ───────────────────────────────────────────────────────────

describe('getLevelFromXp', () => {
  it('returns Iron at 0 XP', () => {
    const r = getLevelFromXp(0);
    expect(r.name).toBe('Iron');
    expect(r.index).toBe(0);
  });

  it('transitions to Bronze at exactly 50 XP', () => {
    expect(getLevelFromXp(49).name).toBe('Iron');
    expect(getLevelFromXp(50).name).toBe('Bronze');
  });

  it('matches every tier boundary', () => {
    const expected = [
      [0, 'Iron'], [50, 'Bronze'], [150, 'Silver'], [300, 'Gold'],
      [500, 'Ruby'], [800, 'Sapphire'], [1200, 'Emerald'], [1800, 'Platinum'],
      [2500, 'Diamond'], [3500, 'Champion'], [5000, 'Titan'], [7000, 'Master'],
      [10000, 'Grandmaster'], [14000, 'Legend'], [20000, 'Mythic'], [28000, 'Immortal'],
    ] as const;
    for (const [xp, name] of expected) {
      expect(getLevelFromXp(xp).name).toBe(name);
    }
  });

  it('calculates correct progress midway between tiers', () => {
    // Iron 0→50: at xp=25 → 50%
    expect(getLevelFromXp(25).progress).toBe(50);
    // Bronze 50→150: at xp=100 → 50%
    expect(getLevelFromXp(100).progress).toBe(50);
  });

  it('returns progress=100 and nextTier=null at max tier', () => {
    const r = getLevelFromXp(999999);
    expect(r.name).toBe('Immortal');
    expect(r.progress).toBe(100);
    expect(r.nextTier).toBeNull();
  });

  it('returns a valid nextTier for non-max tiers', () => {
    const r = getLevelFromXp(0);
    expect(r.nextTier).not.toBeNull();
    expect(r.nextTier?.name).toBe('Bronze');
    expect(r.nextTier?.minXp).toBe(50);
  });

  it('index matches position in LEVEL_TIERS', () => {
    const r = getLevelFromXp(1200); // Emerald is index 6
    expect(r.index).toBe(6);
  });

  it('clamps progress to 100 even at high XP within a tier', () => {
    // just below the next boundary keeps progress < 100 (or = 100 if right at boundary)
    const r = getLevelFromXp(299); // Gold is at 300, so still Silver
    expect(r.name).toBe('Silver');
    expect(r.progress).toBeLessThanOrEqual(100);
  });
});

// ─── XP_PER_DIFFICULTY ────────────────────────────────────────────────────────

describe('XP_PER_DIFFICULTY', () => {
  it('assigns correct XP per difficulty', () => {
    expect(XP_PER_DIFFICULTY.easy).toBe(1);
    expect(XP_PER_DIFFICULTY.medium).toBe(2);
    expect(XP_PER_DIFFICULTY.hard).toBe(3);
    expect(XP_PER_DIFFICULTY.expert).toBe(5);
  });

  it('is strictly increasing', () => {
    const { easy, medium, hard, expert } = XP_PER_DIFFICULTY;
    expect(medium).toBeGreaterThan(easy);
    expect(hard).toBeGreaterThan(medium);
    expect(expert).toBeGreaterThan(hard);
  });
});
