import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const [route,name,width] of [
  ['/organizations/knowledge','overview',1440],
  ['/organizations/knowledge/work?persona=leo','my-work',390],
  ['/demos','continuity',1440],
]) {
  const page = await browser.newPage({ viewport: { width, height: 1000 } });
  await page.goto(`http://127.0.0.1:4173/#${route}`);
  const ready = name === 'overview' ? 'Workstream operating context' : name === 'my-work' ? 'My coordination follow-up' : 'Demo continuity';
  await page.getByRole('region', { name: ready, exact: true }).waitFor();
  await page.screenshot({ path: `previews/88-readable-${name}-${width}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
}
await browser.close();
