import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chromium" });
for (const [streamId, width] of [
  ["K-01", 1440],
  ["K-02", 1440],
  ["K-02", 390],
]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(
    `http://127.0.0.1:4173/#/organizations/knowledge/workflows/${streamId}?persona=maya`,
  );
  await page.getByRole("heading", { name: /^Workflow ·/ }).waitFor();
  await page.screenshot({
    path: `previews/75-knowledge-workflow-${streamId}-${width}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}
await browser.close();
