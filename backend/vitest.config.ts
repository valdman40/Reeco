import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      PORT: '3003', // Use different port for tests
      RATE_LIMIT_MAX_REQUESTS: '1000',
      ENABLE_METRICS: 'true',
    },
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
  },
});
