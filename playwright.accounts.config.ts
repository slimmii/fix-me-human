import { defineConfig } from "@playwright/test";

const port = Number(process.env.PFH_ACCOUNT_TEST_PORT ?? 5174);
const origin = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests/accounts",
  outputDir: "./test-results/accounts",
  timeout: 45_000,
  use: {
    baseURL: origin,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: origin,
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "https://pfh-test.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    },
  },
  workers: 1,
});
