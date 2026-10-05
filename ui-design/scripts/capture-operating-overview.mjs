import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/organizations/knowledge?persona=leo');
  await page.getByRole('region', { name: 'Workstream operating context' }).waitFor();
  await page.screenshot({ fullPage: true, path: `previews/84-operating-overview-${width}.png`, animations: 'disabled' });
  await page.close();
}
await browser.close();
