import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/accounts",
  outputDir: "./test-results/accounts",
  timeout: 45_000,
  use: {
    baseURL: "http://localhost:5174",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "npm run dev -- --port 5174 --strictPort",
    url: "http://localhost:5174",
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "https://pfh-test.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    },
  },
  workers: 1,
});
