import { describe, expect, it } from 'vitest';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createIndexStore, loadIndexStore } from './index-store.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixturePath = join(here, '..', 'test', 'fixtures', 'docs-index.json');

function validIndex() {
  return {
    schemaVersion: 1,
    generatedAt: '2026-08-31T00:00:00.000Z',
    commit: 'fixture01',
    sectionCount: 1,
    base: 'https://docs-gentle-ai.netlify.app',
    locales: ['en'],
    sections: [
      {
        id: 'installation',
        locale: 'en',
        level: 2,
        title: 'Installation',
        url: 'https://docs-gentle-ai.netlify.app/#installation',
        text: 'Install the CLI.'
      }
    ]
  };
}

describe('loadIndexStore', () => {
  it('loads the fixture file and exposes its build identity', () => {
    const store = loadIndexStore(fixturePath);

    expect(store.getBuildIdentity()).toEqual({
      schemaVersion: 1,
      generatedAt: '2026-08-31T00:00:00.000Z',
      commit: 'fixture01',
      sectionCount: 8
    });
  });

  it('exposes every section from the fixture file', () => {
    const store = loadIndexStore(fixturePath);
    const sections = store.getSections();

    expect(sections).toHaveLength(8);
    expect(sections.find((s) => s.id === 'memory' && s.locale === 'es')).toMatchObject({
      title: 'Memoria Persistente'
    });
  });
});

describe('createIndexStore validation', () => {
  it('throws on an unrecognised schemaVersion', () => {
    const data = validIndex();
    data.schemaVersion = 2;

    expect(() => createIndexStore(data)).toThrow(/schemaVersion/);
  });

  it('throws on a missing top-level field', () => {
    const data = validIndex();
    delete data.commit;

    expect(() => createIndexStore(data)).toThrow(/commit/);
  });

  it('throws on empty sections', () => {
    const data = validIndex();
    data.sections = [];

    expect(() => createIndexStore(data)).toThrow(/sections/);
  });

  it('throws when a section is missing "id"', () => {
    const data = validIndex();
    delete data.sections[0].id;

    expect(() => createIndexStore(data)).toThrow(/id/);
  });

  it('throws when a section is missing "locale"', () => {
    const data = validIndex();
    delete data.sections[0].locale;

    expect(() => createIndexStore(data)).toThrow(/locale/);
  });

  it('throws when a section is missing "title"', () => {
    const data = validIndex();
    delete data.sections[0].title;

    expect(() => createIndexStore(data)).toThrow(/title/);
  });

  it('throws when a section is missing "url"', () => {
    const data = validIndex();
    delete data.sections[0].url;

    expect(() => createIndexStore(data)).toThrow(/url/);
  });

  it('throws when a section is missing "text"', () => {
    const data = validIndex();
    delete data.sections[0].text;

    expect(() => createIndexStore(data)).toThrow(/text/);
  });

  it('does not throw for a fully valid index and returns a store with both accessors', () => {
    const store = createIndexStore(validIndex());

    expect(store.getBuildIdentity().sectionCount).toBe(1);
    expect(store.getSections()).toHaveLength(1);
  });
});
