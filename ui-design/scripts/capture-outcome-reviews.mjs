import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/organizations/knowledge/outcome-reviews/guide-review-01?persona=leo');
  await page.locator('main h1').waitFor();
  await page.screenshot({ path: `previews/81-knowledge-outcome-review-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
