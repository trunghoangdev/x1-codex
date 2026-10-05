import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
 const page = await browser.newPage({ viewport: { width, height: 1000 } });
 await page.goto('http://127.0.0.1:4173/#/demos/human-contribution');
 await page.getByLabel('Contribution text').fill('Contact the onboarding contact with your cohort and access question.');
 await page.getByLabel('Delivery note', { exact: true }).fill('Prepared for the illustrative cohort; review the next step.');
 await page.getByRole('checkbox').check();
 await page.getByRole('button', { name: 'Review delivery' }).click();
 await page.getByRole('button', { name: 'Record local delivery' }).click();
 await page.getByRole('button', { name: 'Simulate receiver receipt' }).click();
 await page.getByRole('button', { name: 'Simulate revision request' }).click();
 await page.getByRole('button', { name: 'Prepare draft-02' }).click();
 await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0,0); });
 await page.waitForTimeout(150);
 await page.screenshot({ path: `previews/91-human-contribution-${width}.png`, fullPage: true });
 await page.close();
}
await browser.close();
