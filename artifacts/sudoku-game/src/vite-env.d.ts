/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  /**
   * Optional: point the frontend at a different API server instead of the
   * default (same origin, proxied through Vite in dev).
   *
   * Examples:
   *   VITE_API_BASE_URL=https://cross-platform-application.onrender.com
   *   VITE_API_BASE_URL=http://localhost:8080
   *
   * When this is set the Vite dev proxy is bypassed — the browser sends
   * requests directly to the configured host. Restart the dev server after
   * changing this value.
   */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
