#!/usr/bin/env node
// Cross-platform replacement for the sh-based preinstall hook.
// Works on Windows, macOS, and Linux without requiring a POSIX shell.

const fs = require('fs');
const path = require('path');

// Remove stray lock files left by npm/yarn if they somehow appear
const root = path.resolve(__dirname, '..');
for (const file of ['package-lock.json', 'yarn.lock']) {
  const full = path.join(root, file);
  try {
    fs.unlinkSync(full);
    console.warn(`preinstall: removed ${file}`);
  } catch {
    // file doesn't exist — that's fine
  }
}

// Enforce pnpm
const agent = process.env.npm_config_user_agent ?? '';
if (!agent.startsWith('pnpm/')) {
  console.error('Error: please use pnpm to install dependencies (not npm or yarn).');
  process.exit(1);
}
