import { z } from 'zod';
import { BoundsConfigSchema } from './bounds.js';

const identity = z.string().min(1);
export const SectionRecordSchema = z.object({
  locale: z.enum(['en', 'es']), ordinal: z.number().int().positive(), id: z.string().min(1), title: z.string().min(1), level: z.union([z.literal(2), z.literal(3)]),
  parent_id: z.string().min(1).nullable(), hierarchy: z.array(z.string().min(1)).min(1), canonical_url: z.url(),
  markdown: z.string(), html: z.string(), plain_text: z.string(), source_identity: identity, source_version: identity,
  index_identity: identity, index_version: identity,
}).strict();
export const ValidatedIndexSchema = z.object({
  schema_identity: z.literal('gentle-ai.docs-mcp-index/v1'), source_identity: identity, source_version: identity,
  index_identity: identity, index_version: z.literal('gentle-ai.docs-mcp-index/v1'),
  bounds_config_version: z.literal('gentle-ai.docs-mcp-bounds/v1'), bounds: BoundsConfigSchema,
  locales: z.object({ en: z.array(SectionRecordSchema), es: z.array(SectionRecordSchema) }).strict(),
}).strict();
export type SectionRecord = z.infer<typeof SectionRecordSchema>;
export type ValidatedIndex = z.infer<typeof ValidatedIndexSchema>;
