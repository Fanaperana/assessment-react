import { defineConfig, devices } from "@playwright/test";

const env = {
  DATABASE_URL: "file:./test-e2e.db",
  BETTER_AUTH_SECRET: "playwright-test-secret-at-least-32-characters-long",
  BETTER_AUTH_URL: "http://localhost:3100",
  NEXT_PUBLIC_APP_URL: "http://localhost:3100",
  OPEN_LIBRARY_ORIGIN: "http://127.0.0.1:3101",
};

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/setup-db.ts",
  use: {
    baseURL: "http://localhost:3100",
    ...devices["Desktop Chrome"],
    channel: process.env.CI ? undefined : "chrome",
  },
  webServer: [
    {
      command: "node tests/open-library-fixture.mjs",
      url: "http://127.0.0.1:3101/search.json",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node node_modules/next/dist/bin/next start -p 3100",
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env,
    },
  ],
});
