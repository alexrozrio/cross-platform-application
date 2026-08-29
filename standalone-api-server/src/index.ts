import app from "./app";
import { logger } from "./lib/logger";
import { ensureDatabaseSchema } from "@workspace/db";

// ─── Startup env guard ────────────────────────────────────────────────────────
// Detect the common local-dev misconfiguration where DATABASE_URL is still
// pointing at a Replit-managed host (hostname = "base") instead of localhost.
// This happens when DATABASE_URL is set as a Windows/Mac system environment
// variable left over from a Replit session — system env vars take precedence
// over .env files, so the wrong URL silently wins.
const dbUrl = process.env["DATABASE_URL"] ?? "";
if (dbUrl) {
  try {
    const { hostname } = new URL(dbUrl);
    // "base" is the internal hostname Replit uses for its managed Postgres.
    // If we see it outside of an actual Replit environment (REPL_ID is absent)
    // the user almost certainly has a stale system-level env var on their machine.
    const onReplit = Boolean(process.env["REPL_ID"]);
    if (!onReplit && hostname === "base") {
      console.error(
        "\n" +
        "┌─────────────────────────────────────────────────────────────────┐\n" +
        "│  DATABASE_URL points to a Replit host ('base') but this is not  │\n" +
        "│  a Replit environment.                                           │\n" +
        "│                                                                  │\n" +
        "│  You have DATABASE_URL set as a SYSTEM environment variable      │\n" +
        "│  (e.g. in Windows System Properties > Environment Variables).   │\n" +
        "│  That value overrides the .env file and causes connection         │\n" +
        "│  errors like: getaddrinfo ENOTFOUND base                         │\n" +
        "│                                                                  │\n" +
        "│  Fix: remove DATABASE_URL from your system environment variables │\n" +
        "│  and let the .env file supply it instead:                        │\n" +
        "│    artifacts/api-server/.env  →  DATABASE_URL=postgresql://...   │\n" +
        "└─────────────────────────────────────────────────────────────────┘\n",
      );
      process.exit(1);
    }
  } catch {
    // URL parse failed — the missing-DATABASE_URL check below will catch it
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

try {
  await ensureDatabaseSchema();
  logger.info("Database schema compatibility check completed");
} catch (err) {
  logger.error({ err }, "Database schema compatibility check failed");
  process.exit(1);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
