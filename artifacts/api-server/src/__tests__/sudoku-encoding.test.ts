import { describe, it, expect } from 'vitest';
import { encodeCell, decodeCell } from '../lib/sudoku';

// ─── encodeCell ───────────────────────────────────────────────────────────────

describe('encodeCell', () => {
  it('encodes 0 (empty cell) as "0"', () => {
    expect(encodeCell(0)).toBe('0');
  });

  it('encodes digits 1–9 as their string equivalents', () => {
    for (let n = 1; n <= 9; n++) {
      expect(encodeCell(n)).toBe(String(n));
    }
  });

  it('encodes 10–16 as lowercase letters a–g', () => {
    const expected: Record<number, string> = {
      10: 'a', 11: 'b', 12: 'c', 13: 'd', 14: 'e', 15: 'f', 16: 'g',
    };
    for (const [n, char] of Object.entries(expected)) {
      expect(encodeCell(Number(n))).toBe(char);
    }
  });

  it('letter codes are derived correctly from charCode 87 + n', () => {
    // char 87 + 10 = 97 = 'a', 87 + 16 = 103 = 'g'
    expect(encodeCell(10).charCodeAt(0)).toBe(97);
    expect(encodeCell(16).charCodeAt(0)).toBe(103);
  });
});

// ─── decodeCell ───────────────────────────────────────────────────────────────

describe('decodeCell', () => {
  it('decodes "0" to 0', () => {
    expect(decodeCell('0')).toBe(0);
  });

  it('decodes digit strings "1"–"9" back to numbers', () => {
    for (let n = 1; n <= 9; n++) {
      expect(decodeCell(String(n))).toBe(n);
    }
  });

  it('decodes letters a–g to 10–16', () => {
    const expected: Record<string, number> = {
      a: 10, b: 11, c: 12, d: 13, e: 14, f: 15, g: 16,
    };
    for (const [char, n] of Object.entries(expected)) {
      expect(decodeCell(char)).toBe(n);
    }
  });
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('encodeCell / decodeCell round-trip', () => {
  it('is a perfect inverse for all valid cell values 0–16', () => {
    for (let n = 0; n <= 16; n++) {
      expect(decodeCell(encodeCell(n))).toBe(n);
    }
  });
});
