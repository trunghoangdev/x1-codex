import { test, expect } from "@playwright/test";
import { organizationJourney } from "../src/data/organizationJourney";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
import { journeySource, chapterChanges } from "../src/data/journeyPresentation";

test('source previews separate workshop, exception, contribution and missing context',()=>{
  const stages=organizationJourney(), records=knowledgeTimeline(stages.at(-1)!.state);
  for(const [source,kind] of [['/workshop/K-02','Workshop delivery'],['/exceptions','Exception follow-up'],['Cross-workstream guide input','Workstream input']] as const){
    const selected=journeySource(records,source).records;
    expect(selected.length).toBeGreaterThan(0);
    expect(selected.every(e=>e.kind===kind)).toBe(true);
  }
  expect(journeySource(records,'/organizations/knowledge/contributions/K-01-H?persona=leo').records.every(e=>e.stream==='K-01')).toBe(true);
  expect(journeySource(records,'Unknown panel').records).toEqual([]);
  for(let i=1;i<stages.length;i++){
    const before=knowledgeTimeline(stages[i-1].state),after=knowledgeTimeline(stages[i].state),delta=chapterChanges(after,before);
    expect(delta.added.length).toBeGreaterThan(0);
    expect(delta.groups.reduce((n,g)=>n+g.count,0)).toBe(delta.added.length);
    expect(delta.added.every(e=>!before.some(p=>p.key===e.key))).toBe(true);
  }
});
for(const width of [390,1440])test(`chapter comparisons and scoped source are readable ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/#/organizations/knowledge/journey?persona=leo&journeyStep=reviewed');
  const summary=page.getByRole('region',{name:'Chapter changes summary'});
  await expect(summary).toContainText('1 new record');
  await expect(summary).toContainText('Workshop delivery · 1');
  await page.getByRole('button',{name:'Inspect flow step · K-02 · workshop',exact:true}).click();
  const preview=page.getByRole('region',{name:'Journey source preview'});
  await expect(preview).toContainText('Workshop cycles and criterion review');
  await expect(preview).toContainText('Criterion met in simulation');
  await expect(preview).toContainText('New in this chapter');
  await expect(preview).not.toContainText('Close exception');
  await expect(preview).not.toContainText('Deliver contribution');
  await expect(preview.getByRole('heading',{name:'Source context in this snapshot'})).toBeFocused();
  await page.getByRole('button',{name:'Previous chapter',exact:true}).click();
  await expect(preview).toHaveCount(0);
  await expect(summary).toContainText('Record observations');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
