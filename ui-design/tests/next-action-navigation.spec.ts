import { test, expect } from "@playwright/test";
import { organizationJourney } from "../src/data/organizationJourney";
import { knowledgeCheckpointKey, encodeKnowledgeCheckpoint } from "../src/data/knowledgeCheckpoint";
import { validScenarioPath } from "../src/scenarioRoutes";

test("action context accepts only supported actors and destinations",()=>{
  expect(validScenarioPath('/organizations/knowledge/workshop/K-02?persona=maya&nextActor=maya')).toBe(true);
  expect(validScenarioPath('/organizations/knowledge/cases/current-workshop-brief?nextActor=owner')).toBe(false);
  expect(validScenarioPath('/organizations/knowledge/journey?nextActor=leo')).toBe(false);
  expect(validScenarioPath('/organizations/knowledge/exceptions?nextActor=leo&nextTicket=exception-1')).toBe(true);
  expect(validScenarioPath('/organizations/knowledge/exceptions?nextTicket=exception-1')).toBe(false);
});
for(const width of [390,1440]) for(const flow of ['workshop','case','exception'] as const) test(`next ${flow} opens the actor and source with keyboard focus ${width}`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const stages=organizationJourney();
  const state=structuredClone(stages.find(s=>s.id===(flow==='exception'?'failure':flow==='workshop'?'evidence':'prepared'))!.state);
  if(flow==='case'){state.workshopEvents=[];state.caseEvents=state.caseEvents!.slice(0,-1);}
  const actor=flow==='exception'?'leo':'maya';
  const raw=encodeKnowledgeCheckpoint(state);
  await page.addInitScript(({key,raw})=>localStorage.setItem(key,raw),{key:knowledgeCheckpointKey,raw});
  await page.goto(`/#/organizations/knowledge/work?persona=${actor}`);
  await page.getByText('Save or restore whole Knowledge workspace',{exact:true}).click();
  await page.getByRole('button',{name:'Review saved workspace',exact:true}).click();
  await page.getByRole('button',{name:'Confirm workspace replacement',exact:true}).click();
  const next=page.getByRole('region',{name:'Personal next steps',exact:true});
  const id=flow==='exception'?'exception:exception-1':flow;
  const button=next.getByRole('button',{name:`Continue · ${id}`,exact:true});
  await button.focus();await page.keyboard.press('Enter');
  const label=flow==='workshop'?'Local workshop lifecycle':flow==='case'?'Local coordination case lifecycle':'Local exception lifecycle';
  const region=page.getByRole('region',{name:label,exact:true});
  await expect(region.getByRole('heading').first()).toBeFocused();
  await expect(region.getByRole('combobox',{name:flow==='workshop'?'Workshop actor':flow==='case'?'Case acting person':'Exception actor',exact:true})).toHaveValue(actor);
  if(flow==='exception')await expect(region.getByRole('combobox',{name:'Exception ticket',exact:true})).toHaveValue('exception-1');
  expect(await page.evaluate(key=>localStorage.getItem(key),knowledgeCheckpointKey)).toBe(raw);
  await page.getByRole('button',{name:'Back to scenario context',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/work\\?persona=${actor}$`));
  await expect(next.getByRole('button',{name:`Continue · ${id}`,exact:true})).toBeVisible();
});
