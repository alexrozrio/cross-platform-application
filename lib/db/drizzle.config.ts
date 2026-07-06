import { defineConfig } from "drizzle-kit";
import { configDotenv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Standalone drizzle-kit commands (push, etc.) don't go through
// api-server/env-setup.mjs, so load the same .env file here to pick up
// the external Neon DATABASE_URL.
configDotenv({ path: resolve(__dirname, "../../artifacts/api-server/.env") });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
