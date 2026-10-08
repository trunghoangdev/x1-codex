import { test, expect } from "@playwright/test";
import {
  caseProgress,
  recordCaseEvent,
  type CaseContext,
  type CaseEvent,
} from "../src/data/caseLifecycle";
import { emptyContribution } from "../src/data/humanContribution";
import { deliverBrief, receiveBrief } from "../src/data/briefHandoff";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  replaceKnowledge,
} from "../src/data/knowledgeCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
const at = "2026-10-01T12:00:00Z";
function context(received = false): CaseContext {
  const brief = deliverBrief(
    { versions: [] },
    "Audience: onboarding members. Schedule: Tuesday. All outline input constraints represented.",
    at,
  );
  return {
    brief: received ? receiveBrief(brief, 1, at) : brief,
    contribution: emptyContribution(),
  };
}
function record(
  events: CaseEvent[],
  c: CaseContext,
  actor: "leo" | "maya",
  action: CaseEvent["action"],
  rationale = "Checked exact brief and audience/schedule requirements",
) {
  return recordCaseEvent(events, c, actor, action, rationale, at);
}
function accepted(c = context(true)) {
  return record([], c, "leo", "Accept responsibility");
}
function proposal(c = context(true)) {
  return record(accepted(c), c, "leo", "Propose resolution");
}

test("case responsibility, proposal and independent review remain separate and version bound", () => {
  const c = context();
  expect(record([], c, "maya", "Accept responsibility")).toEqual([]);
  expect(record([], c, "leo", "Propose resolution")).toEqual([]);
  let events = accepted(c);
  expect(record(events, c, "leo", "Propose resolution")).toBe(events);
  expect(record(events, c, "maya", "Update follow-up")).toBe(events);
  events = record(
    events,
    c,
    "leo",
    "Update follow-up",
    "Waiting for exact Maya receipt",
  );
  const received = { ...c, brief: receiveBrief(c.brief, 1, at) };
  expect(caseProgress(events, received).resolved).toBe(false);
  events = record(events, received, "leo", "Propose resolution");
  expect(caseProgress(events, received).actor).toBe("maya");
  expect(record(events, received, "leo", "Approve resolution")).toBe(events);
  expect(record(events, received, "maya", "Approve resolution", " ")).toBe(
    events,
  );
  const further = record(
    events,
    received,
    "maya",
    "Request further work",
    "Audience constraints incomplete",
  );
  expect(caseProgress(further, received).resolved).toBe(false);
  const proposedAgain = record(further, received, "leo", "Propose resolution");
  const closed = record(proposedAgain, received, "maya", "Approve resolution");
  expect(caseProgress(closed, received).resolved).toBe(true);
  expect(record(closed, received, "maya", "Approve resolution")).toBe(closed);
  expect(closed.at(-1)?.proposalId).toBe(proposedAgain.at(-1)?.id);
  const changed = {
    ...received,
    brief: deliverBrief(
      received.brief,
      "Audience changed; new schedule Wednesday",
      at,
    ),
  };
  expect(caseProgress(closed, changed).status).toContain("Source changed");
  expect(record(proposedAgain, changed, "maya", "Approve resolution")).toBe(
    proposedAgain,
  );
  const reopened = record(closed, changed, "leo", "Reopen case");
  expect(reopened.slice(0, closed.length)).toEqual(closed);
  expect(record(reopened, changed, "leo", "Propose resolution")).toBe(reopened);
  const fresh = { ...changed, brief: receiveBrief(changed.brief, 2, at) };
  const second = record(reopened, fresh, "leo", "Propose resolution");
  expect(JSON.parse(second.at(-1)!.evidence!).brief.version).toBe(2);
  expect(
    JSON.parse(closed.find((e) => e.action === "Propose resolution")!.evidence!)
      .brief.version,
  ).toBe(1);
  expect(
    recordCaseEvent(
      second,
      fresh,
      "maya",
      "Approve resolution",
      "Too early",
      "2026-09-30T12:00:00Z",
    ),
  ).toBe(second);
});

