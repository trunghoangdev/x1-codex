import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chromium' });
for (const width of [1440,390]) {
 const page = await browser.newPage({ viewport: { width, height: 1000 } });
 await page.goto('http://127.0.0.1:4173/#/demos/human-contribution');
 await page.getByLabel('Contribution text').fill('Contact onboarding with your cohort and access question.');
 await page.getByLabel('Delivery note', { exact: true }).fill('Prepared for review.');
 await page.getByRole('checkbox').check();
 await page.getByText('Command delivery simulation', { exact: true }).click();
 await page.getByLabel('Submission result').selectOption('unknown');
 await page.getByRole('button', { name: 'Review delivery' }).click();
 await page.getByRole('button', { name: 'Record local delivery' }).click();
 await page.getByText('Inspect local command envelope', { exact: true }).click();
 await page.getByRole('region', { name: 'Contribution command status' }).screenshot({ path: `previews/93-contribution-command-${width}.png` });
 await page.close();
}
await browser.close();
