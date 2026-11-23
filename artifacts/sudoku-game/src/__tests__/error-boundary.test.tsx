// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { ErrorBoundary } from '../components/error-boundary';

function Bomb(): never {
  throw new Error('render exploded');
}

describe('ErrorBoundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    cleanup();
  });

  it('renders children when there is no error', () => {
    render(
      createElement(ErrorBoundary, null, createElement('div', null, 'healthy content')),
    );
    expect(screen.getByText('healthy content')).toBeTruthy();
  });

  it('shows the offline game picker when a child throws', () => {
    render(createElement(ErrorBoundary, null, createElement(Bomb)));
    expect(screen.getByText('Choose a game to keep playing')).toBeTruthy();
    // All ten offline games are offered
    for (const label of [
      'Sudoku', 'Memory Match', 'Jigsaw', 'Word Search', 'Minesweeper',
      'Slide Puzzle', 'Odd Images', 'Science Quiz', 'Maths Quiz', 'GK Quiz',
    ]) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeTruthy();
    }
  });

  it('launches the selected offline game fallback', () => {
    render(createElement(ErrorBoundary, null, createElement(Bomb)));
    fireEvent.click(screen.getByRole('button', { name: /GK Quiz/ }));
    expect(screen.getByText(/Offline GK Quiz/)).toBeTruthy();
    expect(screen.getByText(/Question 1 of 5/)).toBeTruthy();
  });

  it('auto-falls back to offline Sudoku on /game/ routes', () => {
    window.history.pushState({}, '', '/game/abc');
    render(createElement(ErrorBoundary, null, createElement(Bomb)));
    expect(screen.getByText(/Offline Sudoku|Sudoku/i)).toBeTruthy();
    window.history.pushState({}, '', '/');
  });
});
