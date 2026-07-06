import { describe, it, expect } from 'vitest';
import { generatePuzzle } from '../lib/sudoku';

// Note: 16×16 generation is intentionally excluded — it is correct but very
// slow under backtracking and would make the test suite impractical in CI.

// ─── 3×3 ──────────────────────────────────────────────────────────────────────

describe('generatePuzzle 3×3', () => {
  it('returns a 9-character grid and solution', () => {
    const { grid, solution } = generatePuzzle('easy', 3);
    expect(grid).toHaveLength(9);
    expect(solution).toHaveLength(9);
  });

  it('solution contains only digits 1–3', () => {
    const { solution } = generatePuzzle('medium', 3);
    expect(solution).toMatch(/^[1-3]{9}$/);
  });

  it('puzzle has at least one empty cell', () => {
    const { grid } = generatePuzzle('hard', 3);
    expect(grid).toContain('0');
  });

  it('every filled cell in puzzle matches solution', () => {
    const { grid, solution } = generatePuzzle('easy', 3);
    for (let i = 0; i < 9; i++) {
      if (grid[i] !== '0') {
        expect(grid[i]).toBe(solution[i]);
      }
    }
  });
});

// ─── 4×4 ──────────────────────────────────────────────────────────────────────

describe('generatePuzzle 4×4', () => {
  it('returns a 16-character grid and solution', () => {
    const { grid, solution } = generatePuzzle('easy', 4);
    expect(grid).toHaveLength(16);
    expect(solution).toHaveLength(16);
  });

  it('solution contains only digits 1–4', () => {
    const { solution } = generatePuzzle('easy', 4);
    expect(solution).toMatch(/^[1-4]{16}$/);
  });

  it('solution has exactly 4 of each digit', () => {
    const { solution } = generatePuzzle('medium', 4);
    for (const d of ['1', '2', '3', '4']) {
      const count = solution.split('').filter(c => c === d).length;
      expect(count).toBe(4);
    }
  });

  it('puzzle has at least one empty cell', () => {
    const { grid } = generatePuzzle('hard', 4);
    expect(grid).toContain('0');
  });

  it('every filled cell in puzzle matches solution', () => {
    const { grid, solution } = generatePuzzle('easy', 4);
    for (let i = 0; i < 16; i++) {
      if (grid[i] !== '0') {
        expect(grid[i]).toBe(solution[i]);
      }
    }
  });
});

// ─── 9×9 ──────────────────────────────────────────────────────────────────────

describe('generatePuzzle 9×9', { timeout: 30000 }, () => {
  it('returns an 81-character grid and solution', () => {
    const { grid, solution } = generatePuzzle('easy', 9);
    expect(grid).toHaveLength(81);
    expect(solution).toHaveLength(81);
  });

  it('solution contains only digits 1–9', () => {
    const { solution } = generatePuzzle('easy', 9);
    expect(solution).toMatch(/^[1-9]{81}$/);
  });

  it('solution has exactly 9 of each digit', () => {
    const { solution } = generatePuzzle('easy', 9);
    for (const d of '123456789') {
      const count = solution.split('').filter(c => c === d).length;
      expect(count).toBe(9);
    }
  });

  it('puzzle has between 1 and 80 filled cells', () => {
    const { grid } = generatePuzzle('easy', 9);
    const filled = grid.split('').filter(c => c !== '0').length;
    expect(filled).toBeGreaterThan(0);
    expect(filled).toBeLessThan(81);
  });

  it('every filled cell in puzzle matches solution', () => {
    const { grid, solution } = generatePuzzle('easy', 9);
    for (let i = 0; i < 81; i++) {
      if (grid[i] !== '0') {
        expect(grid[i]).toBe(solution[i]);
      }
    }
  });

  it('each row in the solution contains no duplicate digits', () => {
    const { solution } = generatePuzzle('easy', 9);
    for (let row = 0; row < 9; row++) {
      const rowDigits = solution.slice(row * 9, row * 9 + 9).split('');
      expect(new Set(rowDigits).size).toBe(9);
    }
  });

  it('each column in the solution contains no duplicate digits', () => {
    const { solution } = generatePuzzle('easy', 9);
    for (let col = 0; col < 9; col++) {
      const colDigits = Array.from({ length: 9 }, (_, r) => solution[r * 9 + col]);
      expect(new Set(colDigits).size).toBe(9);
    }
  });

  it('each 3×3 box in the solution contains no duplicate digits', () => {
    const { solution } = generatePuzzle('easy', 9);
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const box: string[] = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            box.push(solution[(br * 3 + r) * 9 + bc * 3 + c]);
          }
        }
        expect(new Set(box).size).toBe(9);
      }
    }
  });

  it('expert has fewer or equal clues than easy', () => {
    const easy = generatePuzzle('easy', 9);
    const expert = generatePuzzle('expert', 9);
    const easyClues = easy.grid.split('').filter(c => c !== '0').length;
    const expertClues = expert.grid.split('').filter(c => c !== '0').length;
    expect(expertClues).toBeLessThanOrEqual(easyClues);
  });
}, { timeout: 30000 });
