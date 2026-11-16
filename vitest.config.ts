import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api-server',
          root: resolve(root, 'artifacts/api-server'),
          include: ['src/__tests__/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        // Vite 8 (rolldown-vite) transforms JSX via oxc; the app tsconfig sets
        // `jsx: "preserve"` for the React plugin, so .tsx tests need the
        // automatic JSX runtime configured explicitly.
        oxc: {
          jsx: {
            runtime: 'automatic',
          },
        },
        resolve: {
          alias: {
            '@': resolve(root, 'artifacts/sudoku-game/src'),
          },
        },
        test: {
          name: 'sudoku-game',
          root: resolve(root, 'artifacts/sudoku-game'),
          include: ['src/__tests__/**/*.test.{ts,tsx}'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'standalone-api-server',
          root: resolve(root, 'standalone-api-server'),
          include: ['src/__tests__/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
});
