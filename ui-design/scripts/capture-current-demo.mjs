import { chromium } from '@playwright/test';
const base = process.env.DEMO_BASE_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({channel:'chromium'});
try {
for(const width of [1440,390]) {
 const page=await browser.newPage({viewport:{width,height:1000}});
 await page.goto(`${base}/#/demos`);
 await page.getByRole('button',{name:'Start organization demo',exact:true}).click();
 await page.getByRole('region',{name:'Concrete coordination needs'}).waitFor();
 await page.screenshot({path:`previews/109-organization-${width===1440?'desktop':'phone'}.png`,fullPage:true,animations:'disabled'});
 if(width===1440){
 await page.getByRole('button',{name:/^My Work/}).click();
 await page.getByRole('button',{name:'Open contribution · K-01-H'}).click();
 await page.getByLabel('Contribution text').fill('Contact the onboarding contact with your cohort, account and access question.');
 await page.getByLabel('Delivery note',{exact:true}).fill('Prepared for editorial review; no publication requested.');
 await page.getByRole('checkbox').check();
 await page.screenshot({path:'previews/109-contribution.png',fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Review delivery'}).click();
 await page.getByRole('button',{name:'Record local delivery'}).click();
 await page.getByRole('combobox',{name:'Sample persona',exact:true}).selectOption('maya');
 await page.getByRole('region',{name:'Maya contribution inbox'}).waitFor();
 await page.screenshot({path:'previews/109-receiver.png',fullPage:true,animations:'disabled'});
 await page.goto(`${base}/#/evidence`);
 await page.getByRole('heading',{level:1}).waitFor();
 await page.screenshot({path:'previews/109-software-evidence.png',fullPage:true,animations:'disabled'});
 }
 await page.close();
}
} finally {await browser.close();}
