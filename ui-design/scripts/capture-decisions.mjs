import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chromium" });
for (const [route, name, width] of [
  ["/organization/decisions", "77-main-decisions-1440.png", 1440],
  [
    "/organizations/knowledge/decisions?persona=maya",
    "77-knowledge-decisions-390.png",
    390,
  ],
  [
    "/organizations/large/decisions?persona=sam",
    "77-larger-decisions-empty-1440.png",
    1440,
  ],
]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#${route}`);
  await page
    .getByRole("heading", { name: "Decision responsibility", exact: true })
    .waitFor();
  await page.screenshot({
    path: `previews/${name}`,
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}
await browser.close();
