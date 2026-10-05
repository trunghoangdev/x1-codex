import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/demos/sf-snapshot/snapshot-attempt-02');
  await page.getByRole('heading', { name: 'Work product', exact: true }).waitFor();
  await page.screenshot({ path: `previews/89-sf-snapshot-${width}.png`, fullPage: true });
  await page.close();
}
await browser.close();
