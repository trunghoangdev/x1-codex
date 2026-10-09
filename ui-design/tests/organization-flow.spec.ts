import { test, expect } from "@playwright/test";
import { workstreamFlow } from "../src/data/workstreamFlow";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import { recordWorkshopEvent } from "../src/data/workshop";
import { recordException } from "../src/data/exceptionLoop";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-01T12:00:00Z";
const initial = (): KnowledgeWorkspace => ({
  contribution: emptyContribution(),
  brief: { versions: [] },
  adoptions: [],
});
function preparing() {
  let s = initial();
  s.brief = receiveBrief(
    deliverBrief(s.brief, "Cohort practice workshop on Tuesday", at),
    1,
    at,
  );
  const cc = { brief: s.brief, contribution: s.contribution };
  let cases = recordCaseEvent(
    [],
    cc,
    "leo",
    "Accept responsibility",
    "Accepted",
    at,
  );
  cases = recordCaseEvent(
    cases,
    cc,
    "leo",
    "Propose resolution",
    "Exact input received",
    at,
  );
  cases = recordCaseEvent(
    cases,
    cc,
    "maya",
    "Approve resolution",
    "Receipt checked",
    at,
  );
  s.caseEvents = cases;
  const wc = { ...cc, caseEvents: cases };
  let events = recordWorkshopEvent(
    [],
    wc,
    "owner",
    "Offer facilitation",
    "Bounded offer",
    at,
    { facilitator: "leo", reviewer: "maya" },
  );
  events = recordWorkshopEvent(
    events,
    wc,
    "leo",
    "Accept facilitation",
    "Accepted",
    at,
  );
  events = recordWorkshopEvent(
    events,
    wc,
    "leo",
    "Submit preparation",
    "Practical exercise and criterion",
    at,
  );
  return { ...s, workshopEvents: events };
}
function lane(s: KnowledgeWorkspace, id: string) {
  return workstreamFlow(s)
    .flatMap((r) => r.lanes)
    .find((l) => l.id === id)!;
}
test("parallel lanes distinguish missing input, case resolution and workshop review", () => {
  const before = initial();
  expect(lane(before, "brief").actor).toBe("Leo");
  expect(lane(before, "workshop").actor).toBeUndefined();
  expect(lane(before, "use").actor).toBeUndefined();
  expect(lane(before, "contribution").actor).toBe("Leo");
  expect(lane(before, "guide-input")).toBeUndefined();
  const s = preparing();
  expect(lane(s, "brief").actor).toBeUndefined();
  expect(lane(s, "case").actor).toBeUndefined();
  expect(lane(s, "workshop").actor).toBe("Maya");
  expect(lane(s, "contribution").actor).toBe("Leo");
  const raw = JSON.stringify(s);
  expect(
    workstreamFlow(
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(s)).state,
    ),
  ).toEqual(workstreamFlow(s));
  expect(JSON.stringify(s)).toBe(raw);
});
test("changed latest brief blocks pre-execution cycle and identifies separate recipient", () => {
  let s = preparing();
  s = { ...s, brief: deliverBrief(s.brief, "Changed cohort and schedule", at) };
  expect(lane(s, "brief").actor).toBe("Maya");
  expect(lane(s, "workshop").actor).toBe("Demo organization owner");
  expect(lane(s, "workshop").waiting).toContain("Changed source");
  expect(lane(s, "case").actor).toBe("Leo");
});
test("exception follow-up remains separate from input and execution lanes", () => {
  const s = initial(),
    context = {
      brief: s.brief,
      contribution: s.contribution,
      caseEvents: [],
      workshopEvents: [],
    };
  let events = recordException(
    [],
    context,
    "owner",
    "Open exception",
    "",
    "Brief is missing",
    at,
    "workshop-brief-input",
  );
  events = recordException(
    events,
    context,
    "owner",
    "Offer handling",
    "exception-1",
    "Investigate",
    at,
    "",
    "maya",
  );
  expect(
    lane({ ...s, exceptionEvents: events }, "exception:exception-1").actor,
  ).toBe("Maya");
  expect(lane({ ...s, exceptionEvents: events }, "brief").actor).toBe("Leo");
  events = recordException(
    events,
    context,
    "owner",
    "Cancel exception",
    "exception-1",
    "Withdraw this follow-up",
    at,
  );
  expect(
    lane({ ...s, exceptionEvents: events }, "exception:exception-1"),
  ).toBeUndefined();
  expect(lane({ ...s, exceptionEvents: events }, "brief").status).toContain(
    "Input missing",
  );
});
for (const width of [390, 1440])
  test(`shared flow shows restored next reviewer and source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw: encodeKnowledgeCheckpoint(preparing()),
    });
    await page.goto("/#/organizations/knowledge?persona=leo");
    await page
      .getByText("Save or restore whole Knowledge workspace", { exact: true })
      .click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const flow = page.getByRole("region", {
      name: "Workstream coordination",
      exact: true,
    });
    await expect(
      flow.getByRole("article", { name: "Flow · K-02", exact: true }),
    ).toContainText("Submit preparation");
    await flow
      .getByRole("button", {
        name: "Inspect flow step · K-02 · workshop",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/workshop\/K-02\?persona=leo/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(flow).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
