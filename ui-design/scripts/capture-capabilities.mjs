import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const [worker, width] of [['jamie',1440], ['codex',390]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#/workers/${worker}`);
  await page.getByRole('region', { name: 'Worker capability and availability' }).waitFor();
  await page.screenshot({ path: `previews/82-${worker}-capability-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
