import { describe, expect, it } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { STOP, norm, search, snippet } from './search.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, '..', 'test', 'fixtures', 'docs-index.json');
const { sections } = JSON.parse(readFileSync(fixturePath, 'utf8'));

describe('norm', () => {
  it('lowercases and strips accents', () => {
    expect(norm('Instalación')).toBe('instalacion');
  });

  it('leaves already-plain text unchanged apart from case', () => {
    expect(norm('Getting Started')).toBe('getting started');
  });
});

describe('STOP', () => {
  it('contains common English stopwords', () => {
    expect(STOP.has('the')).toBe(true);
    expect(STOP.has('how')).toBe(true);
  });

  it('contains common Spanish stopwords', () => {
    expect(STOP.has('como')).toBe(true);
    expect(STOP.has('que')).toBe(true);
  });
});

describe('search — relevance scoring', () => {
  it('ranks a precisely-relevant short section above a longer weakly-relevant one', () => {
    const results = search({ sections, query: 'install', locale: 'en', limit: 5 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('installation');
  });

  it('still ranks the precise section first when the query is phrased as a question', () => {
    const withStopwords = search({ sections, query: 'how do you install this', locale: 'en', limit: 5 });

    expect(withStopwords[0].id).toBe('installation');
  });

  it('excludes Spanish stopwords from term weighting the same way', () => {
    const results = search({ sections, query: 'como instala', locale: 'es', limit: 5 });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('installation');
    expect(results[0].locale).toBe('es');
  });

  it('narrows the candidate pool to the requested locale', () => {
    const enOnly = search({ sections, query: 'skills', locale: 'en', limit: 10 });
    const esOnly = search({ sections, query: 'skills', locale: 'es', limit: 10 });

    expect(enOnly.every((r) => r.locale === 'en')).toBe(true);
    expect(esOnly.every((r) => r.locale === 'es')).toBe(true);
    expect(enOnly.some((r) => r.id === 'skills')).toBe(true);
  });

  it('searches every locale when locale is omitted', () => {
    const results = search({ sections, query: 'gentle ai', limit: 10 });

    expect(results.some((r) => r.locale === 'en')).toBe(true);
    expect(results.some((r) => r.locale === 'es')).toBe(true);
  });

  it('returns a bounded snippet that never exceeds 400 characters', () => {
    const results = search({ sections, query: 'configuration', locale: 'en', limit: 5 });
    const long = results.find((r) => r.id === 'advanced-configuration');

    expect(long).toBeTruthy();
    expect(long.snippet.length).toBeLessThanOrEqual(400);
  });

  it('returns an empty array, not an error, for a well-formed query matching nothing', () => {
    const results = search({ sections, query: 'xylophone', locale: 'en', limit: 5 });

    expect(results).toEqual([]);
  });

  it('respects the requested limit', () => {
    const results = search({ sections, query: 'gentle ai', limit: 2 });

    expect(results.length).toBeLessThanOrEqual(2);
  });
});

describe('snippet', () => {
  it('never exceeds the default 400-character width', () => {
    const longText = 'word '.repeat(200);

    expect(snippet(longText, ['nomatch']).length).toBeLessThanOrEqual(400);
  });

  it('never exceeds a custom width even with leading and trailing context', () => {
    const longText = `${'lead '.repeat(100)}needle${' trail'.repeat(100)}`;

    const result = snippet(longText, ['needle'], 50);

    expect(result.length).toBeLessThanOrEqual(50);
    expect(result).toContain('needle');
  });

  it('returns the text untouched when no needle is found and it already fits within the width', () => {
    expect(snippet('short text', ['nomatch'], 400)).toBe('short text');
  });
});
