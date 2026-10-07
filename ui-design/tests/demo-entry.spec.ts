import {test,expect} from '@playwright/test';
test('recommended demo entry selects organization and preserves contribution',async({page})=>{
 await page.goto('/#/demos');
 await page.getByRole('button',{name:'Start organization demo',exact:true}).click();
 await expect(page).toHaveURL(/organizations\/knowledge\?persona=leo$/);
 await page.getByRole('button',{name:/^My Work/}).click();
 await page.getByRole('button',{name:'Open contribution · K-01-H'}).click();
 await expect(page.getByRole('button',{name:/^My Work/})).toHaveAttribute('aria-current','page');
 await page.getByLabel('Contribution text').fill('Keep this contribution.');
 await page.getByRole('button',{name:'Demos',exact:true}).click();
 await page.getByRole('button',{name:'Start organization demo',exact:true}).click();
 await page.getByRole('button',{name:/^My Work/}).click();
 await page.getByRole('button',{name:'Open contribution · K-01-H'}).click();
 await expect(page.getByLabel('Contribution text')).toHaveValue('Keep this contribution.');
 await page.getByRole('combobox',{name:'Sample persona',exact:true}).selectOption('maya');
 await expect(page.getByRole('button',{name:/^My Work/})).toHaveAttribute('aria-current','page');
});
