import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Run against the local development server on port 4173.
await mkdir("previews", { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:4173");
await page.screenshot({ path: "previews/01-my-work.png", fullPage: true });
await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
await page.screenshot({ path: "previews/02-assignment.png", fullPage: true });
await page.getByRole("button", { name: "Submit assessment" }).click();
await page
  .getByLabel("Decision rationale")
  .fill(
    "Reviewed the exact source change and AR-775 test evidence. Duplicate event handling and retry behavior meet the acceptance criteria.",
  );
await page.screenshot({ path: "previews/03-assessment.png", fullPage: true });
await page.keyboard.press("Escape");
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Organization", exact: true })
  .click();
await page.screenshot({ path: "previews/04-organization.png", fullPage: true });
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Evidence", exact: true })
  .click();
await page.screenshot({ path: "previews/05-evidence.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173");
await page.screenshot({ path: "previews/06-mobile.png", fullPage: true });
await browser.close();
