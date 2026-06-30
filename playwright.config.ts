import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "playwright/tests",
  timeout: 30_000,
  use: {
    headless: true,
    viewport: { width: 1440, height: 900 },
    actionTimeout: 10_000,
    ignoreHTTPSErrors: true,
    baseURL: "http://127.0.0.1:4173",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
  ],
});