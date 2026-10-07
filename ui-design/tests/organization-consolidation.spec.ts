import {test,expect} from '@playwright/test';
for(const width of [390,1440]) test(`organization prioritizes coordination and reveals details by keyboard ${width}`,async({page})=>{
 await page.setViewportSize({width,height:1000});
 await page.goto('/#/organizations/knowledge?persona=leo');
 const history=page.locator('details').filter({has:page.locator('summary').filter({hasText:/^Contribution exchange history/})}).first();
 await expect(history).not.toHaveAttribute('open');
 await expect(page.getByRole('region',{name:'Concrete coordination needs'})).toBeVisible();
 await expect(page.getByRole('region',{name:'Organization workstreams'})).toBeVisible();
 const order=await page.evaluate(()=>{
 const work=document.getElementById('org-goals')!;
 const policy=document.getElementById('org-operating-context')!;
 return !!(work.compareDocumentPosition(policy)&Node.DOCUMENT_POSITION_FOLLOWING);
 });
 expect(order).toBe(true);
 await page.getByRole('button',{name:'Agreements, reviews & policy',exact:true}).focus();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Agreements, reviews & policy',exact:true})).toBeFocused();
 await expect(page.getByRole('region',{name:'Workstream operating context'})).toBeVisible();
 await history.locator(':scope > summary').focus();
 await page.keyboard.press('Enter');
 await expect(page.getByRole('region',{name:'Shared contribution observations'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
