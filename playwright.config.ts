import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 240000,
  use: {
    baseURL: "http://localhost:5173",
    // Gameplay regression tests start after optional account onboarding.
    // The account suite explicitly tests first visits with empty storage.
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:5173",
          localStorage: [
            {
              name: "please-fix-human:v4:account-introduction",
              value: "dismissed",
            },
          ],
        },
      ],
    },
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl"],
    },
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
  workers: 1,
});
