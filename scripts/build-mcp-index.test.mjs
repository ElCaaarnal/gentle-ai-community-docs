import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, 'build-mcp-index.mjs');
const fixturesDir = join(here, 'fixtures');
const indexPath = (distDir) => join(distDir, 'mcp', 'docs-index.json');

const tmpDirs = [];

function makeDist(fixtureName) {
  const dir = mkdtempSync(join(tmpdir(), 'mcp-index-'));
  cpSync(join(fixturesDir, fixtureName), dir, { recursive: true });
  tmpDirs.push(dir);
  return dir;
}

function runGenerator(distDir, extraEnv = {}) {
  return spawnSync(process.execPath, [script], {
    encoding: 'utf8',
    env: { ...process.env, DIST_DIR: distDir, COMMIT_REF: 'abc1234', ...extraEnv }
  });
}

afterEach(() => {
  while (tmpDirs.length) {
    rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

describe('build-mcp-index CLI', () => {
  it('writes docs-index.json with the expected shape for a valid EN/ES pair', () => {
    const dist = makeDist('dist-valid');

    const result = runGenerator(dist, { MIN_SECTIONS: '1' });

    expect(result.status).toBe(0);
    expect(existsSync(indexPath(dist))).toBe(true);

    const index = JSON.parse(readFileSync(indexPath(dist), 'utf8'));
    expect(index.schemaVersion).toBe(1);
    expect(typeof index.generatedAt).toBe('string');
    expect(index.commit).toBe('abc1234');
    expect(index.sectionCount).toBe(index.sections.length);
    expect(index.sectionCount).toBe(4);
    expect(index.base).toBe('https://docs-gentle-ai.netlify.app');
    expect(index.locales).toEqual(['en', 'es']);
    expect(index.sections.find((s) => s.id === 'getting-started' && s.locale === 'en')).toBeTruthy();
    expect(index.sections.find((s) => s.id === 'getting-started' && s.locale === 'es')).toBeTruthy();
  });

  it('exits non-zero and writes no file at all when an EN/ES id mismatch is found', () => {
    const dist = makeDist('dist-mismatch');

    const result = runGenerator(dist, { MIN_SECTIONS: '1' });

    expect(result.status).not.toBe(0);
    expect(existsSync(indexPath(dist))).toBe(false);
    expect(existsSync(join(dist, 'mcp'))).toBe(false);
  });

  it('exits non-zero and writes no file when sectionCount is below MIN_SECTIONS', () => {
    const dist = makeDist('dist-valid');

    const result = runGenerator(dist, { MIN_SECTIONS: '100' });

    expect(result.status).not.toBe(0);
    expect(existsSync(indexPath(dist))).toBe(false);
  });
});
