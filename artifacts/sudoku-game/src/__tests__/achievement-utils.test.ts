import { describe, it, expect } from 'vitest';
import { ACHIEVEMENT_META } from '../lib/achievement-utils';

describe('ACHIEVEMENT_META', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(ACHIEVEMENT_META)).toBe(true);
    expect(ACHIEVEMENT_META.length).toBeGreaterThan(0);
  });

  it('contains achievements for both sudoku and memory games', () => {
    const games = new Set(ACHIEVEMENT_META.map(a => a.game));
    expect(games).toContain('sudoku');
    expect(games).toContain('memory');
  });

  it('all achievements have required string fields', () => {
    for (const a of ACHIEVEMENT_META) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.emoji).toBe('string');
      expect(typeof a.title).toBe('string');
      expect(typeof a.description).toBe('string');
      expect(typeof a.group).toBe('string');
    }
  });

  it('all achievements have non-empty fields', () => {
    for (const a of ACHIEVEMENT_META) {
      expect(a.id.length).toBeGreaterThan(0);
      expect(a.emoji.length).toBeGreaterThan(0);
      expect(a.title.length).toBeGreaterThan(0);
      expect(a.description.length).toBeGreaterThan(0);
      expect(a.group.length).toBeGreaterThan(0);
    }
  });

  it('all game values are exactly "sudoku" or "memory"', () => {
    for (const a of ACHIEVEMENT_META) {
      expect(['sudoku', 'memory']).toContain(a.game);
    }
  });

  it('all achievement IDs are unique', () => {
    const ids = ACHIEVEMENT_META.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes key sudoku milestone achievements', () => {
    const ids = ACHIEVEMENT_META.map(a => a.id);
    expect(ids).toContain('first_win');
    expect(ids).toContain('dedicated');
    expect(ids).toContain('century');
  });

  it('includes key skill-based achievements', () => {
    const ids = ACHIEVEMENT_META.map(a => a.id);
    expect(ids).toContain('perfectionist');
    expect(ids).toContain('no_hints');
    expect(ids).toContain('speed_demon');
  });

  it('includes memory match milestone achievements', () => {
    const ids = ACHIEVEMENT_META.map(a => a.id);
    expect(ids).toContain('memory_first_win');
    expect(ids).toContain('memory_dedicated');
  });

  it('sudoku achievements belong to logical groups', () => {
    const sudokuGroups = new Set(
      ACHIEVEMENT_META.filter(a => a.game === 'sudoku').map(a => a.group)
    );
    expect(sudokuGroups).toContain('Milestones');
    expect(sudokuGroups).toContain('Difficulty');
    expect(sudokuGroups).toContain('Skill');
  });
});
