import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  snapshotPathTemplate: '{testDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
  use: { baseURL: 'http://127.0.0.1:4321' },
  projects: [
    { name: 'chromium-desktop', testMatch: 'docs.spec.ts', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-narrow', testMatch: 'docs.spec.ts', use: { browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    { name: 'mcp-http', testMatch: 'mcp-*.spec.ts', use: { baseURL: 'http://127.0.0.1:3111' } },
  ],
  webServer: [
    {
      command: 'npm run build && exec python3 -m http.server 4321 --bind 127.0.0.1 --directory dist',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: false,
    },
    {
      command: 'node mcp-server/src/server.mjs',
      url: 'http://127.0.0.1:3111/health',
      reuseExistingServer: false,
      env: {
        PORT: '3111',
        ALLOWED_HOSTS: '127.0.0.1,localhost',
        ALLOWED_ORIGINS: 'https://trusted.example',
        DOCS_INDEX_PATH: 'mcp-server/test/fixtures/docs-index.json',
      },
    },
  ],
});
