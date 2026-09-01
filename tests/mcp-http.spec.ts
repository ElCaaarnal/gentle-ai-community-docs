import { expect, test } from '@playwright/test';

// Fixture-backed MCP server: mcp-server/test/fixtures/docs-index.json, started by
// the `mcp-http` Playwright project's webServer (see playwright.config.ts).
const EXPECTED_INDEX = {
  schemaVersion: 1,
  generatedAt: '2026-08-31T00:00:00.000Z',
  commit: 'fixture01',
  sectionCount: 9,
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

test.describe('get_section', () => {
  test('a valid id and locale returns the full untruncated body with code blocks and links intact', async ({
    request,
  }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('get_section', { id: 'installation', locale: 'en' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    const output = body.result.structuredContent;

    expect(output.id).toBe('installation');
    expect(output.locale).toBe('en');
    expect(output.title).toBe('Installation');
    expect(output.url).toBe('https://docs-gentle-ai.netlify.app/#installation');
    expect(output.text).toBe(
      'Install Gentle AI with npm install -g gentle-ai. Installation configures your coding agent ' +
        'automatically and takes less than a minute to complete.\n\n```bash\nnpm install -g gentle-ai\n' +
        'gentle-ai init\ngentle-ai doctor\n```\n\nFull reference: https://docs-gentle-ai.netlify.app/#installation'
    );

    // Code-block fidelity: the three commands stay on separate lines, untruncated.
    const lines = output.text.split('\n');
    expect(lines).toContain('npm install -g gentle-ai');
    expect(lines).toContain('gentle-ai init');
    expect(lines).toContain('gentle-ai doctor');

    // Link fidelity: the destination survives verbatim.
    expect(output.text).toContain('https://docs-gentle-ai.netlify.app/#installation');
    expect(output.index).toEqual(EXPECTED_INDEX);
  });

  test('an unknown id for a given locale returns a typed error naming both', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('get_section', { id: 'does-not-exist', locale: 'en' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.result.isError).toBe(true);
    const message = body.result.content[0].text;
    expect(message).toContain('does-not-exist');
    expect(message).toContain('en');
  });

  test('a missing locale is a schema validation error', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('get_section', { id: 'installation' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain('locale');
  });

  test('a locale outside en/es is a typed error naming the received value', async ({ request }) => {
    const response = await request.post('/mcp', {
      headers: MCP_HEADERS,
      data: toolCall('get_section', { id: 'installation', locale: 'fr' }),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.result.isError).toBe(true);
    expect(body.result.content[0].text).toContain('fr');
  });

  for (const adversarialId of ['../etc/passwd', '%00', 'a'.repeat(10 * 1024)]) {
    test(`an adversarial id (${adversarialId.slice(0, 20)}...) is rejected as a typed unknown-id error, never a filesystem path`, async ({
      request,
    }) => {
      const response = await request.post('/mcp', {
        headers: MCP_HEADERS,
        data: toolCall('get_section', { id: adversarialId, locale: 'en' }),
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      const message = body.result.content[0].text;

      expect(body.result.isError).toBe(true);
      // Must be the SAME typed unknown-id error a well-formed unknown id gets —
      // not the generic "tool not found" error and never a Node fs error
      // (ENOENT/EISDIR/etc.), which id-as-map-key rules out by construction.
      expect(message).toContain('no section with id');
      expect(message).toContain('en');
      expect(message).not.toContain('Tool get_section not found');
      expect(message).not.toMatch(/ENOENT|EISDIR|no such file/i);
    });
  }
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

    expect(output.count).toBe(9);
    expect(output.sections).toHaveLength(9);
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
