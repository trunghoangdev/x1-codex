import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
 const page = await browser.newPage({ viewport: { width, height: 1000 } });
 await page.goto('http://127.0.0.1:4173/#/demos/sf-retained/20260913T153424Z-eb63b7bd05303482');
 for (const [region,name] of [['Installed organization context','context'],['Accountability trace','trace']])
   await page.getByRole('region', { name: region }).screenshot({ style: ".topbar, .skip-link { visibility: hidden; }", path: `previews/94-sf-${name}-${width}.png` });
 await page.close();
}
await browser.close();
