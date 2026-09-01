// Loads and validates the versioned docs index (see design.md — "index contract
// is versioned, build-only, never committed"). Fails closed: any unrecognised
// shape throws, never warns-and-continues. A server that swallows a malformed
// index and serves it anyway is worse than one that refuses to start.

import { readFileSync } from 'node:fs';

const SUPPORTED_SCHEMA_VERSION = 1;
const REQUIRED_TOP_LEVEL_FIELDS = [
  'schemaVersion',
  'generatedAt',
  'commit',
  'sectionCount',
  'base',
  'locales',
  'sections'
];
const REQUIRED_SECTION_FIELDS = ['id', 'locale', 'title', 'url', 'text'];

/**
 * Validates the raw parsed index object against the schemaVersion 1 contract.
 * Throws a descriptive error naming the offending field on any mismatch.
 * Returns the same object unchanged when it is valid, so callers can chain it.
 */
export function validateIndex(data) {
  if (data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    throw new Error(
      `unrecognised schemaVersion: expected ${SUPPORTED_SCHEMA_VERSION}, got ${JSON.stringify(data.schemaVersion)}`
    );
  }

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in data)) {
      throw new Error(`docs index is missing required top-level field "${field}"`);
    }
  }

  if (!Array.isArray(data.sections) || data.sections.length === 0) {
    throw new Error('docs index "sections" must be a non-empty array');
  }

  data.sections.forEach((section, i) => {
    for (const field of REQUIRED_SECTION_FIELDS) {
      if (!(field in section)) {
        throw new Error(`docs index section at position ${i} is missing required field "${field}"`);
      }

      const value = section[field];

      if (typeof value !== 'string') {
        throw new Error(
          `docs index section at position ${i} has an invalid value for required field "${field}": expected a string, got ${typeof value}`
        );
      }

      // "text" is allowed to be a legitimately empty string — a container
      // heading (e.g. an <h2> immediately followed by an <h3>) owns no prose
      // of its own. Every other required field must be non-empty.
      if (field !== 'text' && value === '') {
        throw new Error(`docs index section at position ${i} has an empty value for required field "${field}"`);
      }
    }
  });

  return data;
}

/**
 * Wraps an already-parsed, already-validated index object with the two
 * read-only accessors the rest of the server depends on.
 */
export function createIndexStore(data) {
  validateIndex(data);

  const buildIdentity = {
    schemaVersion: data.schemaVersion,
    generatedAt: data.generatedAt,
    commit: data.commit,
    sectionCount: data.sectionCount
  };

  return {
    getBuildIdentity: () => buildIdentity,
    getSections: () => data.sections
  };
}

/**
 * Reads the index file from disk, parses it, validates it, and returns the
 * accessor object. Throws on any I/O, parse, or validation failure — never
 * warns-and-continues (see design.md's fail-closed decision).
 */
export function loadIndexStore(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  return createIndexStore(data);
}
