import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['backend/src/**/*.test.ts', 'backend/*.test.mjs', 'packages/*/src/**/*.test.ts'],
  },
});
