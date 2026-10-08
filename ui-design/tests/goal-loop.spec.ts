import { test, expect } from "@playwright/test";
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
  startMaterialUse,
  continueUse,
  type AuthorizedUse,
  useVersion,
} from "../src/data/authorizedUse";
import {
  encodeKnowledgeCheckpoint,
  parseKnowledgeCheckpoint,
  knowledgeCheckpointKey,
  type KnowledgeWorkspace,
} from "../src/data/knowledgeCheckpoint";
import {
  encodeContributionCheckpoint,
  parseContributionCheckpoint,
} from "../src/data/contributionCheckpoint";
import { knowledgeTimeline } from "../src/data/knowledgeTimeline";
import { adoptAgreement } from "../src/data/agreementAdoption";
import { recordApplicability } from "../src/data/scopeApplicability";
import { useProgress } from "../src/data/useProgress";
const at = "2026-10-01T12:00:00Z";
function prepare(c: HumanContributionState) {
  return {
    ...c,
    contributions: c.contributions.map((x, i) =>
      i === c.contributions.length - 1
        ? {
            ...x,
            body: `Guide revision ${x.version}: contact onboarding with team and context.`,
            note: `Scope response ${x.version}`,
            citesInput: true,
          }
        : x,
    ),
  };
}
function deliver(c: HumanContributionState) {
  return receiveContribution(
    submitContributionCommand(prepare(c), "projected", at),
    at,
  );
}
function fixture(): KnowledgeWorkspace {
  let c = reviseContribution(
    assessContribution(deliver(emptyContribution()), at),
  );
  c = reassessContribution(
    deliver(c),
    "Suitable for stated scope",
    "Suitable for bounded cohort",
    at,
  );
  let use = allocateUseMandate(
    assessedUseSubject(c),
    "Cohort two",
    "Bounded mandate two",
    at,
  )!;
  for (const action of [
    "Suitable",
    "Allowed",
    "Failed",
    "Insufficient evidence",
  ] as const)
    use = recordUseStep(use, use.subject, action, "Cycle one simulation", at);
  use = continueUse(use, use.subject, "Cohort two", "Second attempt", at);
  use = recordUseStep(use, use.subject, "Suitable", "Second scope review", at);
  use = recordUseStep(use, use.subject, "Allowed", "Second authority", at);
  return { contribution: c, brief: { versions: [] }, adoptions: [], use };
}
function nextVersion(c: HumanContributionState) {
  return reassessContribution(
    deliver(
      reviseContribution(
        requestContributionRevision(c, "New content needed after feedback", at),
      ),
    ),
    "Suitable for stated scope",
    "New exact version reviewed",
    at,
  );
}

