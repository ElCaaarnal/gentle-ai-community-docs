import { z } from 'zod';

const positive = z.number().int().positive();
const metadata = {
  query_characters: positive, identifier_characters: positive, option_bytes: positive,
  request_bytes: positive, response_bytes: positive, result_count: positive,
  search_default_results: z.literal(8), search_max_results: z.literal(20),
  snippet_characters: positive, section_body_bytes: positive, serialized_evidence_bytes: positive,
  error_message_characters: positive, index_record_count: positive, serialized_index_bytes: positive,
  rate_limit_requests: positive, rate_limit_window_seconds: positive,
};

export const BoundsMetadataSchema = z.object(metadata).strict();
export const BoundsConfigSchema = z.object({
  bounds_config_version: z.literal('gentle-ai.docs-mcp-bounds/v1'), ...metadata,
  maximum_concurrent_sessions: positive, session_ttl_seconds: positive,
  sse_connection_duration_seconds: positive, maximum_sse_events: positive,
  index_synchronization_timeout_seconds: positive, synchronization_redirect_count: z.literal(0),
  retained_index_versions: positive, startup_deadline_seconds: positive, reload_deadline_seconds: positive,
}).strict();
export function isWithinCapacity(current: number, maximum: number): boolean {
  return current <= maximum;
}

export function isBeforeDeadline(elapsed: number, deadline: number): boolean {
  return elapsed < deadline;
}

export type BoundsMetadata = z.infer<typeof BoundsMetadataSchema>;
export type BoundsConfig = z.infer<typeof BoundsConfigSchema>;
