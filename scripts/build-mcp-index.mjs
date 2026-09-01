// Index generator CLI, run as a post-build step (see package.json "build").
// Ports the validated spike/mcp/build-index.mjs (read-only) into a build-wired
// module: reuses scripts/lib/extract.mjs for extraction, adds a versioned
// build identity, hard-fails on EN/ES id mismatch, and hard-fails below a
// MIN_SECTIONS floor. Fail-fast, no partial write: every guard below runs
// before the output directory is ever created, so a rejected build leaves no
// trace on disk - matching the throw-on-mismatch convention of
// scripts/generate-banner.mjs.

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseUrlOf, extractSections } from './lib/extract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dist = process.env.DIST_DIR ?? resolve(here, '..', 'dist');

const PAGES = [
  { locale: 'en', file: `${dist}/index.html`, path: '/' },
  { locale: 'es', file: `${dist}/es/index.html`, path: '/es/' }
];

// Measured current total across both locales is 190 (95 EN + 95 ES). This
// floor sits at 150 - about 79% of that - leaving ~21% headroom (40
// sections) for legitimate content edits or deletions, while still catching
// a catastrophic extraction failure: a broken selector that silently
// returns only a fraction of the real headings (e.g. matching only every
// other heading, or one locale collapsing to a handful of sections) drops
// well below this line long before it could plausibly be a real content
// change. Overridable via the MIN_SECTIONS env var for test isolation only;
// production runs rely on this default.
const MIN_SECTIONS = Number(process.env.MIN_SECTIONS ?? 150);

function resolveCommit() {
  if (process.env.COMMIT_REF) return process.env.COMMIT_REF;
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: here, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const sections = [];
let base = process.env.DOCS_BASE_URL ?? null;

for (const page of PAGES) {
  const html = readFileSync(page.file, 'utf8');
  base ??= baseUrlOf(html);
  sections.push(...extractSections(html, { locale: page.locale, path: page.path, base }));
}

const byLocale = (locale) => sections.filter((s) => s.locale === locale);
const idsOf = (locale) => new Set(byLocale(locale).map((s) => s.id));
const enIds = idsOf('en');
const esIds = idsOf('es');
const orphans = [...enIds]
  .filter((id) => !esIds.has(id))
  .concat([...esIds].filter((id) => !enIds.has(id)));

if (orphans.length) {
  fail(`EN/ES section id parity failed - unpaired ids: ${orphans.join(', ')}`);
}

if (sections.length < MIN_SECTIONS) {
  fail(`indexed ${sections.length} sections, below MIN_SECTIONS floor of ${MIN_SECTIONS}`);
}

const index = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  commit: resolveCommit(),
  sectionCount: sections.length,
  base,
  locales: ['en', 'es'],
  sections
};

const outDir = resolve(dist, 'mcp');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'docs-index.json'), JSON.stringify(index, null, 2));

console.log(`indexed ${sections.length} sections (en=${enIds.size}, es=${esIds.size})`);
console.log(`wrote ${resolve(outDir, 'docs-index.json')}`);
