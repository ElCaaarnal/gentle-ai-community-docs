import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { baseUrlOf, extractSections, toText } from './extract.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(join(here, 'fixtures', name), 'utf8');
const BASE = 'https://docs-gentle-ai.netlify.app';

describe('toText', () => {
  it('preserves line breaks inside a <pre> block', () => {
    const html = '<pre>line one\nline two\nline three</pre>';

    expect(toText(html)).toBe('line one\nline two\nline three');
  });

  it('preserves line breaks inside a <pre> block that also has surrounding prose', () => {
    const html = '<p>Run this:</p><pre>step one\nstep two</pre><p>Done.</p>';

    const text = toText(html);

    expect(text).toContain('step one\nstep two');
  });

  it('retains a link label alongside its href destination', () => {
    const html = '<p>See <a href="https://example.com/guide">the guide</a> for details.</p>';

    expect(toText(html)).toContain('the guide (https://example.com/guide)');
  });
});

describe('baseUrlOf', () => {
  it('derives the origin from the canonical link', () => {
    expect(baseUrlOf(fixture('valid-page.html'))).toBe(BASE);
  });

  it('throws when no canonical link is present', () => {
    expect(() => baseUrlOf(fixture('missing-canonical.html'))).toThrow(/canonical/i);
  });
});

describe('extractSections', () => {
  it('extracts one section per heading with <pre> line breaks intact', () => {
    const sections = extractSections(fixture('valid-page.html'), { locale: 'en', path: '/', base: BASE });

    expect(sections).toHaveLength(2);
    expect(sections[0].id).toBe('getting-started');
    expect(sections[0].locale).toBe('en');
    expect(sections[0].level).toBe(2);
    expect(sections[0].url).toBe(`${BASE}/#getting-started`);
    expect(sections[0].text).toContain('line one\nline two\nline three');
  });

  it('retains a link href alongside its label in extracted section text', () => {
    const sections = extractSections(fixture('valid-page.html'), { locale: 'en', path: '/', base: BASE });

    expect(sections[0].text).toContain('the guide (https://example.com/guide)');
  });

  it('throws when <main> is missing', () => {
    expect(() =>
      extractSections(fixture('missing-main.html'), { locale: 'en', path: '/', base: BASE })
    ).toThrow(/main/i);
  });

  it('throws when there are zero headings', () => {
    expect(() =>
      extractSections(fixture('no-headings.html'), { locale: 'en', path: '/', base: BASE })
    ).toThrow(/heading/i);
  });

  it('throws when a section extracts to empty text', () => {
    expect(() =>
      extractSections(fixture('empty-text-section.html'), { locale: 'en', path: '/', base: BASE })
    ).toThrow(/empty/i);
  });
});