test("case checkpoint validates replay, actors, frozen evidence, retained brief lineage and bounded history", () => {
  const c = context(true);
  const events = record(proposal(c), c, "maya", "Approve resolution");
  const workspace = { ...c, caseEvents: events, adoptions: [] };
  const raw = encodeKnowledgeCheckpoint(workspace);
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v11");
  expect(parseKnowledgeCheckpoint(raw).state).toEqual(workspace);
  expect(
    knowledgeTimeline(workspace)
      .filter((e) => e.kind === "Coordination case")
      .map((e) => e.actor),
  ).toEqual([
    "Leo · follow-up owner",
    "Leo · follow-up owner",
    "Maya · local case-resolution reviewer",
  ]);
  for (const mutate of [
    (x: any) => (x.state.caseEvents[2].actor = "leo"),
    (x: any) => (x.state.caseEvents[2].proposalId = "other-proposal"),
    (x: any) => (x.state.caseEvents[1].evidence = "{}"),
    (x: any) =>
      (x.state.caseEvents[1].context.brief.versions[0].body =
        "Unrelated brief"),
    (x: any) => (x.state.caseEvents[2].context.caseEvents = []),
    (x: any) => (x.state.brief.versions[0].receipt.id = "foreign-receipt"),
    (x: any) => (x.format = "forge.knowledge-workspace.v10"),
  ]) {
    const x = JSON.parse(raw);
    mutate(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
  const next = replaceKnowledge(workspace, {
    kind: "contribution",
    contribution: emptyContribution(),
    savedAt: at,
  });
  expect(next.caseEvents).toEqual(events);
  const old = encodeKnowledgeCheckpoint({ ...c, adoptions: [] });
  expect(parseKnowledgeCheckpoint(old).state.caseEvents).toBeUndefined();
  let bounded = accepted(c);
  while (bounded.length < 40)
    bounded = record(bounded, c, "leo", "Update follow-up");
  expect(record(bounded, c, "leo", "Propose resolution")).toBe(bounded);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...c, adoptions: [], caseEvents: bounded }),
    ).state.caseEvents,
  ).toHaveLength(40);
});

