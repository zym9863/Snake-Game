import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['../unit_tests/frontend/**/*.test.ts'],
  },
});
