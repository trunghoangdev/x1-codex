import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto('http://127.0.0.1:4173/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482');
  await page.getByRole('heading', { name: 'Export integrity observations', exact: true }).waitFor();
  await page.screenshot({ path: `previews/90-sf-retained-${width}.png`, fullPage: true });
  await page.close();
}
await browser.close();