import {
  reviewGoal,
  respondGoalTask,
  deliverGoalTask,
  assessGoalTask,
  cancelGoalTask,
  goalProgress,
  goalLoopScenario,
} from "../src/data/goalLoop";
import { knowledgeOrganization } from "../src/data/knowledgeOrganization";
function completed(positive = false) {
  const w = fixture();
  let s = allocateUseMandate(
    assessedUseSubject(w.contribution),
    "Cohort two",
    "Bounded use for goal review",
    at,
  )!;
  for (const a of [
    "Suitable",
    "Allowed",
    "Succeeded",
    positive ? "Simulated reader evidence" : "No reader evidence",
    positive ? "Criterion met in simulation" : "Insufficient evidence",
  ] as const)
    s = recordUseStep(
      s,
      s.subject,
      a,
      "Local simulation with explicit limitations",
      at,
    );
  return { ...w, use: s };
}
const work = {
  title: "Collect scoped reader observations",
  assignee: "leo" as const,
  expectedResult:
    "Describe reader tasks, coverage and remaining uncertainty for this exact guide and cohort.",
};
function offered(s: AuthorizedUse) {
  return reviewGoal(
    s,
    s.subject,
    "Evidence gap",
    "Reader usefulness not established",
    "Fictional cohort only; no real reader outcomes",
    at,
    work,
  );
}
test("outcome needs separate goal decision; accepted follow-up result never manufactures goal attainment", () => {
  const w = completed(),
    original = w.use;
  expect(goalProgress(original)?.actor).toBe("owner");
  expect(
    reviewGoal(
      original,
      original.subject,
      "Goal met in simulation",
      "No evidence",
      "Scope limits",
      at,
    ),
  ).toBe(original);
  expect(
    reviewGoal(
      original,
      original.subject,
      "Evidence gap",
      "Missing followup",
      "Scope limits",
      at,
    ),
  ).toBe(original);
  let s = offered(original);
  expect(useProgress(w.contribution, s).actor).toBe("leo");
  expect(deliverGoalTask(s, s.subject, "leo", "Skip acceptance", at)).toBe(s);
  expect(
    respondGoalTask(s, s.subject, "maya", "Accepted", "Wrong actor", at, true),
  ).toBe(s);
  expect(
    respondGoalTask(s, s.subject, "leo", "Accepted", "No acknowledgment", at),
  ).toBe(s);
  expect(
    continueUse(s, s.subject, "Cohort two", "Cannot abandon pending task", at),
  ).toBe(s);
  s = respondGoalTask(
    s,
    s.subject,
    "leo",
    "Accepted",
    "Exact task and limits inspected",
    at,
    true,
  );
  s = deliverGoalTask(
    s,
    s.subject,
    "leo",
    "Simulated observations with coverage gaps; real use not verified",
    at,
  );
  expect(useProgress(w.contribution, s).actor).toBe("owner");
  expect(
    reviewGoal(
      s,
      s.subject,
      "Further work required",
      "Cannot skip result review",
      "Scope limits",
      at,
      work,
    ),
  ).toBe(s);
  s = assessGoalTask(
    s,
    s.subject,
    "Accepted result",
    "Task output matches request, but outcome remains uncertain",
    at,
  );
  expect(s.outcome).toBe(original.outcome);
  expect(s.goalReviews?.at(-1)?.decision).toBe("Evidence gap");
  expect(
    reviewGoal(
      s,
      s.subject,
      "Goal met in simulation",
      "Cannot rewrite outcome",
      "Scope limits",
      at,
    ),
  ).toBe(s);
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: s })).state
      .use,
  ).toEqual(s);
  const events = knowledgeTimeline({ ...w, use: s }).filter(
    (e) => e.kind === "Goal follow-up",
  );
  expect(events).toHaveLength(5);
  expect(
    events.find((e) => e.title === "Goal follow-up result · Accepted result")
      ?.references,
  ).toContain(s.goalReviews![0].followUp!.delivery!.id);
  const scenario = goalLoopScenario(knowledgeOrganization, s, s.subject);
  expect(scenario.streams[0].outcome).toContain("Reassess goal");
  expect(scenario.outcomes[0].criteria[0].gap).toContain("unverified");
  const cycle2 = continueUse(
    s,
    s.subject,
    "Cohort two",
    "Separate fresh outcome cycle",
    at,
  );
  expect(cycle2.goalReviews).toBeUndefined();
  expect(cycle2.previousCycle?.goalReviews).toHaveLength(1);
  expect(
    parseKnowledgeCheckpoint(encodeKnowledgeCheckpoint({ ...w, use: cycle2 }))
      .state.use,
  ).toEqual(cycle2);
  const raw = encodeKnowledgeCheckpoint({ ...w, use: s });
  expect(JSON.parse(raw).format).toBe("forge.knowledge-workspace.v10");
  for (const change of [
    (x: any) => (x.state.use.goalReviews[0].outcomeId = "wrong"),
    (x: any) => (x.state.use.goalReviews[0].source = "{}"),
    (x: any) => (x.state.use.goalReviews[0].followUp.response.actor = "maya"),
    (x: any) =>
      delete x.state.use.goalReviews[0].followUp.response.acknowledged,
    (x: any) => (x.state.use.goalReviews[0].followUp.review.actor = "leo"),
    (x: any) => (x.state.use.goalReviews[0].followUp.delivery.id = "wrong"),
    (x: any) => (x.format = "forge.knowledge-workspace.v9"),
  ]) {
    const x = JSON.parse(raw);
    change(x);
    expect(() => parseKnowledgeCheckpoint(JSON.stringify(x))).toThrow();
  }
});
test("positive closure stays scoped; decline, clarification, rejected result and cancellation preserve tasks; stale sources cannot be reused", () => {
  const positive = completed(true);
  const closed = reviewGoal(
    positive.use,
    positive.use.subject,
    "Goal met in simulation",
    "Reader tasks met the simulated criterion",
    "Only exact cohort and material; not real-world proof",
    at,
  );
  expect(goalProgress(closed)?.actor).toBeUndefined();
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...positive, use: closed }),
    ).state.use,
  ).toEqual(closed);
  const w = completed();
  let s = offered(w.use);
  s = respondGoalTask(
    s,
    s.subject,
    "leo",
    "Clarification requested",
    "Need task coverage details",
    at,
  );
  s = reviewGoal(
    s,
    s.subject,
    "Further work required",
    "Clarified task scope",
    "Fictional cohort only",
    at,
    work,
  );
  s = respondGoalTask(s, s.subject, "leo", "Declined", "Unavailable", at);
  s = offered(s);
  s = respondGoalTask(
    s,
    s.subject,
    "leo",
    "Accepted",
    "Scope inspected",
    at,
    true,
  );
  s = deliverGoalTask(s, s.subject, "leo", "Incomplete simulated output", at);
  s = assessGoalTask(
    s,
    s.subject,
    "Revision needed",
    "Missing coverage limits",
    at,
  );
  s = offered(s);
  const c3 = nextVersion(w.contribution),
    newSubject = assessedUseSubject(c3)!;
  expect(
    respondGoalTask(
      s,
      newSubject,
      "leo",
      "Accepted",
      "Changed source",
      at,
      true,
    ),
  ).toBe(s);
  expect(
    startMaterialUse(
      s,
      newSubject,
      "Cohort three",
      "Pending work cannot disappear",
      at,
    ),
  ).toBe(s);
  s = cancelGoalTask(s, "Source changed; replan explicitly", at);
  const fresh = startMaterialUse(
    s,
    newSubject,
    "Cohort three",
    "Fresh mandate after task cancellation",
    at,
  );
  expect(fresh.previousMaterials?.[0].goalReviews).toHaveLength(4);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...w, contribution: c3, use: fresh }),
    ).state.use,
  ).toEqual(fresh);
  let bounded = closed;
  for (let i = 1; i < 10; i++)
    bounded = reviewGoal(
      bounded,
      bounded.subject,
      "Goal met in simulation",
      "Reconfirmed bounded simulation",
      "No real-world proof",
      at,
    );
  expect(bounded.goalReviews).toHaveLength(10);
  expect(
    reviewGoal(
      bounded,
      bounded.subject,
      "Goal met in simulation",
      "Over bound",
      "No proof",
      at,
    ),
  ).toBe(bounded);
  expect(
    parseKnowledgeCheckpoint(
      encodeKnowledgeCheckpoint({ ...positive, use: bounded }),
    ).state.use,
  ).toEqual(bounded);
});
for (const width of [320, 1440])
  test(`goal decision, follow-up acceptance/delivery/review and recovery ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(
      ({ key, raw }) => {
        if (!localStorage.getItem(key)) localStorage.setItem(key, raw);
      },
      {
        key: knowledgeCheckpointKey,
        raw: encodeKnowledgeCheckpoint(completed()),
      },
    );
    await page.goto("/#/organizations/knowledge/use/K-01");
    const recovery = page.getByText(
      "Save or restore whole Knowledge workspace",
      { exact: true },
    );
    await recovery.click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    const loop = page.getByRole("region", {
      name: "Goal outcome and follow-up",
      exact: true,
    });
    const history = page.getByText(
      "Current cycle · evidence and decision history",
      { exact: true },
    );
    await expect(history.locator("..")).not.toHaveAttribute("open", "");
    const evidence = loop.getByText("Exact outcome, material and evidence", {
      exact: true,
    });
    await expect(evidence.locator("..")).not.toHaveAttribute("open", "");
    await evidence.click();
    await expect(loop.locator("pre").first()).toContainText("readerEvidence");
    await evidence.click();
    expect(
      await loop
        .getByLabel("Goal loop actor", { exact: true })
        .evaluate(
          (el) => el.getBoundingClientRect().width <= window.innerWidth,
        ),
    ).toBe(true);
    await expect(
      loop.getByRole("option", { name: "Goal met in simulation", exact: true }),
    ).toHaveAttribute("disabled", "");
    await loop
      .getByLabel("Goal scope limits and remaining uncertainty", {
        exact: true,
      })
      .fill(
        "Fictional cohort only; reader coverage and real usefulness remain unknown",
      );
    await loop
      .getByLabel("Follow-up title", { exact: true })
      .fill("Collect exact reader task observations");
    await loop
      .getByLabel("Follow-up expected result and acceptance criterion", {
        exact: true,
      })
      .fill(
        "Describe tasks, coverage, failures and limits for this guide and cohort",
      );
    await loop
      .getByLabel("Goal loop rationale", { exact: true })
      .fill(
        "Outcome shows insufficient evidence; allocate follow-up separately",
      );
    await loop
      .getByRole("button", { name: "Review goal loop record", exact: true })
      .click();
    await loop
      .getByRole("button", { name: "Cancel goal loop record", exact: true })
      .click();
    await expect(loop).toContainText(
      "Owner must separately decide goal status",
    );
    await loop
      .getByRole("button", { name: "Review goal loop record", exact: true })
      .click();
    await loop
      .getByRole("button", {
        name: "Record goal loop change locally",
        exact: true,
      })
      .click();
    await expect(
      loop.getByRole("heading", {
        name: "Outcome → organizational goal → next work",
        exact: true,
      }),
    ).toBeFocused();
    await page
      .getByRole("button", {
        name: "Open local inbox · Leo · execution / reader observer",
        exact: true,
      })
      .click();
    await expect(
      page.getByRole("region", {
        name: "Local use responsibility inbox",
        exact: true,
      }),
    ).toContainText("1 pending local responsibility");
    await page.evaluate(
      () => (location.hash = "/organizations/knowledge/use/K-01"),
    );
    await loop
      .getByLabel("Goal loop actor", { exact: true })
      .selectOption("leo");
    await loop
      .getByLabel("Goal loop rationale", { exact: true })
      .fill("Inspected goal, outcome, expected result and limits");
    await expect(
      loop.getByRole("button", {
        name: "Review goal loop record",
        exact: true,
      }),
    ).toBeDisabled();
    await loop
      .getByLabel(
        "I inspected the exact goal, outcome, expected result and scope limits",
        { exact: true },
      )
      .check();
    await loop
      .getByRole("button", { name: "Review goal loop record", exact: true })
      .click();
    await loop
      .getByRole("button", {
        name: "Record goal loop change locally",
        exact: true,
      })
      .click();
    await loop
      .getByLabel("Follow-up result and limitations", { exact: true })
      .fill(
        "Simulated task notes identify missing coverage; no actual reader results claimed",
      );
    await loop
      .getByRole("button", { name: "Review goal loop record", exact: true })
      .click();
    await loop
      .getByRole("button", {
        name: "Record goal loop change locally",
        exact: true,
      })
      .click();
    await loop
      .getByLabel("Goal loop actor", { exact: true })
      .selectOption("owner");
    await loop
      .getByLabel("Goal loop rationale", { exact: true })
      .fill(
        "Accepted task output within requested scope; original outcome remains insufficient",
      );
    await loop
      .getByRole("button", { name: "Review goal loop record", exact: true })
      .click();
    await loop
      .getByRole("button", {
        name: "Record goal loop change locally",
        exact: true,
      })
      .click();
    await expect(loop).toContainText("Reassess goal after follow-up");
    await expect(loop).toContainText("Original outcome: Insufficient evidence");
    await expect(
      loop.getByRole("option", { name: "Goal met in simulation", exact: true }),
    ).toHaveAttribute("disabled", "");
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
    await recovery.click();
    await page
      .getByRole("button", { name: "Review saved workspace", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: "Confirm workspace replacement",
        exact: true,
      })
      .click();
    await expect(loop).toContainText("Owner review: Accepted result");
    await expect(loop).toContainText("Original outcome: Insufficient evidence");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
test("positive simulated outcome can close its scoped goal without creating a follow-up", async ({
  page,
}) => {
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: knowledgeCheckpointKey,
    raw: encodeKnowledgeCheckpoint(completed(true)),
  });
  await page.goto("/#/organizations/knowledge/use/K-01");
  await page
    .getByText("Save or restore whole Knowledge workspace", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review saved workspace", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm workspace replacement", exact: true })
    .click();
  const loop = page.getByRole("region", {
    name: "Goal outcome and follow-up",
    exact: true,
  });
  await loop
    .getByLabel("Goal decision", { exact: true })
    .selectOption("Goal met in simulation");
  await expect(loop.getByLabel("Follow-up title", { exact: true })).toHaveCount(
    0,
  );
  await loop
    .getByLabel("Goal scope limits and remaining uncertainty", { exact: true })
    .fill("Only simulated cohort; real reader evidence remains unverified");
  await loop
    .getByLabel("Goal loop rationale", { exact: true })
    .fill("Exact simulated outcome met the represented criterion");
  await loop
    .getByRole("button", { name: "Review goal loop record", exact: true })
    .click();
  await loop
    .getByRole("button", {
      name: "Record goal loop change locally",
      exact: true,
    })
    .click();
  await expect(loop).toContainText("No pending goal action");
  await expect(loop).toContainText(
    "No real organizational outcome is verified",
  );
  await page.evaluate(
    () => (location.hash = "/organizations/knowledge/workstreams/K-01"),
  );
  await expect(
    page.getByText("Local simulation · Goal met in this simulation", {
      exact: true,
    }),
  ).toBeVisible();
});
