import { expect, test } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { SUPPORTED_PROTOCOL_VERSIONS } from '@modelcontextprotocol/sdk/types.js';

// AC8: representative client consumption. Drives the fixture-backed server
// (mcp-http project's webServer, playwright.config.ts) with a real
// @modelcontextprotocol/sdk Client over Streamable HTTP — the SAME hoisted
// SDK version the server runs (design.md: "mcp-server/ is an npm workspace"
// decision — one root install pins the SDK once, so client and server never
// drift). This is the one automated test the spec requires to run in CI
// without external credentials or an installed third-party agent (manual
// verification with the four named agents is separate — see Unit 7).

const SERVER_URL = new URL('http://127.0.0.1:3111/mcp');

async function connectedClient() {
  const client = new Client({ name: 'ac8-test-client', version: '0.0.0-test' });
  const transport = new StreamableHTTPClientTransport(SERVER_URL);
  await client.connect(transport);
  return { client, transport };
}

test('AC8: a real SDK Client completes initialize over Streamable HTTP with a supported protocol version', async () => {
  const { client, transport } = await connectedClient();

  // Negotiated protocol version: the transport must have settled on one of
  // the versions the SDK itself supports — not an arbitrary or absent value.
  expect(transport.protocolVersion).toBeTruthy();
  expect(SUPPORTED_PROTOCOL_VERSIONS).toContain(transport.protocolVersion);

  const serverVersion = client.getServerVersion();
  expect(serverVersion?.name).toBe('gentle-ai-docs-mcp');
  // Sourced from mcp-server/package.json's `version` (design.md's release identifier).
  expect(serverVersion?.version).toBe('0.1.0');

  await client.close();
});

test('AC8: tools/list advertises all three tool schemas', async () => {
  const { client } = await connectedClient();

  const { tools } = await client.listTools();
  const byName = Object.fromEntries(tools.map((t) => [t.name, t]));

  expect(Object.keys(byName).sort()).toEqual(['get_section', 'list_sections', 'search_docs']);

  expect(byName.search_docs.inputSchema.required).toEqual(['query']);
  expect(byName.search_docs.inputSchema.properties.query).toMatchObject({ type: 'string' });
  expect(byName.search_docs.inputSchema.properties.locale).toMatchObject({ enum: ['en', 'es'] });
  expect(byName.search_docs.inputSchema.properties.limit).toMatchObject({ type: 'integer', minimum: 1, maximum: 20 });

  expect(byName.list_sections.inputSchema.properties.locale).toMatchObject({ enum: ['en', 'es'] });
  expect(byName.list_sections.inputSchema.required ?? []).not.toContain('locale');

  expect(byName.get_section.inputSchema.required).toEqual(expect.arrayContaining(['id', 'locale']));
  expect(byName.get_section.inputSchema.properties.id).toMatchObject({ type: 'string' });
  expect(byName.get_section.inputSchema.properties.locale).toMatchObject({ enum: ['en', 'es'] });

  await client.close();
});

test('AC8: tools/call returns the exact fixture section content for a known id', async () => {
  const { client } = await connectedClient();

  const result = await client.callTool({
    name: 'get_section',
    arguments: { id: 'memory', locale: 'en' },
  });

  expect(result.isError).toBeFalsy();
  expect(result.structuredContent).toMatchObject({
    id: 'memory',
    locale: 'en',
    title: 'Persistent Memory',
    url: 'https://docs-gentle-ai.netlify.app/#memory',
    text:
      'Engram provides persistent memory that survives across sessions and compactions. Every decision, ' +
      'bug fix, and discovered convention gets saved automatically so agents remember prior work instead ' +
      'of repeating the same exploration.',
  });
  expect(result.structuredContent).toMatchObject({
    index: { schemaVersion: 1, commit: 'fixture01', sectionCount: 9 },
  });

  await client.close();
});
