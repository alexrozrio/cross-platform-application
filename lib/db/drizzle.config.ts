import { defineConfig } from "drizzle-kit";
import { configDotenv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const onReplit = Boolean(process.env.REPL_ID);

// On Replit, DATABASE_URL is injected by the platform for the managed
// PostgreSQL database — don't override it with the .env file.
// Locally, load from .env so drizzle-kit push works without manual setup.
if (!onReplit) {
  configDotenv({ path: resolve(__dirname, "../../artifacts/api-server/.env") });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set — ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
