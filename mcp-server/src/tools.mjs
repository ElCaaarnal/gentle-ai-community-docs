// Read-only MCP tool registrations over the docs index. Each tool response
// carries the loaded index's build identity (design.md — "Every tool response
// carries { …payload, index: <build identity> }") so a caller can detect a
// stale build without a separate call.

import { z } from 'zod';
import { search } from './search.mjs';

const LOCALES = ['en', 'es'];

function toolResult(output) {
  return {
    content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
    structuredContent: output,
  };
}

/**
 * `search_docs`: required `query`, optional `locale`/`limit`, BM25-lite
 * ranked results. Empty/whitespace `query` is a typed error, never an empty
 * success (spec: "Empty query is an error, not empty results"). A well-formed
 * query matching nothing is success with `count: 0` (spec: "A Valid Query
 * Matching Nothing Is A Legitimate Empty Result").
 */
export function registerSearchDocsTool(server, indexStore) {
  server.registerTool(
    'search_docs',
    {
      title: 'Search Gentle AI documentation',
      description:
        'Search the Gentle AI community documentation by relevance. Returns matching ' +
        'sections with a bounded snippet (max 400 chars) and a canonical URL to cite.',
      inputSchema: {
        query: z.string().describe('Search terms, e.g. "engram memory" or "sdd phases"'),
        locale: z.enum(LOCALES).optional().describe('Restrict to a locale. Omit to search both.'),
        limit: z.number().int().min(1).max(20).optional().describe('Max results (default 5)'),
      },
    },
    async ({ query, locale, limit = 5 }) => {
      const index = indexStore.getBuildIdentity();

      if (!query.trim()) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'query must not be empty' }],
        };
      }

      const results = search({ sections: indexStore.getSections(), query, locale, limit });
      return toolResult({ query, locale: locale ?? 'all', count: results.length, results, index });
    }
  );
}

/**
 * `list_sections`: optional `locale`, returns id/title/level/locale only —
 * no body text — for discovery independent of a search query.
 */
export function registerListSectionsTool(server, indexStore) {
  server.registerTool(
    'list_sections',
    {
      title: 'List Gentle AI documentation sections',
      description: 'List every indexed documentation section (id, title, level, locale), no body text.',
      inputSchema: {
        locale: z.enum(LOCALES).optional().describe('Restrict to a locale. Omit to list every locale.'),
      },
    },
    async ({ locale }) => {
      const index = indexStore.getBuildIdentity();
      const sections = indexStore
        .getSections()
        .filter((section) => !locale || section.locale === locale)
        .map(({ id, title, level, locale: sectionLocale }) => ({ id, title, level, locale: sectionLocale }));

      return toolResult({ count: sections.length, sections, index });
    }
  );
}

export function registerTools(server, indexStore) {
  registerSearchDocsTool(server, indexStore);
  registerListSectionsTool(server, indexStore);
}
