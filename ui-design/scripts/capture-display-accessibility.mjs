import { chromium, firefox } from '@playwright/test';
for (const [name,type] of [['chromium',chromium],['firefox',firefox]]) {
 const browser = await type.launch(name === 'chromium' ? { channel: 'chromium' } : {});
 console.log(`${name}: ${browser.version()}`);
 const page = await browser.newPage({ viewport: { width: 320, height: 900 }, forcedColors: 'active' });
 await page.goto('http://127.0.0.1:4173/#/demos/human-contribution');
 await page.getByLabel('Contribution text').fill('Guide text remains readable in forced colors.');
 await page.getByLabel('Delivery note', { exact: true }).fill('For review.');
 await page.getByLabel('Contribution text').focus();
 await page.locator('.human-contribution-page .panel').nth(1).screenshot({ style: '.topbar, .skip-link { visibility:hidden }', path: `previews/95-forced-colors-${name}-320.png` });
 await browser.close();
}