for (const width of [320, 1440]) {
  test(`case acceptance, review, reopening and whole-workspace recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const c = context(true);
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      {
        key: knowledgeCheckpointKey,
        raw: encodeKnowledgeCheckpoint({ ...c, adoptions: [] }),
      },
    );
    await page.goto(
      "/#/organizations/knowledge/cases/current-workshop-brief?persona=leo",
    );
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
    const panel = page.getByRole("region", {
      name: "Local coordination case lifecycle",
      exact: true,
    });
    async function change(action: string, actor = "leo") {
      await panel
        .getByLabel("Case acting person", { exact: true })
        .selectOption(actor);
      await panel
        .getByLabel("Case action", { exact: true })
        .selectOption(action);
      await panel
        .getByLabel("Case rationale and remaining conditions", { exact: true })
        .fill(
          `${action}: reviewed current audience/schedule, exact receipt and limits`,
        );
      await panel
        .getByRole("button", { name: "Review case change", exact: true })
        .click();
      await panel
        .getByRole("button", {
          name: "Record case change locally",
          exact: true,
        })
        .click();
    }
    await panel
      .getByLabel("Case rationale and remaining conditions", { exact: true })
      .fill("Review before accepting");
    await panel
      .getByRole("button", { name: "Review case change", exact: true })
      .click();
    await panel
      .getByRole("button", { name: "Cancel case change", exact: true })
      .click();
    await expect(panel.getByRole("heading").first()).toHaveText(
      "Follow-up acceptance pending",
    );
    await change("Accept responsibility");
    await change("Update follow-up");
    await change("Propose resolution");
    await expect(panel.getByRole("status")).toContainText("Maya");
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/work?persona=maya"),
    );
    const responsibility = page.getByRole("region", {
      name: "Workshop brief case progress",
      exact: true,
    });
    await expect(responsibility).toContainText(
      "Resolution proposed · review pending",
    );
    await expect(responsibility).toContainText("Maya");
    await responsibility
      .getByRole("button", { name: "Inspect workshop brief case", exact: true })
      .click();
    await panel
      .getByText("Inspect current resolution evidence", { exact: true })
      .click();
    await expect(
      panel.getByText(c.brief.versions[0].body, { exact: true }),
    ).toBeVisible();

    await panel
      .getByLabel("Case acting person", { exact: true })
      .selectOption("maya");
    await change("Request further work", "maya");
    await change("Propose resolution");
    await change("Approve resolution", "maya");
    await expect(panel.getByRole("heading").first()).toHaveText(
      "Resolved in local simulation",
    );
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/workstreams/K-02?persona=leo"),
    );
    await expect(
      page.getByRole("region", {
        name: "Workshop brief case progress",
        exact: true,
      }),
    ).toContainText("Resolved in local simulation");
    const brief = page.getByRole("region", {
      name: "Workshop brief handoff",
      exact: true,
    });
    await brief
      .getByRole("textbox")
      .fill("Audience revised; schedule Wednesday; receipt required again");
    await brief
      .getByRole("button", { name: "Deliver brief-v2 locally", exact: true })
      .click();
    await expect(
      page.getByRole("region", {
        name: "Workshop brief case progress",
        exact: true,
      }),
    ).toContainText("Source changed");
    await page
      .getByRole("button", { name: "Inspect workshop brief case", exact: true })
      .click();
    await expect(panel.getByRole("alert")).toContainText("Reopen the case");
    await change("Reopen case");
    await expect(
      panel.getByRole("option", { name: "Propose resolution", exact: true }),
    ).toHaveCount(0);
    const recovery = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    if (
      !(await recovery.locator("..").evaluate((el) => el.hasAttribute("open")))
    )
      await recovery.click();
    await page
      .getByRole("button", { name: "Save workspace checkpoint", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm save workspace", exact: true })
      .click();
    await page.reload();
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
    await expect(panel.getByRole("heading").first()).toHaveText(
      "Reopened · follow-up required",
    );
    await panel
      .getByText("Retained case history · 7 records", { exact: true })
      .click();
    await expect(
      panel.getByRole("heading", {
        name: "Approve resolution · Maya · local case-resolution reviewer",
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(
      () =>
        (location.hash =
          "/organizations/knowledge/timeline?timelineKind=Coordination+case"),
    );
    await expect(
      page.getByText("Reopen case", { exact: true }).first(),
    ).toBeVisible();
  });
}

import {
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
} from "../src/data/authorizedUse";
import {
  offerGuideInput,
  respondGuideInput,
  assessGuideInput,
} from "../src/data/workstreamInputs";
import { reviewGoal } from "../src/data/goalLoop";
function deliverGuide(c: HumanContributionState) {
  const prepared = {
    ...c,
    contributions: c.contributions.map((v, i) =>
      i === c.contributions.length - 1
        ? {
            ...v,
            body: "Contact onboarding with your team and scope",
            note: "Exact scope response",
            citesInput: true,
          }
        : v,
    ),
  };
  return receiveContribution(
    submitContributionCommand(prepared, "projected", at),
    at,
  );
}
test("linked guide changes invalidate case resolution without erasing prior closure or goal decisions", () => {
  const contribution = reassessContribution(
    deliverGuide(
      reviseContribution(
        assessContribution(deliverGuide(emptyContribution()), at),
      ),
    ),
    "Suitable for stated scope",
    "Scope checked",
    at,
  );
  const subject = assessedUseSubject(contribution)!;
  let guideHandoffs = offerGuideInput(
    [],
    subject,
    "Exact assessed guide offered",
    "Workshop cohort preparation",
    at,
    0,
  );
  guideHandoffs = respondGuideInput(
    guideHandoffs,
    guideHandoffs[0].id,
    "Received",
    "Exact source received",
    at,
  );
  guideHandoffs = assessGuideInput(
    guideHandoffs,
    guideHandoffs[0].id,
    subject,
    "Applicable",
    "Preparation scope confirmed",
    at,
  );
  let brief = deliverBrief(
    { versions: [], guideHandoffs },
    "Audience: cohort. Schedule Tuesday; agreed outline constraints met",
    at,
    subject,
  );
  brief = receiveBrief(brief, 1, at);
  const c = { contribution, brief };
  const closed = record(proposal(c), c, "maya", "Approve resolution");
  expect(caseProgress(closed, c).resolved).toBe(true);
  let use = allocateUseMandate(
    subject,
    "Bounded cohort",
    "Separate publication mandate",
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
      "Separate simulated use observation",
      at,
    );
  use = reviewGoal(
    use,
    subject,
    "Goal met in simulation",
    "Exact bounded criterion met",
    "No real-world outcome evidence",
    at,
  );
  expect(use.goalReviews).toHaveLength(1);
  const workspace = { ...c, caseEvents: closed, adoptions: [], use };
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint(workspace)).state,
  ).toEqual(workspace);
  const changed = {
    ...c,
    contribution: requestContributionRevision(
      contribution,
      "Guide needs another editorial revision",
      at,
    ),
  };
  expect(caseProgress(closed, changed).stale).toBe(true);
  expect(record(proposal(c), changed, "maya", "Approve resolution")).toEqual(
    proposal(c),
  );
  const restored = parseKnowledgeCheckpoint(
    encodeKnowledgeCheckpoint({
      ...workspace,
      contribution: changed.contribution,
    }),
  ).state;
  expect(
    caseProgress(restored.caseEvents!, {
      brief: restored.brief,
      contribution: restored.contribution,
    }).stale,
  ).toBe(true);
  expect(restored.caseEvents?.at(-1)?.action).toBe("Approve resolution");
  const unmapped = {
    ...c,
    brief: {
      ...brief,
      guideHandoffs: assessGuideInput(
        guideHandoffs,
        guideHandoffs[0].id,
        subject,
        "Needs adaptation",
        "Workshop scope needs adjustment",
        at,
      ),
    },
  };
  expect(caseProgress(closed, unmapped).stale).toBe(true);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...workspace, brief: unmapped.brief }),
    ).state.caseEvents,
  ).toEqual(closed);
});
