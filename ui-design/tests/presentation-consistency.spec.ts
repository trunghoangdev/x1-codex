import { test, expect } from "@playwright/test";
for(const width of [320,640,1440])test(`coordination presentation wraps and restores source focus ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/#/organizations/knowledge/journey?persona=leo&journeyStep=reviewed');
  const button=page.getByRole('button',{name:'Inspect flow step · K-02 · workshop',exact:true});
  await button.focus(); await page.keyboard.press('Enter');
  const source=page.getByRole('region',{name:'Journey source preview'});
  await expect(source.getByRole('heading',{name:'Source context in this snapshot',exact:true})).toBeFocused();
  await expect(source.locator('.record-marker')).toHaveCount(1);
  await source.getByRole('button',{name:'Close snapshot preview',exact:true}).click();
  await expect(button).toBeFocused();
  const disclosure=page.getByRole('region',{name:'Cross-workstream input relationship'}).locator('summary').first();
  await disclosure.focus();await page.keyboard.press('Enter');
  await expect(disclosure.locator('..')).toHaveAttribute('open','');
  expect(await disclosure.evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  for(const path of ['/organizations/knowledge','/organizations/knowledge/work?persona=maya','/organizations/large']){
    await page.goto('/#'+path);
    await expect(page.locator('main h1').first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('/#/organizations/knowledge/journey?persona=leo&journeyStep=reviewed');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===320) await page.screenshot({path:'/home/trungh/ws_x1/x1-codex/.cache/ui-consistency-320.png',fullPage:true});
  if(width===1440) await page.screenshot({path:'/home/trungh/ws_x1/x1-codex/.cache/ui-consistency-1440.png',fullPage:true});
});
test('guided chapter and source controls remain explicit in forced colors',async({page})=>{
  await page.emulateMedia({forcedColors:'active'});
  await page.setViewportSize({width:390,height:900});
  await page.goto('/#/organizations/knowledge/journey?persona=leo&journeyStep=reviewed');
  await expect(page.locator('[aria-current="step"]')).toContainText('Review the result');
  const button=page.getByRole('button',{name:'Inspect flow step · K-02 · workshop',exact:true});
  await button.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('region',{name:'Journey source preview'})).toContainText('New in this chapter');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
