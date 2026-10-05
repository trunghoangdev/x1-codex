import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/organizations/knowledge/agreements/K-01?persona=leo&agreementVersion=brief-v2&compare=yes');
  await page.locator('main h1').waitFor();
  await page.screenshot({ path: `previews/80-knowledge-agreement-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
