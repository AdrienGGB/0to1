import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Phone viewports and touch, rendered with Chromium (the only browser installed locally and in CI).
  projects: [
    { name: "iphone-13", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "iphone-se", use: { ...devices["iPhone SE"], browserName: "chromium" } },
  ],
  webServer: {
    // Production build, without Supabase: answers are accepted (202) but not stored.
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: { ANTI_ABUSE_SECRET: "e2e-test-secret" },
  },
});
