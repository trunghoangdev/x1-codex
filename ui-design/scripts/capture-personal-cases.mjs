import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/organizations/knowledge/work?persona=leo');
  await page.getByRole('region', { name: 'My coordination follow-up' }).waitFor();
  await page.screenshot({ path: `previews/85-leo-personal-follow-up-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
