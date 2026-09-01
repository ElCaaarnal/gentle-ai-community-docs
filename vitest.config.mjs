// .mjs matches astro.config.mjs and scripts/*.mjs; keeps it out of `astro check`
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.mjs', 'mcp-server/**/*.test.mjs'],
    exclude: [...configDefaults.exclude, 'tests/**', 'dist/**']
  }
});
