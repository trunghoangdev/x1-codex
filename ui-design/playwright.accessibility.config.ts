import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
const { channel: _channel, ...commonUse } = base.use ?? {};
export default defineConfig({
  ...base,
  use: commonUse,
  testMatch: "display-accessibility.spec.ts",
  projects: [
    { name: "chromium", use: { browserName: "chromium", channel: "chromium" } },
    { name: "firefox", use: { browserName: "firefox", channel: undefined } },
  ],
});
