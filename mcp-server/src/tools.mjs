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

/**
 * `get_section`: required `id` and `locale`, returns one section's entire
 * body untruncated — code-block line breaks and link destinations survive
 * exactly as extracted (spec: "get_section Tool Returns Full, Untruncated
 * Content"). `locale` is required, never optional, because a section id
 * repeats across locales (spec: "Locale Is Required Wherever A Section ID
 * Is Used"). `locale` stays `z.enum(LOCALES)` so the advertised schema
 * documents the domain, but with a custom error message naming the received
 * value — zod's default enum message does not include it (design.md:
 * "schema validation is the primary error path for unsupported locale").
 *
 * `id` is looked up as a MAP KEY only — `Array#find` against the loaded
 * sections, never a filesystem path, never `readFile`. An adversarial id
 * (`../etc/passwd`, `%00`, a 10 KiB string) simply fails to match any
 * section and returns the same typed unknown-id error as any other unknown
 * id (threat matrix: "get_section id with ../, %00, 10 KiB").
 */
export function registerGetSectionTool(server, indexStore) {
  server.registerTool(
    'get_section',
    {
      title: 'Get a Gentle AI documentation section',
      description:
        'Fetch one documentation section by id and locale, in full and untruncated — code blocks ' +
        'and links are returned exactly as extracted. locale is required because ids repeat across locales.',
      inputSchema: {
        id: z.string().describe('Section id, e.g. "engram" or "installation"'),
        locale: z.enum(LOCALES, {
          error: (issue) => `unsupported locale: ${JSON.stringify(issue.input)}`,
        }).describe('Locale of the section to fetch (required — ids repeat across locales)'),
      },
    },
    async ({ id, locale }) => {
      const index = indexStore.getBuildIdentity();
      const section = indexStore.getSections().find((s) => s.id === id && s.locale === locale);

      if (!section) {
        return {
          isError: true,
          content: [{ type: 'text', text: `no section with id ${JSON.stringify(id)} in locale "${locale}"` }],
        };
      }

      const { id: sectionId, locale: sectionLocale, title, level, url, text } = section;
      return toolResult({ id: sectionId, locale: sectionLocale, title, level, url, text, index });
    }
  );
}

export function registerTools(server, indexStore) {
  registerSearchDocsTool(server, indexStore);
  registerListSectionsTool(server, indexStore);
  registerGetSectionTool(server, indexStore);
}
