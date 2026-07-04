import { describe, it, expect } from 'vitest';
import {
  getPairs, buildDeck, formatTime, ALPHA_LABELS, getCardLabel, shuffle,
} from '../lib/memory-utils';

// ─── getPairs ─────────────────────────────────────────────────────────────────

describe('getPairs', () => {
  it('returns 4 pairs for 2×4 grid (size=2)', () => expect(getPairs(2)).toBe(4));
  it('returns 8 pairs for 4×4 grid (size=4)', () => expect(getPairs(4)).toBe(8));
  it('returns 16 pairs for 4×8 grid (size=6)', () => expect(getPairs(6)).toBe(16));
  it('returns 32 pairs for 8×8 grid (size=8)', () => expect(getPairs(8)).toBe(32));

  it('total card count equals 2 × pairs', () => {
    for (const size of [2, 4, 6, 8] as const) {
      expect(buildDeck(size)).toHaveLength(getPairs(size) * 2);
    }
  });
});

// ─── buildDeck ────────────────────────────────────────────────────────────────

describe('buildDeck', () => {
  it('produces the correct number of cards for each grid size', () => {
    expect(buildDeck(2)).toHaveLength(8);   // 4 pairs × 2
    expect(buildDeck(4)).toHaveLength(16);  // 8 pairs × 2
    expect(buildDeck(6)).toHaveLength(32);  // 16 pairs × 2
    expect(buildDeck(8)).toHaveLength(64);  // 32 pairs × 2
  });

  it('every value appears exactly twice', () => {
    const deck = buildDeck(4); // 8 pairs: values 1-8
    for (let v = 1; v <= 8; v++) {
      expect(deck.filter(c => c.value === v)).toHaveLength(2);
    }
  });

  it('all cards start face-down and unmatched', () => {
    for (const card of buildDeck(2)) {
      expect(card.flipped).toBe(false);
      expect(card.matched).toBe(false);
    }
  });

  it('card ids are sequential starting from 0', () => {
    const deck = buildDeck(2);
    const sortedIds = deck.map(c => c.id).sort((a, b) => a - b);
    sortedIds.forEach((id, i) => expect(id).toBe(i));
  });

  it('all values are within valid range (1 to pairs)', () => {
    const deck = buildDeck(8);
    const pairs = getPairs(8);
    for (const card of deck) {
      expect(card.value).toBeGreaterThanOrEqual(1);
      expect(card.value).toBeLessThanOrEqual(pairs);
    }
  });
});

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('formats 0 seconds as "0:00"', () => expect(formatTime(0)).toBe('0:00'));
  it('formats 9 seconds as "0:09"', () => expect(formatTime(9)).toBe('0:09'));
  it('formats 59 seconds as "0:59"', () => expect(formatTime(59)).toBe('0:59'));
  it('formats 60 seconds as "1:00"', () => expect(formatTime(60)).toBe('1:00'));
  it('formats 61 seconds as "1:01"', () => expect(formatTime(61)).toBe('1:01'));
  it('formats 90 seconds as "1:30"', () => expect(formatTime(90)).toBe('1:30'));
  it('formats 3600 seconds as "60:00"', () => expect(formatTime(3600)).toBe('60:00'));
  it('formats 3661 seconds as "61:01"', () => expect(formatTime(3661)).toBe('61:01'));
  it('always pads seconds to two digits', () => {
    for (let s = 0; s < 60; s++) {
      const formatted = formatTime(s);
      const secPart = formatted.split(':')[1];
      expect(secPart).toHaveLength(2);
    }
  });
});

// ─── ALPHA_LABELS ─────────────────────────────────────────────────────────────

describe('ALPHA_LABELS', () => {
  it('has exactly 32 labels', () => {
    expect(ALPHA_LABELS).toHaveLength(32);
  });

  it('first 26 labels are uppercase A–Z in order', () => {
    for (let i = 0; i < 26; i++) {
      expect(ALPHA_LABELS[i]).toBe(String.fromCharCode(65 + i));
    }
  });

  it('last 6 labels are lowercase a–f (not Greek symbols)', () => {
    expect(ALPHA_LABELS.slice(26)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('starts with "A"', () => expect(ALPHA_LABELS[0]).toBe('A'));
  it('ends with "f"', () => expect(ALPHA_LABELS[31]).toBe('f'));

  it('26th label is "Z"', () => expect(ALPHA_LABELS[25]).toBe('Z'));
  it('27th label is "a"', () => expect(ALPHA_LABELS[26]).toBe('a'));
});

// ─── getCardLabel ─────────────────────────────────────────────────────────────

describe('getCardLabel', () => {
  it('returns the numeric string in number mode', () => {
    expect(getCardLabel(1, 'number')).toBe('1');
    expect(getCardLabel(16, 'number')).toBe('16');
    expect(getCardLabel(32, 'number')).toBe('32');
  });

  it('returns correct uppercase letters for values 1–26 in alpha mode', () => {
    expect(getCardLabel(1, 'alpha')).toBe('A');
    expect(getCardLabel(13, 'alpha')).toBe('M');
    expect(getCardLabel(26, 'alpha')).toBe('Z');
  });

  it('returns lowercase a–f for values 27–32 in alpha mode', () => {
    expect(getCardLabel(27, 'alpha')).toBe('a');
    expect(getCardLabel(28, 'alpha')).toBe('b');
    expect(getCardLabel(32, 'alpha')).toBe('f');
  });

  it('returns empty string in image mode', () => {
    expect(getCardLabel(1, 'image')).toBe('');
    expect(getCardLabel(32, 'image')).toBe('');
  });

  it('falls back to String(value) for out-of-range values in alpha mode', () => {
    expect(getCardLabel(99, 'alpha')).toBe('99');
  });
});

// ─── shuffle ──────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr).sort((a, b) => a - b);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('works with an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('works with a single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('works with generic types', () => {
    const words = ['alpha', 'beta', 'gamma'];
    const shuffled = shuffle(words);
    expect(shuffled.sort()).toEqual(['alpha', 'beta', 'gamma']);
  });

  it('produces different orderings over many runs (statistical test)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const firstPositions = new Set<number>();
    for (let i = 0; i < 50; i++) {
      firstPositions.add(shuffle(arr)[0]);
    }
    expect(firstPositions.size).toBeGreaterThan(1);
  });
});
