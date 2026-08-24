import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4321' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: {
    command: 'npm run build && exec python3 -m http.server 4321 --bind 127.0.0.1 --directory dist',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: false,
  },
});
