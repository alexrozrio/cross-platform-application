import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT ?? "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig(({ mode }) => {
  const appRoot = path.resolve(import.meta.dirname);
  const env = loadEnv(mode, appRoot, "");
  const configuredApiTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL;
  const apiTarget = configuredApiTarget || `http://localhost:${process.env.API_PORT ?? "8080"}`;

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss({ optimize: false }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
      },
      // Keep browser API calls same-origin; use an explicit remote target when
      // configured, and retain the local API workflow as the fallback.
      ...(process.env.NODE_ENV !== "production" && {
        proxy: {
          "/api": {
            target: apiTarget,
            changeOrigin: true,
          },
        },
      }),
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
