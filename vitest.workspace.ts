import { defineWorkspace } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineWorkspace([
  {
    test: {
      name: 'api-server',
      root: resolve(root, 'artifacts/api-server'),
      include: ['src/__tests__/**/*.test.ts'],
      environment: 'node',
    },
  },
  {
    resolve: {
      alias: {
        '@': resolve(root, 'artifacts/sudoku-game/src'),
      },
    },
    test: {
      name: 'sudoku-game',
      root: resolve(root, 'artifacts/sudoku-game'),
      include: ['src/__tests__/**/*.test.ts'],
      environment: 'node',
    },
  },
]);
