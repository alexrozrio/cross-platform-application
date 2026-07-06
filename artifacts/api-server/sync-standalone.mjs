// sync-standalone.mjs
//
// Refreshes /standalone-api-server with the latest build output.
// Run via `pnpm --filter @workspace/api-server run build:standalone`
// (this also runs `build.mjs` first).
//
// This script:
//   1. Copies the freshly built dist/ folder into standalone-api-server/dist
//   2. Rebuilds env-setup.mjs as a fully bundled file (dotenv inlined) so the
//      standalone folder never needs `node_modules`.
//   3. Leaves .env and package.json in standalone-api-server/ untouched if
//      they already exist (so local secrets/config aren't overwritten).

import { build as esbuild } from "esbuild";
import { createRequire } from "node:module";
import { cp, mkdir, rm, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(artifactDir, "../..");
const standaloneDir = path.resolve(repoRoot, "standalone-api-server");

// env-setup.mjs (the source used by `pnpm dev`) loads dotenv via
// `createRequire(...)('dotenv')`. esbuild treats that as a genuinely dynamic
// require and will NOT inline dotenv's code — it just leaves the require()
// call in place, which then needs a real node_modules/dotenv at runtime.
// For the standalone bundle we need dotenv's code physically inlined, so we
// build a throwaway copy that uses a static `import` instead (which esbuild
// CAN bundle), keeping the exact same env-loading logic/comments otherwise.
const ENV_SETUP_STANDALONE_SOURCE = `
import { configDotenv } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const onReplit = Boolean(process.env.REPL_ID);

const portBefore = process.env.PORT;
const nodeEnvBefore = process.env.NODE_ENV;

const parsed = configDotenv({
  path: resolve(__dirname, ".env"),
  override: !onReplit,
});

if (parsed?.parsed?.DATABASE_URL) {
  process.env.DATABASE_URL = parsed.parsed.DATABASE_URL;
}

if (portBefore !== undefined) process.env.PORT = portBefore;
if (nodeEnvBefore !== undefined) process.env.NODE_ENV = nodeEnvBefore;
`;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function syncStandalone() {
  await mkdir(standaloneDir, { recursive: true });

  const srcDist = path.resolve(artifactDir, "dist");
  const destDist = path.resolve(standaloneDir, "dist");
  await rm(destDist, { recursive: true, force: true });
  await cp(srcDist, destDist, { recursive: true });
  console.log(`Copied dist/ -> ${destDist}`);

  // Written inside artifactDir (not os.tmpdir()) so esbuild's module
  // resolution can find `dotenv` in this package's node_modules.
  const tmpSourcePath = path.join(
    artifactDir,
    `.env-setup-standalone-tmp-${Date.now()}.mjs`,
  );
  await writeFile(tmpSourcePath, ENV_SETUP_STANDALONE_SOURCE);
  try {
    await esbuild({
      entryPoints: [tmpSourcePath],
      bundle: true,
      platform: "node",
      format: "esm",
      outfile: path.resolve(standaloneDir, "env-setup.mjs"),
      logLevel: "info",
      // dotenv is now inlined via static import above, but its own CJS code
      // still calls require('fs') internally — this banner gives it a real
      // `require` at runtime so that doesn't blow up.
      banner: {
        js: `import { createRequire as __cr } from 'node:module';\nglobalThis.require = __cr(import.meta.url);`,
      },
    });
  } finally {
    await rm(tmpSourcePath, { force: true });
  }
  console.log("Rebuilt bundled env-setup.mjs (dotenv inlined)");

  const pkgPath = path.resolve(standaloneDir, "package.json");
  if (!(await exists(pkgPath))) {
    await writeFile(
      pkgPath,
      JSON.stringify(
        {
          name: "brain-games-api-server-standalone",
          version: "0.0.0",
          private: true,
          type: "module",
          scripts: {
            start:
              "node --import ./env-setup.mjs --enable-source-maps ./dist/index.mjs",
          },
        },
        null,
        2,
      ) + "\n",
    );
    console.log(`Created ${pkgPath}`);
  }

  const envPath = path.resolve(standaloneDir, ".env");
  if (!(await exists(envPath))) {
    console.log(
      `NOTE: ${envPath} does not exist. Copy your .env (with DATABASE_URL, etc.) into standalone-api-server/ before running it.`,
    );
  }
}

syncStandalone().catch((err) => {
  console.error(err);
  process.exit(1);
});
