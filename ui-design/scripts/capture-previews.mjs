import { chromium, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

// Run against the local development server on port 4173.
await mkdir("previews", { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1,
});
await page.goto("http://127.0.0.1:4173");
await page.screenshot({
  path: "previews/01-my-work.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
await page.screenshot({
  path: "previews/02-assignment.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Submit assessment" }).click();
await page
  .getByLabel("Decision rationale")
  .fill(
    "Reviewed the illustrative retry changes. Duplicate-event handling and verified test evidence still need separate review.",
  );
await page.screenshot({
  path: "previews/03-assessment.png",
  animations: "disabled",
  fullPage: true,
});
await page.keyboard.press("Escape");
for (const [tab, name] of [
  ["Attempts", "07-attempts"],
  ["Candidate", "08-candidate"],
  ["Checks", "09-checks"],
]) {
  await page.getByRole("tab", { name: tab, exact: true }).click();
  await page.screenshot({
    path: `previews/${name}.png`,
    animations: "disabled",
    fullPage: true,
  });
}
await page.getByRole("button", { name: "Submit assessment" }).click();
await page
  .getByLabel("Decision rationale")
  .fill(
    "Sample review: additional evidence is required before accepting the entire objective.",
  );
await page.getByRole("button", { name: "Record assessment" }).click();
await page.getByRole("button", { name: "View record", exact: true }).click();
await page.locator(".toast").waitFor({ state: "hidden" });
await page.screenshot({
  path: "previews/10-receipt.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Back to My Work" }).click();
await page.getByRole("button", { name: "View release assignment" }).click();
await page.screenshot({
  path: "previews/11-release-review.png",
  animations: "disabled",
  fullPage: true,
});
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Organization", exact: true })
  .click();
await page.screenshot({
  path: "previews/04-organization.png",
  animations: "disabled",
  fullPage: true,
});
await page
  .getByRole("navigation")
  .getByRole("button", { name: "Evidence", exact: true })
  .click();
await page.screenshot({
  path: "previews/05-evidence.png",
  animations: "disabled",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:4173");
await page.screenshot({
  path: "previews/06-mobile.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: /A-1042.*Review retry/ }).click();
await page.getByRole("tab", { name: "Candidate", exact: true }).click();
await page.screenshot({
  path: "previews/12-mobile-candidate.png",
  animations: "disabled",
  fullPage: true,
});
await page.setViewportSize({ width: 1440, height: 1100 });
await page.goto("http://127.0.0.1:4173/#/assignments/A-1042/candidate");
await page.getByRole("button", { name: "Side by side", exact: true }).click();
await page.screenshot({
  path: "previews/13-split-diff.png",
  animations: "disabled",
  fullPage: true,
});
await page.goto("http://127.0.0.1:4173/#/work");
await page.locator(".demo-controls summary").click();
await page.getByLabel("Data preview", { exact: true }).selectOption("error");
await expect(page.getByRole("alert")).toContainText("Could not load your work");
await page.screenshot({
  path: "previews/14-load-error.png",
  animations: "disabled",
  fullPage: true,
});
await page.getByRole("button", { name: "Retry sample load" }).click();
await expect(page.locator(".assignment-row")).toHaveCount(5);
await page.goto("http://127.0.0.1:4173/#/assignments/A-1042/activity");
await page.getByLabel("Activity type").selectOption("evidence");
await page.screenshot({
  path: "previews/15-activity.png",
  animations: "disabled",
  fullPage: true,
});
await browser.close();
