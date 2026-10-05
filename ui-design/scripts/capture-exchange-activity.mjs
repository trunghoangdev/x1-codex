import { chromium } from "@playwright/test";
const browser = await chromium.launch({ channel: "chromium" });
for (const [route, name, width] of [
  [
    "/organizations/knowledge/activity?persona=leo",
    "78-knowledge-exchange-history-1440.png",
    1440,
  ],
  [
    "/organizations/knowledge/activity?persona=maya&actKind=acknowledgment&event=brief-receipt-v0",
    "78-knowledge-exchange-receipt-390.png",
    390,
  ],
  [
    "/organizations/large/activity?persona=sam",
    "78-larger-exchange-empty-1440.png",
    1440,
  ],
]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#${route}`);
  await page
    .getByRole("heading", { name: "Coordination activity", exact: true })
    .waitFor();
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: `previews/${name}`,
    fullPage: true,
    animations: "disabled",
  });
  await page.close();
}
await browser.close();
