import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  // Vite 8 (rolldown-vite) transforms JSX via oxc; the app tsconfig sets
  // `jsx: "preserve"` for the React plugin, so tests need the automatic
  // runtime configured explicitly or .tsx files fail to parse.
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "node",
  },
});
