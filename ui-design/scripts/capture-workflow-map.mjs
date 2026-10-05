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
for (const [route, filename, width] of [
  ["/workflows/WS-01", "76-main-workflow-1440.png", 1440],
  ["/workflows/WS-01", "76-main-workflow-390.png", 390],
  [
    "/organizations/large/workflows/L-02?persona=sam",
    "76-larger-workflow-1440.png",
    1440,
  ],
]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#${route}`);
  await page.getByRole("heading", { name: /^Workflow ·/ }).waitFor();
  await page.screenshot({
    path: `previews/${filename}`,
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}
await browser.close();
