// Bootstrap: reads env config, validates the docs index before listen()
// (fail closed — design.md's "unrecognised shape" decision), then serves the
// Streamable HTTP transport. Never serves a half-understood index.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createApp } from './http.mjs';
import { loadIndexStore } from './index-store.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const PORT = Number(process.env.PORT ?? 3111);
const ALLOWED_HOSTS = (process.env.ALLOWED_HOSTS ?? 'localhost,127.0.0.1,[::1]').split(',');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);
// Resolved against process.cwd() — the deploy runbook's WorkingDirectory is
// the repo root (docs/mcp-server-operations.md), matching astro build's own
// `dist/` output location.
const DOCS_INDEX_PATH = resolve(process.env.DOCS_INDEX_PATH ?? 'dist/mcp/docs-index.json');

let indexStore;
try {
  indexStore = loadIndexStore(DOCS_INDEX_PATH);
} catch (err) {
  console.error(`fatal: failed to load docs index from ${DOCS_INDEX_PATH}: ${err.message}`);
  process.exit(1);
}

const app = createApp({
  indexStore,
  allowedHosts: ALLOWED_HOSTS,
  allowedOrigins: ALLOWED_ORIGINS,
  version: pkg.version,
});

app.listen(PORT, () => {
  const identity = indexStore.getBuildIdentity();
  console.log(`docs MCP server on http://localhost:${PORT}/mcp (${identity.sectionCount} sections, commit ${identity.commit})`);
  console.log(`allowed hosts: ${ALLOWED_HOSTS.join(', ')}`);
  console.log(`allowed origins: ${ALLOWED_ORIGINS.join(', ') || '(none - browser clients blocked)'}`);
});
