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

function schemaProperties(schema: { properties?: Record<string, unknown> } | undefined) {
  expect(schema).toBeDefined();
  if (!schema?.properties) {
    throw new Error('advertised tool schema is missing properties');
  }
  return schema.properties;
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

  const searchDocsProperties = schemaProperties(byName.search_docs.inputSchema);
  const listSectionsProperties = schemaProperties(byName.list_sections.inputSchema);
  const getSectionProperties = schemaProperties(byName.get_section.inputSchema);

  expect(byName.search_docs.inputSchema.required).toEqual(['query']);
  expect(searchDocsProperties.query).toMatchObject({ type: 'string' });
  expect(searchDocsProperties.locale).toMatchObject({ enum: ['en', 'es'] });
  expect(searchDocsProperties.limit).toMatchObject({ type: 'integer', minimum: 1, maximum: 20 });

  expect(listSectionsProperties.locale).toMatchObject({ enum: ['en', 'es'] });
  expect(byName.list_sections.inputSchema.required ?? []).not.toContain('locale');

  expect(byName.get_section.inputSchema.required).toEqual(expect.arrayContaining(['id', 'locale']));
  expect(getSectionProperties.id).toMatchObject({ type: 'string' });
  expect(getSectionProperties.locale).toMatchObject({ enum: ['en', 'es'] });

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
    index: { schemaVersion: 1, commit: 'fixture01', sectionCount: 10 },
  });

  await client.close();
});

test('AC8: tools/list advertises an output schema for all three tools', async () => {
  const { client } = await connectedClient();

  const { tools } = await client.listTools();
  const byName = Object.fromEntries(tools.map((t) => [t.name, t]));

  const searchDocsOutput = schemaProperties(byName.search_docs.outputSchema);
  const listSectionsOutput = schemaProperties(byName.list_sections.outputSchema);
  const getSectionOutput = schemaProperties(byName.get_section.outputSchema);

  // Every response carries the index build identity (design.md: "Every tool
  // response carries { …payload, index: <build identity> }"), so the advertised
  // output schema must say so for all three tools.
  for (const output of [searchDocsOutput, listSectionsOutput, getSectionOutput]) {
    expect(output.index).toMatchObject({ type: 'object' });
  }

  expect(searchDocsOutput.query).toMatchObject({ type: 'string' });
  expect(searchDocsOutput.count).toMatchObject({ type: 'integer' });
  expect(searchDocsOutput.results).toMatchObject({ type: 'array' });

  expect(listSectionsOutput.count).toMatchObject({ type: 'integer' });
  expect(listSectionsOutput.sections).toMatchObject({ type: 'array' });

  expect(getSectionOutput.id).toMatchObject({ type: 'string' });
  expect(getSectionOutput.title).toMatchObject({ type: 'string' });
  expect(getSectionOutput.text).toMatchObject({ type: 'string' });
  expect(getSectionOutput.url).toMatchObject({ type: 'string' });
  expect(getSectionOutput.level).toMatchObject({ type: 'integer' });
  expect(getSectionOutput.locale).toMatchObject({ enum: ['en', 'es'] });

  expect(byName.get_section.outputSchema?.required).toEqual(
    expect.arrayContaining(['id', 'locale', 'title', 'level', 'url', 'text', 'index'])
  );

  await client.close();
});
