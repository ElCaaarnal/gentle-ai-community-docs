import { expect, test } from 'vitest';
import { BoundsMetadataSchema } from '../../../src/docs-mcp/contracts/bounds.js';
import { SectionRecordSchema } from '../../../src/docs-mcp/contracts/index.js';
import { ErrorCodeSchema, OperationNameSchema, RequestSchemas, ResponseSchema } from '../../../src/docs-mcp/contracts/operations.js';

const identity = {
  service_identity: 'gentle-ai.docs-mcp-service/v1', schema_identity: 'gentle-ai.docs-mcp-index/v1',
  source_identity: 'sha256:source', source_version: 'astro-render-sha256:source',
  index_identity: 'sha256:index', index_version: 'gentle-ai.docs-mcp-index/v1',
  bounds_config_version: 'gentle-ai.docs-mcp-bounds/v1', bounds: { query_characters: 256, identifier_characters: 128, option_bytes: 512, request_bytes: 65536, response_bytes: 524288, result_count: 20, search_default_results: 8, search_max_results: 20, snippet_characters: 320, section_body_bytes: 196608, serialized_evidence_bytes: 393216, error_message_characters: 256, index_record_count: 512, serialized_index_bytes: 16777216, rate_limit_requests: 60, rate_limit_window_seconds: 60 }, index_identity_status: 'loaded',
};

const errors = ['invalid_request', 'unsupported_locale', 'invalid_query', 'invalid_limit', 'invalid_format', 'invalid_section_id', 'section_not_found', 'bounded_input', 'bounded_response', 'origin_not_allowed', 'method_not_allowed', 'rate_limited', 'index_unavailable', 'index_malformed', 'service_unavailable'];

test('accepts only the three strict operation request shapes', () => {
  expect(OperationNameSchema.options).toEqual(['list_documentation_sections', 'search_documentation', 'get_documentation_section']);
  expect(RequestSchemas.search_documentation.safeParse({ locale: 'es', query: 'Instalación', limit: 20 }).success).toBe(true);
  expect(RequestSchemas.get_documentation_section.safeParse({ locale: 'en', section_id: 'rdd', format: 'html', include_descendants: true }).success).toBe(true);
  expect(RequestSchemas.list_documentation_sections.safeParse({ locale: 'en', extra: true }).success).toBe(false);
  expect(RequestSchemas.search_documentation.safeParse({ locale: 'fr', query: 'x' }).success).toBe(false);
  expect(RequestSchemas.search_documentation.safeParse({ locale: 'en', query: 'x', limit: 20.5 }).success).toBe(false);
  expect(RequestSchemas.get_documentation_section.safeParse({ locale: 'en', section_id: '', format: 'text' }).success).toBe(false);
});

test('closes errors and preserves null identities for unavailable indexes', () => {
  expect(errors.map((code) => ErrorCodeSchema.safeParse(code).success)).toEqual(Array(15).fill(true));
  expect(ErrorCodeSchema.safeParse('other').success).toBe(false);
  expect(ResponseSchema.safeParse({ ...identity, operation: 'list_documentation_sections', locale: 'en', sections: [], error: { code: 'invalid_request', message: 'no' } }).success).toBe(false);
  expect(ResponseSchema.safeParse({ ...identity, operation: null, requested_operation: 'unknown', error: { code: 'invalid_request', message: 'no' } }).success).toBe(true);
  expect(ResponseSchema.safeParse({ ...identity, operation: 'list_documentation_sections', requested_operation: 'other', error: { code: 'invalid_request', message: 'no' } }).success).toBe(false);
  expect(ResponseSchema.safeParse({ ...identity, operation: null, requested_operation: 'list_documentation_sections', error: { code: 'invalid_request', message: 'no' } }).success).toBe(false);
  expect(ResponseSchema.safeParse({ ...identity, operation: 'list_documentation_sections', requested_operation: null, error: { code: 'invalid_request', message: 'no' } }).success).toBe(true);
  expect(ResponseSchema.safeParse({ ...identity, source_identity: null, source_version: null, index_identity: null, index_version: null, bounds_config_version: null, bounds: null, index_identity_status: 'unavailable', operation: null, requested_operation: null, error: { code: 'index_unavailable', message: 'missing' } }).success).toBe(true);
});

test('accepts strict failure envelopes and rejects invalid operation correlations', () => {
  const error = { code: 'invalid_request', message: 'no' };
  expect(ResponseSchema.safeParse({ ...identity, operation: null, requested_operation: 'unknown', error }).success).toBe(true);
  expect(ResponseSchema.safeParse({ ...identity, source_identity: null, source_version: null, index_identity: null, index_version: null, bounds_config_version: null, bounds: null, index_identity_status: 'unavailable', operation: null, requested_operation: null, error }).success).toBe(true);
  expect(ResponseSchema.safeParse({ ...identity, operation: 'list_documentation_sections', requested_operation: 'other', error }).success).toBe(false);
});

test('requires a positive ordinal on strict section records', () => {
  const section = { ordinal: 1, locale: 'en', id: 'section', title: 'Section', level: 2, parent_id: null, hierarchy: ['section'], canonical_url: 'https://docs.example/section', markdown: '# Section', html: '<h2>Section</h2>', plain_text: 'Section', source_identity: 'sha256:source', source_version: 'astro-render-sha256:source', index_identity: 'sha256:index', index_version: 'gentle-ai.docs-mcp-index/v1' };
  const { ordinal: _ordinal, ...missingOrdinal } = section;
  expect(SectionRecordSchema.safeParse(section).success).toBe(true);
  expect(SectionRecordSchema.safeParse(missingOrdinal).success).toBe(false);
  expect(SectionRecordSchema.safeParse({ ...section, ordinal: 0 }).success).toBe(false);
  expect(SectionRecordSchema.safeParse({ ...section, ordinal: 1.5 }).success).toBe(false);
});

test('rejects empty successful identities and undeclared bounds metadata', () => {
  const error = { code: 'invalid_request', message: 'no' };
  expect(ResponseSchema.safeParse({ ...identity, source_identity: '', operation: null, requested_operation: 'unknown', error }).success).toBe(false);
  expect(ResponseSchema.safeParse({ ...identity, operation: 'list_documentation_sections', locale: 'en', sections: [{ id: 'section', title: 'Section', level: 2, parent_id: null, hierarchy: ['section'], canonical_url: 'https://docs.example/section', source_identity: '', source_version: 'astro-render-sha256:source', index_identity: 'sha256:index', index_version: 'gentle-ai.docs-mcp-index/v1' }] }).success).toBe(false);
  expect(BoundsMetadataSchema.safeParse({ ...identity.bounds, undeclared: true }).success).toBe(false);
});
