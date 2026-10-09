import { test, expect } from "@playwright/test";
import { workstreamRelations } from "../src/data/workstreamRelations";
import { organizationJourney } from "../src/data/organizationJourney";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";

test("optional exchange never invents a guide dependency for an independent brief", () => {
  const state = organizationJourney()[0].state;
  state.brief = receiveBrief(deliverBrief(state.brief, "Independent workshop input", "2026-10-01T12:00:00Z"), 1, "2026-10-01T12:01:00Z");
  const row = workstreamRelations(state);
  expect(row.recorded).toBe(false);
  expect(row.next).toBeUndefined();
  expect(row.brief).toContain("no recorded guide link");
});

test("exact exchange separates receipt, applicability and changed-source effects", () => {
  const stages = organizationJourney();
  const prepared = structuredClone(stages.find(s=>s.id === "prepared")!.state);
  const raw = JSON.stringify(prepared);
  expect(workstreamRelations(prepared).status).toBe("Guide received and applicable");
  expect(workstreamRelations(prepared).brief).toContain("Linked input is current");
  expect(JSON.stringify(prepared)).toBe(raw);
  const pending = structuredClone(prepared);
  delete pending.brief.guideHandoffs![0].response;
  delete pending.brief.guideHandoffs![0].applicability;
  expect(workstreamRelations(pending).next).toBe("Leo");
  prepared.contribution = emptyContribution();
  const changed = workstreamRelations(prepared);
  expect(changed.next).toBe("Maya");
  expect(changed.brief).toContain("historical");
  expect(changed.impacts.find(r=>r.id === "workshop-cycle")?.status).toBe("Blocked");
  const executed = structuredClone(stages.find(s=>s.id === "reviewed")!.state);
  executed.contribution = emptyContribution();
  expect(workstreamRelations(executed).impacts.find(r=>r.id === "workshop-cycle")?.status).toBe("Historical");
});

for (const width of [390,1440]) test(`relationship is inspectable inside a preserved guided chapter ${width}`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  await page.goto('/#/organizations/knowledge/journey?persona=leo&journeyStep=prepared');
  const region = page.getByRole('region',{name:'Cross-workstream input relationship'});
  await expect(region).toContainText('Guide received and applicable');
  await region.getByText('Inspect transferred source and responses',{exact:true}).click();
  await expect(region).toContainText('guide-workshop-handoff-1');
  await region.getByText('Downstream dependencies and source changes',{exact:true}).click();
  await expect(region).toContainText('Workshop delivery · cycle 1');
  await region.getByRole('button',{name:'Inspect dependent source · workshop-cycle',exact:true}).click();
  await expect(page.getByRole('region',{name:'Journey source preview'})).toBeVisible();
  await expect(page).toHaveURL(/journeyStep=prepared/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
