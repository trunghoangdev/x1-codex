import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const [record,width] of [['cycle-outcome-review',1440], ['cycle-revision-02',390]]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#/organizations/knowledge/walkthroughs/guide-cycle?persona=leo&cycleRecord=${record}`);
  await page.getByRole('region', { name: 'Selected cycle record' }).waitFor();
  await page.screenshot({ path: `previews/86-collaboration-cycle-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
