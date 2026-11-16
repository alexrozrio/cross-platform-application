// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { OfflineGameFallback, OFFLINE_GAME_IDS } from '../components/offline-games';

afterEach(cleanup);

describe('OfflineGameFallback', () => {
  it('renders a fallback for every supported offline game id', () => {
    for (const game of OFFLINE_GAME_IDS) {
      const { container, unmount } = render(createElement(OfflineGameFallback, { game }));
      expect(container.firstChild).not.toBeNull();
      unmount();
    }
  });

  it('returns null for an unknown game id', () => {
    const { container } = render(createElement(OfflineGameFallback, { game: 'not-a-game' }));
    expect(container.firstChild).toBeNull();
  });

  it('quiz fallback shows 5 questions and a score screen at the end', () => {
    render(createElement(OfflineGameFallback, { game: 'science-quiz' }));
    expect(screen.getByText(/Question 1 of 5/)).toBeTruthy();

    // Answer all 5 questions (click first option each time, then Next/See score)
    for (let i = 0; i < 5; i++) {
      const optionButtons = document.querySelectorAll('.grid.gap-2 > button');
      expect(optionButtons.length).toBe(4);
      fireEvent.click(optionButtons[0]);
      const next = screen.getByRole('button', { name: i === 4 ? 'See score' : 'Next question' });
      fireEvent.click(next);
    }

    expect(screen.getByText(/You scored \d+ out of 5/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Play again' })).toBeTruthy();
  });

  it('quiz fallback disables options after an answer is picked', () => {
    render(createElement(OfflineGameFallback, { game: 'maths-quiz' }));
    const optionButtons = document.querySelectorAll('.grid.gap-2 > button');
    fireEvent.click(optionButtons[0]);
    for (const btn of Array.from(optionButtons)) {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('jigsaw fallback renders a tile board', () => {
    const { container } = render(createElement(OfflineGameFallback, { game: 'jigsaw' }));
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(9);
  });

  it('slide puzzle fallback renders a New game button', () => {
    render(createElement(OfflineGameFallback, { game: 'slide-puzzle' }));
    expect(screen.getByRole('button', { name: 'New game' })).toBeTruthy();
  });

  it('minesweeper fallback renders the board and controls', () => {
    render(createElement(OfflineGameFallback, { game: 'minesweeper' }));
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(50); // 81 cells + controls
  });
});
