import { z } from 'zod';
import { BoundsMetadataSchema } from './bounds.js';

export const OperationNameSchema = z.enum(['list_documentation_sections', 'search_documentation', 'get_documentation_section']);
export const ErrorCodeSchema = z.enum(['invalid_request', 'unsupported_locale', 'invalid_query', 'invalid_limit', 'invalid_format', 'invalid_section_id', 'section_not_found', 'bounded_input', 'bounded_response', 'origin_not_allowed', 'method_not_allowed', 'rate_limited', 'index_unavailable', 'index_malformed', 'service_unavailable']);
const locale = z.enum(['en', 'es']);
const text = z.string().min(1);
const summary = z.object({ id: text, title: text, level: z.union([z.literal(2), z.literal(3)]), parent_id: text.nullable(), hierarchy: z.array(text).min(1), canonical_url: z.url(), source_identity: text, source_version: text, index_identity: text, index_version: text }).strict();
const content = summary.extend({ format: z.enum(['markdown', 'html']), body: z.string() }).strict();
const metadata = z.object({ service_identity: text, schema_identity: text, source_identity: text, source_version: text, index_identity: text, index_version: text, bounds_config_version: text, bounds: BoundsMetadataSchema, index_identity_status: z.literal('loaded') }).strict();
const unavailableMetadata = z.object({ service_identity: text, schema_identity: text, source_identity: z.null(), source_version: z.null(), index_identity: z.null(), index_version: z.null(), bounds_config_version: z.null(), bounds: z.null(), index_identity_status: z.literal('unavailable') }).strict();
export const RequestSchemas = {
  list_documentation_sections: z.object({ locale }).strict(),
  search_documentation: z.object({ locale, query: z.string().trim().min(1).max(256), limit: z.number().int().min(1).max(20).optional() }).strict(),
  get_documentation_section: z.object({ locale, section_id: text.max(128), format: z.enum(['markdown', 'html']).optional(), include_descendants: z.boolean().optional() }).strict(),
} as const;
const failure = { operation: OperationNameSchema.nullable(), requested_operation: z.string().max(128).nullable(), error: z.object({ code: ErrorCodeSchema, message: text.max(256) }).strict() };
const refineFailure = ({ operation, requested_operation }: { operation: z.infer<typeof OperationNameSchema> | null; requested_operation: string | null }, context: z.RefinementCtx) => {
  if (operation && requested_operation) context.addIssue({ code: 'custom', message: 'Only one operation field is allowed.' });
  if (!operation && requested_operation && OperationNameSchema.safeParse(requested_operation).success) context.addIssue({ code: 'custom', message: 'Recognized operations belong in operation.' });
};
const list = metadata.extend({ operation: z.literal('list_documentation_sections'), locale, sections: z.array(summary) }).strict();
const search = metadata.extend({ operation: z.literal('search_documentation'), locale, results: z.array(summary.extend({ snippet: text }).strict()) }).strict();
const get = metadata.extend({ operation: z.literal('get_documentation_section'), locale, section: content, descendants: z.array(content).optional() }).strict();
export const ResponseSchema = z.union([list, search, get, metadata.extend(failure).strict().superRefine(refineFailure), unavailableMetadata.extend(failure).strict().superRefine(refineFailure)]);
export type OperationName = z.infer<typeof OperationNameSchema>;
export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
