import { test, expect } from "@playwright/test";
import { organizationGoals } from "../src/data/organizationGoals";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
import { mainOrganization } from "../src/data/organizationScenario";
import {
  emptyContribution,
  receiveContribution,
  assessContribution,
  reviseContribution,
  reassessContribution,
  requestContributionRevision,
  type HumanContributionState,
} from "../src/data/humanContribution";
import { submitContributionCommand } from "../src/data/contributionCommand";
import {
  assessedUseSubject,
  allocateUseMandate,
  recordUseStep,
  continueUse,
} from "../src/data/authorizedUse";
import {
  reviewGoal,
  respondGoalTask,
  deliverGoalTask,
  assessGoalTask,
} from "../src/data/goalLoop";
import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
} from "../src/data/workstreamInputs";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import { recordCaseEvent } from "../src/data/caseLifecycle";
import { recordWorkshopEvent, type WorkshopEvent } from "../src/data/workshop";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
const at = "2026-10-01T12:00:00Z";
function fixture(): KnowledgeWorkspace {
  const deliver = (c: HumanContributionState) =>
    receiveContribution(
      submitContributionCommand(
        {
          ...c,
          contributions: c.contributions.map((x, i) =>
            i === c.contributions.length - 1
              ? {
                  ...x,
                  body: "Guide: contact onboarding to identify next steps.",
                  note: "Bounded audience",
                  citesInput: true,
                }
              : x,
          ),
        },
        "projected",
        at,
      ),
      at,
    );
  let contribution = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  contribution = reassessContribution(
    deliver(contribution),
    "Suitable for stated scope",
    "Reviewed guide",
    at,
  );
  const subject = assessedUseSubject(contribution)!;
  let use = allocateUseMandate(
    subject,
    "New member cohort",
    "Bounded simulation",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Succeeded",
    "Simulated reader evidence",
    "Criterion met in simulation",
  ] as const)
    use = recordUseStep(
      use,
      subject,
      action,
      "Simulated members identify the correct contact and next steps",
      at,
    );
  let handoffs = offerGuideInput(
    [],
    subject,
    "Exact guide",
    "K-02 practical exercise",
    at,
  );
  handoffs = respondGuideInput(
    handoffs,
    handoffs[0].id,
    "Received",
    "Exact receipt",
    at,
  );
  handoffs = assessGuideInput(
    handoffs,
    handoffs[0].id,
    subject,
    "Applicable",
    "Same cohort",
    at,
  );
  const brief = receiveBrief(
    deliverBrief(
      { versions: [], guideHandoffs: handoffs },
      "New-member workshop: practical guide exercise on Tuesday.",
      at,
      subject,
    ),
    1,
    at,
  );
  const ctx = { brief, contribution };
  let caseEvents = recordCaseEvent(
    [],
    ctx,
    "leo",
    "Accept responsibility",
    "Follow up",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    ctx,
    "leo",
    "Propose resolution",
    "Audience resolved",
    at,
  );
  caseEvents = recordCaseEvent(
    caseEvents,
    ctx,
    "maya",
    "Approve resolution",
    "Exact source checked",
    at,
  );
  const wctx = { ...ctx, caseEvents };
  let workshopEvents: WorkshopEvent[] = [];
  for (const [actor, action] of [
    ["owner", "Offer facilitation"],
    ["leo", "Accept facilitation"],
    ["leo", "Submit preparation"],
    ["maya", "Preparation ready"],
    ["leo", "Session succeeded"],
    ["leo", "Record observations"],
    ["maya", "Criterion met in simulation"],
  ] as const)
    workshopEvents = recordWorkshopEvent(
      workshopEvents,
      wctx,
      actor,
      action,
      "Simulated participants apply the guide in the exercise. No real members observed.",
      at,
    );
  return { ...wctx, use, workshopEvents, adoptions: [] };
}
test("organization goal links are explicit; criterion review alone does not close K-01 goal", () => {
  const state = fixture(),
    view = organizationGoals(knowledgeOrganization, state)!;
  expect(view.rows.map((r) => r.streamId)).toEqual(["K-01", "K-02"]);
  expect(view.rows[0].status).toBe("Scoped goal decision pending");
  expect(view.rows[0].responsible).toBe("Demo organization owner");
  expect(view.rows[0].positive).toBe(false);
  expect(view.rows[1].positive).toBe(true);
  expect(view.positive).toBe(1);
  expect(view.goal.owner).toContain("not allocated");
  expect(view.rows[0].evidence.map((e) => e.kind)).toEqual([
    "Execution observation",
    "Reader evidence",
    "Criterion review",
  ]);
  state.use = reviewGoal(
    state.use!,
    state.use!.subject,
    "Goal met in simulation",
    "Scoped criterion met",
    "Simulated cohort only; no real reader data",
    at,
  );
  const positive = organizationGoals(knowledgeOrganization, state)!;
  expect(positive.positive).toBe(2);
  expect(positive.boundary).toContain("not verified");
  expect(organizationGoals(mainOrganization, state)).toBeUndefined();
  expect(
    organizationGoals(knowledgeOrganization, {
      contribution: emptyContribution(),
      brief: { versions: [] },
      adoptions: [],
    })!.rows.every((r) => !r.positive && r.evidence.length === 0),
  ).toBe(true);
});
test("source change and a fresh cycle cannot inherit older positive goal decisions", () => {
  const state = fixture();
  state.use = reviewGoal(
    state.use!,
    state.use!.subject,
    "Goal met in simulation",
    "Goal met for cohort",
    "Local simulation only",
    at,
  );
  const changed = {
    ...state,
    contribution: requestContributionRevision(
      state.contribution,
      "Guide contact changed",
      at,
    ),
  };
  const view = organizationGoals(knowledgeOrganization, changed)!;
  expect(view.positive).toBe(0);
  expect(view.historical).toBe(2);
  expect(view.rows.every((r) => r.evidence.length > 0)).toBe(true);
  const before = JSON.stringify(changed);
  organizationGoals(knowledgeOrganization, changed);
  expect(JSON.stringify(changed)).toBe(before);
  expect(
    organizationGoals(
      knowledgeOrganization,
      parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(changed)).state,
    ),
  ).toEqual(view);
  const ctx = {
    brief: state.brief,
    contribution: state.contribution,
    caseEvents: state.caseEvents!,
  };
  const next = {
    ...state,
    workshopEvents: recordWorkshopEvent(
      state.workshopEvents!,
      ctx,
      "owner",
      "Offer facilitation",
      "Fresh cycle",
      at,
    ),
  };
  expect(organizationGoals(knowledgeOrganization, next)!.rows[1].positive).toBe(
    false,
  );
  expect(
    organizationGoals(knowledgeOrganization, next)!.rows[1].evidence,
  ).toEqual([]);
});
test("completed goal follow-up and failed use remain gaps until a separate goal decision", () => {
  const state = fixture();
  let u = reviewGoal(
    state.use!,
    state.use!.subject,
    "Further work required",
    "Need clearer evidence",
    "Simulation only",
    at,
    {
      title: "Collect next-step examples",
      assignee: "leo",
      expectedResult: "Scoped examples",
    },
  );
  u = respondGoalTask(
    u,
    u.subject,
    "leo",
    "Accepted",
    "I accept exact scope",
    at,
    true,
  );
  u = deliverGoalTask(
    u,
    u.subject,
    "leo",
    "Collected simulated next-step examples",
    at,
  );
  u = assessGoalTask(u, u.subject, "Accepted result", "Examples received", at);
  const row = organizationGoals(knowledgeOrganization, { ...state, use: u })!
    .rows[0];
  expect(row.positive).toBe(false);
  expect(row.status).toBe("Further work required");
  expect(row.responsible).toBe("Demo organization owner");
  let failed = allocateUseMandate(
    u.subject,
    "New members",
    "Failure simulation",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    failed = recordUseStep(
      failed,
      failed.subject,
      action,
      "Failure remains separate",
      at,
    );
  const next = continueUse(
    failed,
    failed.subject,
    "New members",
    "Fresh cycle",
    at,
  );
  expect(
    organizationGoals(knowledgeOrganization, { ...state, use: next })!.rows[0]
      .evidence,
  ).toEqual([]);
  expect(
    organizationGoals(knowledgeOrganization, { ...state, use: next })!.rows[0]
      .positive,
  ).toBe(false);
});
for (const width of [390, 1280])
  test(`organization goal evidence, recovery and source return ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const state = fixture(),
      raw = encodeKnowledgeCheckpoint(state);
    await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
      key: knowledgeCheckpointKey,
      raw,
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
    const summary = page.getByRole("region", {
      name: "Organization goal summary",
    });
    await expect(summary).toContainText("1 of 2 linked workstreams");
    await summary
      .getByRole("button", {
        name: "Review organization goals and evidence",
        exact: true,
      })
      .click();
    const report = page.getByRole("region", {
      name: "Organization goal evidence",
    });
    await expect(report.getByRole("article")).toHaveCount(2);
    const guide = report.getByRole("article", {
      name: "Goal contribution K-01",
      exact: true,
    });
    await expect(guide).toContainText("Scoped goal decision pending");
    await expect(guide).toContainText("Demo organization owner");
    const workshop = report.getByRole("article", {
      name: "Goal contribution K-02",
      exact: true,
    });
    await expect(workshop).toContainText("Scoped criterion met in simulation");
    await expect(workshop).toContainText("No real participant outcomes");
    await workshop
      .getByRole("button", {
        name: "Inspect evidence work · K-02",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/workshop\/K-02\?persona=leo$/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(report).toBeVisible();
    await guide
      .getByRole("button", {
        name: "Inspect outcome criteria · K-01",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/outcomes\/K-01\?persona=leo$/);
    await page
      .getByRole("button", { name: "Back to scenario context", exact: true })
      .click();
    await expect(report).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        (key) => localStorage.getItem(key),
        knowledgeCheckpointKey,
      ),
    ).toBe(raw);
  });
