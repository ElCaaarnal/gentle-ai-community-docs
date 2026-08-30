import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
import { BoundsConfigSchema, BoundsMetadataSchema, isBeforeDeadline, isWithinCapacity } from '../../../src/docs-mcp/contracts/bounds.js';

const path = new URL('../../../config/docs-mcp/bounds.v1.json', import.meta.url);
const expected = {
  query_characters: 256, identifier_characters: 128, option_bytes: 512,
  request_bytes: 65_536, response_bytes: 524_288, result_count: 20,
  search_default_results: 8, search_max_results: 20, snippet_characters: 320,
  section_body_bytes: 196_608, serialized_evidence_bytes: 393_216,
  error_message_characters: 256, index_record_count: 512, serialized_index_bytes: 16_777_216,
  rate_limit_requests: 60, rate_limit_window_seconds: 60, maximum_concurrent_sessions: 64,
  session_ttl_seconds: 900, sse_connection_duration_seconds: 300, maximum_sse_events: 256,
  index_synchronization_timeout_seconds: 30, synchronization_redirect_count: 0,
  retained_index_versions: 3, startup_deadline_seconds: 30, reload_deadline_seconds: 10,
};

test('publishes the independently authored v1 bound profile', () => {
  const config = JSON.parse(readFileSync(path, 'utf8'));
  expect(config).toEqual({ bounds_config_version: 'gentle-ai.docs-mcp-bounds/v1', ...expected });
});

test('keeps the approved exact edge values explicit', () => {
  const config = JSON.parse(readFileSync(path, 'utf8'));
  expect([config.maximum_concurrent_sessions, config.session_ttl_seconds, config.sse_connection_duration_seconds, config.maximum_sse_events]).toEqual([64, 900, 300, 256]);
  expect([config.index_synchronization_timeout_seconds, config.startup_deadline_seconds, config.reload_deadline_seconds, config.retained_index_versions]).toEqual([30, 30, 10, 3]);
});

test('rejects non-integral, zero, negative, and non-finite safety bounds', () => {
  const valid = JSON.parse(readFileSync(path, 'utf8'));
  for (const key of Object.keys(expected)) {
    const invalid = key === 'synchronization_redirect_count' ? 1 : 0;
    expect(BoundsConfigSchema.safeParse({ ...valid, [key]: invalid }).success, key).toBe(false);
  }
  for (const value of [-1, 1.5, Number.POSITIVE_INFINITY]) expect(BoundsConfigSchema.safeParse({ ...valid, query_characters: value }).success).toBe(false);
  const { bounds_config_version: _version, maximum_concurrent_sessions: _sessions, session_ttl_seconds: _ttl, sse_connection_duration_seconds: _sse, maximum_sse_events: _events, index_synchronization_timeout_seconds: _synchronization, synchronization_redirect_count: _redirects, retained_index_versions: _retention, startup_deadline_seconds: _startup, reload_deadline_seconds: _reload, ...metadata } = valid;
  expect(BoundsMetadataSchema.safeParse(metadata).success).toBe(true);
});

test.each([
  ['sessions', 64, 65, 64],
  ['events', 256, 257, 256],
  ['retention', 3, 4, 3],
])('accepts %s at capacity and rejects the next value', (_name, accepted, rejected, limit) => {
  expect(isWithinCapacity(accepted, limit)).toBe(true);
  expect(isWithinCapacity(rejected, limit)).toBe(false);
});

test.each([
  ['session TTL', 899, 900, 900],
  ['SSE duration', 299, 300, 300],
  ['synchronization deadline', 29, 30, 30],
  ['reload deadline', 9, 10, 10],
  ['startup deadline', 29, 30, 30],
])('accepts %s before its deadline and rejects it at the deadline', (_name, accepted, rejected, deadline) => {
  expect(isBeforeDeadline(accepted, deadline)).toBe(true);
  expect(isBeforeDeadline(rejected, deadline)).toBe(false);
});
