import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const [stream, width] of [['K-01',1440], ['K-02',390]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#/organizations/knowledge/patterns/${stream}?persona=leo`);
  await page.locator('main h1').waitFor();
  await page.screenshot({ path: `previews/83-${stream}-pattern-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
