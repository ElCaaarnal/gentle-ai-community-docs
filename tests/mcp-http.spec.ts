import { expect, test } from '@playwright/test';

// Fixture-backed MCP server: mcp-server/test/fixtures/docs-index.json, started by
// the `mcp-http` Playwright project's webServer (see playwright.config.ts).
const EXPECTED_INDEX = {
  schemaVersion: 1,
  generatedAt: '2026-08-31T00:00:00.000Z',
  commit: 'fixture01',
  sectionCount: 8,
};

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

function toolCall(name: string, args: Record<string, unknown> = {}, id = 1) {
  return { jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } };
}

test.describe('origin validation', () => {
  test('a missing Origin header proceeds to MCP processing', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('list_sections'),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.result.structuredContent.index).toEqual(EXPECTED_INDEX);
  });

  test('the literal Origin: null is rejected with 403 forbidden origin', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: { ...MCP_HEADERS, Origin: 'null' },
      data: toolCall('list_sections'),
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('forbidden origin');
  });

  test('an untrusted Origin host is rejected with 403 forbidden origin', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: { ...MCP_HEADERS, Origin: 'https://evil.example' },
      data: toolCall('list_sections'),
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('forbidden origin');
  });
});

test.describe('host header validation', () => {
  test('a Host outside the allow-list is rejected before MCP processing', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: { ...MCP_HEADERS, Host: 'evil.example' },
      data: toolCall('list_sections'),
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error.message).toContain('Invalid Host');
  });
});

test.describe('server-initiated streaming is not supported', () => {
  test('GET /mcp returns 405', async ({ request }) => {
    const response = await request.get('/mcp');
    expect(response.status()).toBe(405);
  });

  test('DELETE /mcp returns 405', async ({ request }) => {
    const response = await request.delete('/mcp');
    expect(response.status()).toBe(405);
  });
});

test('a request body over 1mb is rejected', async ({ request }) => {
  const oversized = 'a'.repeat(1_100_000);
  const response = await request.post('/mcp', {
    headers: MCP_HEADERS,
    data: toolCall('search_docs', { query: oversized }),
  });

  expect(response.status()).toBe(413);
});

test.describe('search_docs', () => {
  test('a valid query succeeds and carries the index build identity', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('search_docs', { query: 'installation' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const output = body.result.structuredContent;

    expect(output.count).toBeGreaterThan(0);
    expect(output.results[0].id).toBe('installation');
    expect(output.index).toEqual(EXPECTED_INDEX);
  });
});

test.describe('list_sections', () => {
  test('a valid call succeeds, lists every locale, and carries the index build identity', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('list_sections'),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const output = body.result.structuredContent;

    expect(output.count).toBe(8);
    expect(output.sections).toHaveLength(8);
    expect(output.sections[0]).toHaveProperty('id');
    expect(output.sections[0]).toHaveProperty('title');
    expect(output.sections[0]).toHaveProperty('level');
    expect(output.sections[0]).toHaveProperty('locale');
    expect(output.sections[0]).not.toHaveProperty('text');
    expect(output.index).toEqual(EXPECTED_INDEX);
  });

  test('a locale filter narrows the result to that locale only', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('list_sections', { locale: 'es' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const output = body.result.structuredContent;

    expect(output.count).toBe(4);
    for (const section of output.sections) {
      expect(section.locale).toBe('es');
    }
  });
});
