import { describe, it, expect } from 'vitest';
import { pickCompletionMessage } from '../lib/completion-messages';

const WARM_HEADLINES = [
  'Nice one!', 'Well done!', 'Good job!', 'Smooth solve!',
  'Nailed it!', 'Lovely work!', 'Off to a great start!',
];
const UPBEAT_HEADLINES = [
  'Bravo!', 'Brilliant!', 'Stellar!', 'Sharp as ever!',
  'You nailed it!', 'Impressive!', 'On a roll!', 'Crisp!',
];
const HYPED_HEADLINES = [
  'You crushed it!', "You're on fire!", 'Phenomenal!', 'Masterclass!',
  'What a solve!', 'Unstoppable!', 'Mind-blowing!', 'You slayed it!', 'Outstanding!',
];
const ELITE_HEADLINES = [
  'Legendary!', 'Absolutely elite!', 'Iconic!', 'Flawless!', 'Pure class!',
  "You're a genius!", 'Perfection!', 'Hall of fame stuff!', 'A masterpiece!', 'Unreal!',
];

describe('pickCompletionMessage', () => {
  it('returns an object with headline (string) and emoji (string)', () => {
    const msg = pickCompletionMessage('easy', 9);
    expect(typeof msg.headline).toBe('string');
    expect(msg.headline.length).toBeGreaterThan(0);
    expect(typeof msg.emoji).toBe('string');
    expect(msg.emoji.length).toBeGreaterThan(0);
  });

  it('returns warm pool messages for easy 9×9', () => {
    for (let i = 0; i < 30; i++) {
      expect(WARM_HEADLINES).toContain(pickCompletionMessage('easy', 9).headline);
    }
  });

  it('returns upbeat pool messages for medium 9×9', () => {
    for (let i = 0; i < 30; i++) {
      expect(UPBEAT_HEADLINES).toContain(pickCompletionMessage('medium', 9).headline);
    }
  });

  it('returns hyped pool messages for hard 9×9', () => {
    for (let i = 0; i < 30; i++) {
      expect(HYPED_HEADLINES).toContain(pickCompletionMessage('hard', 9).headline);
    }
  });

  it('returns elite pool messages for expert difficulty (any grid)', () => {
    for (let i = 0; i < 30; i++) {
      expect(ELITE_HEADLINES).toContain(pickCompletionMessage('expert', 9).headline);
    }
  });

  it('returns elite pool for 16×16 regardless of difficulty', () => {
    for (let i = 0; i < 30; i++) {
      expect(ELITE_HEADLINES).toContain(pickCompletionMessage('easy', 16).headline);
      expect(ELITE_HEADLINES).toContain(pickCompletionMessage('medium', 16).headline);
      expect(ELITE_HEADLINES).toContain(pickCompletionMessage('hard', 16).headline);
    }
  });

  it('returns warm pool when called with no arguments', () => {
    for (let i = 0; i < 20; i++) {
      expect(WARM_HEADLINES).toContain(pickCompletionMessage().headline);
    }
  });

  it('returns warm pool for unknown difficulty', () => {
    for (let i = 0; i < 20; i++) {
      expect(WARM_HEADLINES).toContain(pickCompletionMessage('beginner', 9).headline);
    }
  });

  it('eventually returns multiple different messages from the same pool (randomness)', () => {
    const headlines = new Set<string>();
    for (let i = 0; i < 50; i++) {
      headlines.add(pickCompletionMessage('easy', 9).headline);
    }
    expect(headlines.size).toBeGreaterThan(1);
  });
});
